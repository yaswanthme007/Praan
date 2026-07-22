from contextlib import asynccontextmanager
import asyncio
import random
from datetime import datetime
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update
from app.config import settings
from app.db.session import AsyncSessionLocal
from app.api.routes.safety import router as safety_router, get_kpis
from app.models.safety import Sensor, Zone, Worker, Permit, Maintenance, Alert, RiskHistory
from app.engine.scoring import evaluate_compound_risk

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WS client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"WS client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

# Background Task for Live SCADA Drift & Risk Evaluation
async def live_scada_drift_and_broadcast_loop():
    print("Starting background SCADA telemetry loop...")
    while True:
        try:
            await asyncio.sleep(2.0)
            # Drift and update database continuously for demo realism
            async with AsyncSessionLocal() as session:
                # 1. Fetch all zones
                zones_res = await session.execute(select(Zone).where(Zone.is_deleted == False))
                zones = zones_res.scalars().all()

                # 2. Fetch all workers, permits, maintenance
                workers_res = await session.execute(select(Worker).where(Worker.is_deleted == False))
                all_workers = workers_res.scalars().all()

                permits_res = await session.execute(select(Permit).where(Permit.is_deleted == False))
                all_permits = permits_res.scalars().all()

                maint_res = await session.execute(select(Maintenance).where(Maintenance.is_deleted == False))
                all_maintenances = maint_res.scalars().all()

                # 3. Fetch all sensors
                sensors_res = await session.execute(select(Sensor).where(Sensor.is_deleted == False))
                all_sensors = sensors_res.scalars().all()

                # List to track updated sensors
                updated_sensors_data = []

                # Drift each sensor value and save to DB
                for s in all_sensors:
                    # Determine drift bounds based on sensor thresholds
                    limit = s.crit_threshold / 40.0
                    drift = (random.random() - 0.48) * limit # Slight upward bias
                    new_val = max(0.0, s.value + drift)
                    
                    # Oxygen logic
                    if s.type == "OXYGEN":
                        status = "critical" if new_val < s.crit_threshold else ("elevated" if new_val < s.warn_threshold else "safe")
                    else:
                        status = "critical" if new_val > s.crit_threshold else ("elevated" if new_val > s.warn_threshold else "safe")

                    # Update history array
                    new_history = list(s.history[1:]) + [round(new_val, 1)]

                    s.value = round(new_val, 1)
                    s.status = status
                    s.history = new_history

                    updated_sensors_data.append({
                        "id": s.id,
                        "code": s.code,
                        "name": s.name,
                        "type": s.type,
                        "unit": s.unit,
                        "zoneId": s.zone_id,
                        "value": s.value,
                        "threshold": {"warn": s.warn_threshold, "crit": s.crit_threshold},
                        "status": s.status,
                        "x": s.x,
                        "y": s.y,
                        "history": s.history,
                        "lastCalibrated": s.last_calibrated
                    })

                # 4. Evaluate Compound Risk for each Zone
                updated_zones_data = []
                for zone in zones:
                    # Filter zone specific items
                    z_sensors = [s for s in updated_sensors_data if s["zoneId"] == zone.id]
                    z_workers = [
                        {"id": w.id, "status": w.status} 
                        for w in all_workers if w.zone_id == zone.id
                    ]
                    z_permits = [
                        {"type": p.type, "status": p.status} 
                        for p in all_permits if p.zone_id == zone.id
                    ]
                    z_maintenances = [
                        {"status": m.status} 
                        for m in all_maintenances if m.zone_id == zone.id
                    ]

                    # Run calculation engine
                    res = evaluate_compound_risk(
                        zone_code=zone.code,
                        sensors=z_sensors,
                        workers=z_workers,
                        permits=z_permits,
                        maintenances=z_maintenances
                    )

                    # Update zone risk in DB
                    zone.risk = res["score"]
                    
                    updated_zones_data.append({
                        "id": zone.id,
                        "code": zone.code,
                        "name": zone.name,
                        "type": zone.type,
                        "x": zone.x, "y": zone.y, "w": zone.w, "h": zone.h,
                        "risk": zone.risk,
                        "workers": len([w for w in z_workers if w["status"] in ["ACTIVE", "EMERGENCY"]]),
                        "riskDetails": res
                    })

                    # If rule CR-014 or CR-021 triggered, ensure a critical alert exists in DB
                    if res["triggeredRule"] and res["score"] >= 75:
                        # Check if a critical alert for this rule was raised recently (< 1m ago)
                        recent_alert_res = await session.execute(
                            select(Alert).where(
                                Alert.zone_id == zone.id, 
                                Alert.severity == "critical",
                                Alert.ack == False
                            )
                        )
                        existing_alert = recent_alert_res.scalar_one_or_none()
                        
                        if not existing_alert:
                            new_alert = Alert(
                                id=f"a_auto_{int(datetime.utcnow().timestamp())}",
                                severity="critical",
                                title=f"Compound Risk {res['triggeredRule']['code']} triggered",
                                zone_id=zone.id,
                                detail=f"{res['triggeredRule']['name']}. Recommended: {res['recommendedAction']}",
                                ts=datetime.utcnow().isoformat() + "Z",
                                ack=False,
                                category="COMPOUND"
                            )
                            session.add(new_alert)

                await session.commit()

                # 5. Fetch KPIs
                kpis = await get_kpis(session)

                # 6. Broadcast to WebSockets
                payload = {
                    "type": "telemetry",
                    "payload": {
                        "kpis": kpis.model_dump(by_alias=True),
                        "sensors": updated_sensors_data,
                        "zones": updated_zones_data,
                        "ts": datetime.utcnow().isoformat() + "Z"
                    }
                }
                await ws_manager.broadcast(payload)
                
        except Exception as e:
            print(f"Error in background telemetry loop: {e}")
            await asyncio.sleep(5.0)

# Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch background loop
    loop_task = asyncio.create_task(live_scada_drift_and_broadcast_loop())
    yield
    # Shutdown: Cancel background loop
    loop_task.cancel()
    try:
        await loop_task
    except asyncio.CancelledError:
        pass

# Initialize App
app = FastAPI(
    title="Praan Safety Intelligence Backend",
    description="Compound risk detection engine for zero-harm industrial operations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include safety routers
app.include_router(safety_router)

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and receive message if sent
            data = await websocket.receive_text()
            # Echo or process if needed
            await websocket.send_json({"status": "received", "echo": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Praan Industrial Safety Intelligence API",
        "docs": "/docs"
    }
