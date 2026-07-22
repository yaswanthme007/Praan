from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.deps import create_access_token, get_current_user
from app.models.safety import (
    Plant, Zone, Sensor, Worker, Permit, Maintenance,
    Alert, Incident, CompoundRule, RiskHistory, ActivityFeedItem, Weather
)
from app.schemas.safety import (
    PlantSchema, ZoneSchema, SensorSchema, WorkerSchema, PermitSchema,
    MaintenanceSchema, AlertSchema, IncidentSchema, CompoundRuleSchema,
    KpiSchema, WeatherSchema, RiskTrendItemSchema, SafetyRegulationSchema,
    ActivityFeedItemSchema, AlertAckResponse, EmergencyBroadcastResponse,
    LoginRequest, LoginResponse, UserProfileSchema
)
from app.engine.scoring import evaluate_compound_risk

router = APIRouter(prefix="/api")

@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    if login_data.email == "priya.kapoor@praan.io" and login_data.password == "mission-critical-2026":
        access_token = create_access_token(data={"sub": login_data.email, "name": "Priya Kapoor", "role": "Safety Officer"})
        return LoginResponse(
            accessToken=access_token,
            tokenType="bearer",
            user=UserProfileSchema(
                name="Priya Kapoor",
                email=login_data.email,
                role="Safety Officer"
            )
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"}
    )

@router.get("/kpis", response_model=KpiSchema)
async def get_kpis(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Query permit counts
    active_permits_res = await db.execute(
        select(func.count(Permit.id)).where(Permit.status == "ACTIVE", Permit.is_deleted == False)
    )
    active_permits = active_permits_res.scalar_one()

    # Query active maintenance
    active_maint_res = await db.execute(
        select(func.count(Maintenance.id)).where(Maintenance.status == "IN PROGRESS", Maintenance.is_deleted == False)
    )
    active_maint = active_maint_res.scalar_one()

    # Query workers on site
    workers_res = await db.execute(
        select(func.count(Worker.id)).where(Worker.status.in_(["ACTIVE", "EMERGENCY"]), Worker.is_deleted == False)
    )
    workers_on_site = workers_res.scalar_one()

    # Query open incidents
    incidents_res = await db.execute(
        select(func.count(Incident.id)).where(Incident.status != "RESOLVED", Incident.is_deleted == False)
    )
    open_incidents = incidents_res.scalar_one()

    # Query sensors
    sensors_total_res = await db.execute(
        select(func.count(Sensor.id)).where(Sensor.is_deleted == False)
    )
    sensors_total = sensors_total_res.scalar_one()

    sensors_crit_res = await db.execute(
        select(func.count(Sensor.id)).where(Sensor.status == "critical", Sensor.is_deleted == False)
    )
    sensors_critical = sensors_crit_res.scalar_one()

    # Calculate plant risk from zones max risk
    zones_risk_res = await db.execute(
        select(func.max(Zone.risk)).where(Zone.is_deleted == False)
    )
    max_zone_risk = zones_risk_res.scalar() or 0

    return KpiSchema(
        compound_risk=max_zone_risk,
        active_permits=active_permits,
        active_maint=active_maint,
        workers_on_site=workers_on_site,
        open_incidents=open_incidents,
        sensors_online=sensors_total,
        sensors_critical=sensors_critical
    )

@router.get("/weather", response_model=WeatherSchema)
async def get_weather(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Weather).where(Weather.id == "weather_singleton"))
    weather = result.scalar_one_or_none()
    if not weather:
        raise HTTPException(status_code=404, detail="Weather not seeded")
    return WeatherSchema.model_validate(weather)

@router.get("/plants", response_model=List[PlantSchema])
async def get_plants(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Plant).where(Plant.is_deleted == False))
    return [PlantSchema.model_validate(p) for p in result.scalars().all()]

@router.get("/zones", response_model=List[ZoneSchema])
async def get_zones(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Zone).where(Zone.is_deleted == False))
    return [ZoneSchema.model_validate(z) for z in result.scalars().all()]

@router.get("/sensors", response_model=List[SensorSchema])
async def get_sensors(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Sensor).where(Sensor.is_deleted == False))
    sensors = result.scalars().all()
    out = []
    for s in sensors:
        out.append(SensorSchema(
            id=s.id,
            code=s.code,
            name=s.name,
            type=s.type,
            unit=s.unit,
            zoneId=s.zone_id,
            value=s.value,
            threshold={"warn": s.warn_threshold, "crit": s.crit_threshold},
            status=s.status,
            x=s.x,
            y=s.y,
            history=s.history,
            lastCalibrated=s.last_calibrated
        ))
    return out

@router.get("/workers", response_model=List[WorkerSchema])
async def get_workers(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Worker).where(Worker.is_deleted == False))
    workers = result.scalars().all()
    return [
        WorkerSchema(
            id=w.id,
            name=w.name,
            role=w.role,
            avatar=w.avatar,
            zoneId=w.zone_id,
            status=w.status,
            vitals={"hr": w.heart_rate, "temp": w.temperature},
            x=w.x,
            y=w.y
        ) for w in workers
    ]

@router.get("/permits", response_model=List[PermitSchema])
async def get_permits(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Permit).where(Permit.is_deleted == False))
    return [PermitSchema.model_validate(p) for p in result.scalars().all()]

@router.get("/maintenance", response_model=List[MaintenanceSchema])
async def get_maintenance(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Maintenance).where(Maintenance.is_deleted == False))
    return [MaintenanceSchema.model_validate(m) for m in result.scalars().all()]

@router.get("/rules", response_model=List[CompoundRuleSchema])
async def get_rules(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(CompoundRule).where(CompoundRule.is_deleted == False))
    return [CompoundRuleSchema.model_validate(r) for r in result.scalars().all()]

@router.get("/alerts", response_model=List[AlertSchema])
async def get_alerts(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Alert).where(Alert.is_deleted == False).order_by(Alert.ts.desc()))
    return [AlertSchema.model_validate(a) for a in result.scalars().all()]

@router.get("/incidents", response_model=List[IncidentSchema])
async def get_incidents(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Incident).where(Incident.is_deleted == False).order_by(Incident.opened.desc()))
    return [IncidentSchema.model_validate(i) for i in result.scalars().all()]

@router.get("/risk-history", response_model=List[RiskTrendItemSchema])
async def get_risk_history(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(RiskHistory).where(RiskHistory.is_deleted == False).order_by(RiskHistory.t.asc()))
    return [RiskTrendItemSchema.model_validate(rh) for rh in result.scalars().all()]

@router.get("/regulations", response_model=List[SafetyRegulationSchema])
async def get_regulations(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # We can map Safety Regulations from rules count
    result = await db.execute(select(CompoundRule).where(CompoundRule.is_deleted == False))
    rules = result.scalars().all()
    # Mock some triggered counts
    triggered_map = {
        "OSHA 1910.119": 4,
        "OSHA 1910.146": 2,
        "IS 15656": 3,
        "API 618": 1,
        "API 2350": 0,
        "IEC 61511": 2,
    }
    regs = []
    for code, triggered in triggered_map.items():
        title = "Regulation Title"
        region = "Global"
        if "OSHA" in code:
            region = "US"
            title = "Process Safety Management" if "119" in code else "Permit-required Confined Spaces"
        elif "IS" in code:
            region = "IN"
            title = "Hazard Identification & Risk Analysis (India)"
        elif "API" in code:
            title = "Reciprocating Compressors" if "618" in code else "Overfill Protection for Storage Tanks"
        regs.append(SafetyRegulationSchema(code=code, title=title, region=region, triggered=triggered))
    return regs

@router.get("/activity-feed", response_model=List[ActivityFeedItemSchema])
async def get_activity_feed(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(ActivityFeedItem).where(ActivityFeedItem.is_deleted == False).order_by(ActivityFeedItem.ts.desc()))
    return [ActivityFeedItemSchema.model_validate(af) for af in result.scalars().all()]

@router.post("/alerts/{alert_id}/ack", response_model=AlertAckResponse)
async def ack_alert(alert_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.is_deleted == False))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.ack = True
    await db.commit()

    # Log to Activity Feed
    new_act = ActivityFeedItem(
        id=f"af_ack_{alert_id}_{int(datetime.utcnow().timestamp())}",
        ts=datetime.utcnow().isoformat() + "Z",
        actor=current_user.get("name", "Priya Kapoor"),
        text=f"acknowledged alert: {alert.title}"
    )
    db.add(new_act)
    await db.commit()

    return AlertAckResponse(success=True, message=f"Alert {alert_id} acknowledged successfully")

@router.post("/emergency/broadcast", response_model=EmergencyBroadcastResponse)
async def broadcast_emergency(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # 1. Update all workers in Zone 'z1' to EMERGENCY status
    await db.execute(
        update(Worker).where(Worker.zone_id == "z1", Worker.is_deleted == False).values(status="EMERGENCY")
    )

    # 2. Add an evacuation alert
    now_iso = datetime.utcnow().isoformat() + "Z"
    new_alert = Alert(
        id=f"a_emerg_{int(datetime.utcnow().timestamp())}",
        severity="critical",
        title="EVACUATION PROTOCOL ACTIVE",
        zone_id="z1",
        detail="Zone Z-01 evacuation broadcast initiated by Control Room.",
        ts=now_iso,
        ack=False,
        category="SYSTEM",
        assignee="Response Team A"
    )
    db.add(new_alert)

    # 3. Log to activity feed
    new_act = ActivityFeedItem(
        id=f"af_emerg_{int(datetime.utcnow().timestamp())}",
        ts=now_iso,
        actor=current_user.get("name", "Control Room"),
        text="initiated PA broadcast & evacuation warning in Reactor Bay A"
    )
    db.add(new_act)

    await db.commit()

    return EmergencyBroadcastResponse(
        success=True,
        incident_id="i1",
        message="Emergency broadcast initiated. Workers alerted. Evacuation protocol active."
    )

@router.post("/emergency/stand-down", response_model=AlertAckResponse)
async def stand_down_emergency(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Restore workers in Zone 'z1' to ACTIVE
    await db.execute(
        update(Worker).where(Worker.zone_id == "z1", Worker.status == "EMERGENCY", Worker.is_deleted == False).values(status="ACTIVE")
    )

    now_iso = datetime.utcnow().isoformat() + "Z"
    new_act = ActivityFeedItem(
        id=f"af_std_{int(datetime.utcnow().timestamp())}",
        ts=now_iso,
        actor=current_user.get("name", "Priya Kapoor"),
        text="stood down emergency command for Reactor Bay A"
    )
    db.add(new_act)
    await db.commit()

    return AlertAckResponse(success=True, message="Emergency stand down complete.")

@router.get("/mock-data")
async def get_mock_data(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    Consolidated mock data structure matching mock.ts exactly.
    Used by the frontend to fetch the complete initial state in one go.
    """
    # 1. Fetch KPI
    kpi_schema = await get_kpis(db, current_user)
    
    # 2. Fetch Weather
    weather_schema = await get_weather(db, current_user)

    # 3. Fetch Plants
    plants_schema = await get_plants(db, current_user)

    # 4. Fetch Zones
    zones_schema = await get_zones(db, current_user)

    # 5. Fetch Sensors
    sensors_schema = await get_sensors(db, current_user)

    # 6. Fetch Workers
    workers_schema = await get_workers(db, current_user)

    # 7. Fetch Permits
    permits_schema = await get_permits(db, current_user)

    # 8. Fetch Maintenance
    maint_schema = await get_maintenance(db, current_user)

    # 9. Fetch Rules
    rules_schema = await get_rules(db, current_user)

    # 10. Fetch Alerts
    alerts_schema = await get_alerts(db, current_user)

    # 11. Fetch Incidents
    incidents_schema = await get_incidents(db, current_user)

    # 12. Fetch Risk History
    risk_history_schema = await get_risk_history(db, current_user)

    # 13. Fetch Regulations
    regs_schema = await get_regulations(db, current_user)

    # 14. Fetch Activity Feed
    activity_schema = await get_activity_feed(db, current_user)

    return {
        "kpis": kpi_schema.model_dump(by_alias=True),
        "weather": weather_schema.model_dump(by_alias=True),
        "plants": [p.model_dump(by_alias=True) for p in plants_schema],
        "zones": [z.model_dump(by_alias=True) for z in zones_schema],
        "sensors": [s.model_dump(by_alias=True) for s in sensors_schema],
        "workers": [w.model_dump(by_alias=True) for w in workers_schema],
        "permits": [p.model_dump(by_alias=True) for p in permits_schema],
        "maintenance": [m.model_dump(by_alias=True) for m in maint_schema],
        "compoundRules": [r.model_dump(by_alias=True) for r in rules_schema],
        "initialAlerts": [a.model_dump(by_alias=True) for a in alerts_schema],
        "incidents": [i.model_dump(by_alias=True) for i in incidents_schema],
        "riskHistory24h": [rh.model_dump(by_alias=True) for rh in risk_history_schema],
        "safetyRegulations": [reg.model_dump(by_alias=True) for reg in regs_schema],
        "activityFeed": [af.model_dump(by_alias=True) for af in activity_schema]
    }
