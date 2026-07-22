import asyncio
from datetime import datetime, timedelta
import json
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.safety import (
    Plant, Zone, Sensor, Worker, Permit, Maintenance,
    Alert, Incident, CompoundRule, RiskHistory, ActivityFeedItem, Weather
)

# Helper: Deterministic pseudo-random number generator
def seed_random(seed: int):
    s = seed
    def rand():
        nonlocal s
        s = (s * 9301 + 49297) % 233280
        return s / 233280
    return rand

async def seed_db():
    print("Connecting to DB for seeding...")
    # Make sure tables exist
    async with engine.begin() as conn:
        # Create all tables (for demo/hackathon ease, we can let SQLAlchemy create them)
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables verified.")

    async with AsyncSessionLocal() as session:
        # Clear existing data
        print("Clearing old data...")
        await session.execute(delete(Weather))
        await session.execute(delete(ActivityFeedItem))
        await session.execute(delete(RiskHistory))
        await session.execute(delete(CompoundRule))
        await session.execute(delete(Incident))
        await session.execute(delete(Alert))
        await session.execute(delete(Maintenance))
        await session.execute(delete(Permit))
        await session.execute(delete(Worker))
        await session.execute(delete(Sensor))
        await session.execute(delete(Zone))
        await session.execute(delete(Plant))
        await session.commit()
        print("Data cleared.")

        # 1. Plants
        print("Seeding plants...")
        plants_data = [
            {"id": "pl1", "code": "IN-JMN-01", "name": "Jamnagar Refinery Cluster", "location": "Gujarat, India", "status": "OPERATIONAL", "risk": 74, "workers": 218, "sensors": 812},
            {"id": "pl2", "code": "IN-VZG-02", "name": "Vizag Petrochem", "location": "Andhra Pradesh, India", "status": "OPERATIONAL", "risk": 41, "workers": 164, "sensors": 604},
            {"id": "pl3", "code": "IN-BHR-03", "name": "Bharuch Specialty Chem", "location": "Gujarat, India", "status": "MAINTENANCE", "risk": 22, "workers": 89, "sensors": 412},
            {"id": "pl4", "code": "SG-JUR-04", "name": "Jurong Aromatics", "location": "Singapore", "status": "OPERATIONAL", "risk": 58, "workers": 141, "sensors": 522},
            {"id": "pl5", "code": "AE-RAK-05", "name": "RAK Downstream", "location": "Ras Al Khaimah, UAE", "status": "STANDBY", "risk": 12, "workers": 34, "sensors": 208},
        ]
        for p in plants_data:
            session.add(Plant(**p))
        await session.commit()

        # 2. Zones
        print("Seeding zones...")
        zones_data = [
            {"id": "z1", "code": "Z-01", "name": "Reactor Bay A", "type": "PROCESS", "x": 4, "y": 6, "w": 26, "h": 34, "risk": 82, "workers": 4, "plant_id": "pl1"},
            {"id": "z2", "code": "Z-02", "name": "Cracker Unit", "type": "PROCESS", "x": 32, "y": 6, "w": 22, "h": 34, "risk": 58, "workers": 2, "plant_id": "pl1"},
            {"id": "z3", "code": "Z-03", "name": "Tank Farm North", "type": "STORAGE", "x": 56, "y": 4, "w": 40, "h": 22, "risk": 34, "workers": 1, "plant_id": "pl1"},
            {"id": "z4", "code": "Z-04", "name": "Compressor Hall", "type": "UTILITY", "x": 56, "y": 28, "w": 22, "h": 16, "risk": 22, "workers": 3, "plant_id": "pl1"},
            {"id": "z5", "code": "Z-05", "name": "Cooling Tower B", "type": "UTILITY", "x": 80, "y": 28, "w": 16, "h": 16, "risk": 12, "workers": 0, "plant_id": "pl1"},
            {"id": "z6", "code": "Z-06", "name": "Control Room", "type": "CONTROL", "x": 4, "y": 42, "w": 22, "h": 14, "risk": 4, "workers": 6, "plant_id": "pl1"},
            {"id": "z7", "code": "Z-07", "name": "Loading Bay", "type": "LOADING", "x": 28, "y": 42, "w": 26, "h": 14, "risk": 18, "workers": 2, "plant_id": "pl1"},
            {"id": "z8", "code": "Z-08", "name": "Utilities Corridor", "type": "UTILITY", "x": 56, "y": 46, "w": 40, "h": 10, "risk": 8, "workers": 1, "plant_id": "pl1"},
            {"id": "z9", "code": "Z-09", "name": "Feedstock Pipeline", "type": "PROCESS", "x": 4, "y": 58, "w": 52, "h": 8, "risk": 41, "workers": 0, "plant_id": "pl1"},
            {"id": "z10", "code": "Z-10", "name": "Effluent Treatment", "type": "UTILITY", "x": 58, "y": 58, "w": 38, "h": 12, "risk": 14, "workers": 1, "plant_id": "pl1"},
        ]
        for z in zones_data:
            session.add(Zone(**z))
        await session.commit()

        # 3. Sensors (with deterministic randomized values matching mock.ts)
        print("Seeding sensors...")
        sensor_seed = seed_random(42)
        types = ["GAS", "TEMP", "PRESSURE", "FLOW", "VIBRATION", "SMOKE", "OXYGEN"]
        unit_map = {
            "GAS": "ppm", "TEMP": "°C", "PRESSURE": "bar", "FLOW": "m³/h", "VIBRATION": "mm/s", "SMOKE": "%", "OXYGEN": "%"
        }
        range_map = {
            "GAS": [0.0, 60.0, 25.0, 45.0],
            "TEMP": [20.0, 180.0, 120.0, 160.0],
            "PRESSURE": [0.0, 12.0, 8.0, 10.5],
            "FLOW": [0.0, 400.0, 300.0, 380.0],
            "VIBRATION": [0.0, 12.0, 7.0, 10.0],
            "SMOKE": [0.0, 8.0, 3.0, 5.0],
            "OXYGEN": [16.0, 22.0, 19.0, 17.5],
        }

        for i in range(42):
            zone = zones_data[i % len(zones_data)]
            stype = types[i % len(types)]
            lo, hi, warn, crit = range_map[stype]
            val = lo + sensor_seed() * (hi - lo)
            history = [lo + sensor_seed() * (hi - lo) for _ in range(40)]
            
            if stype == "OXYGEN":
                status = "critical" if val < crit else ("elevated" if val < warn else "safe")
            else:
                status = "critical" if val > crit else ("elevated" if val > warn else "safe")

            s_id = f"s{i + 1}"
            code = f"{stype[:2]}-{i + 101}"
            name = f"{stype[0].upper() + stype[1:].lower()} · {zone['code']}"
            last_calibrated = f"2025-{(1 + (i % 12)):02d}-{(1 + (i % 27)):02d}"

            session.add(Sensor(
                id=s_id,
                code=code,
                name=name,
                type=stype,
                unit=unit_map[stype],
                zone_id=zone["id"],
                value=round(val, 1),
                warn_threshold=warn,
                crit_threshold=crit,
                status=status,
                x=round(zone["x"] + 4 + sensor_seed() * (zone["w"] - 8), 1),
                y=round(zone["y"] + 4 + sensor_seed() * (zone["h"] - 8), 1),
                history=[round(v, 1) for v in history],
                last_calibrated=last_calibrated
            ))
        await session.commit()

        # 4. Workers
        print("Seeding workers...")
        worker_seed = seed_random(7)
        worker_avatars = [
            "https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
            "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=200&h=200",
        ]
        worker_names_roles = [
            ("Arjun Mehta", "Field Engineer"), ("Priya Kapoor", "Safety Officer"), ("Nikhil Rao", "Ops Technician"),
            ("Rhea D'Souza", "Instrumentation"), ("Vikram Shah", "Turnaround Lead"), ("Sana Iyer", "Boiler Ops"),
            ("Danish Khan", "HSE Auditor"), ("Ishaan Verma", "Electrical Tech"), ("Tara Sinha", "Env. Analyst"),
            ("Zoya Bhat", "Control Op."), ("Farhan Ali", "Contractor"), ("Meera Nair", "Response Team"),
            ("Karan Puri", "Response Team"), ("Anjali Rao", "Response Team"), ("Rohit Datta", "SCADA Eng."),
            ("Sameer Joshi", "Maintenance"), ("Lea Fernandes", "Rope Access"), ("Yash Trivedi", "Loader Op."),
        ]
        statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "BREAK", "ACTIVE", "OFFDUTY"]
        
        for idx, (name, role) in enumerate(worker_names_roles):
            zone = zones_data[idx % len(zones_data)]
            w_status = "EMERGENCY" if idx == 4 else statuses[idx % len(statuses)]
            session.add(Worker(
                id=f"w{idx + 1}",
                name=name,
                role=role,
                avatar=worker_avatars[idx % len(worker_avatars)],
                zone_id=zone["id"],
                status=w_status,
                heart_rate=int(60 + worker_seed() * 40),
                temperature=round(36.0 + worker_seed() * 2.0, 1),
                x=round(zone["x"] + 4 + worker_seed() * (zone["w"] - 8), 1),
                y=round(zone["y"] + 4 + worker_seed() * (zone["h"] - 8), 1),
            ))
        await session.commit()

        # 5. Permits
        print("Seeding permits...")
        permits_data = [
            { "id": "p1", "code": "PTW-2041", "type": "HOT WORK", "zone_id": "z1", "contractor": "Weldtech Ltd", "status": "ACTIVE", "opened": "2026-01-14T07:15:00Z", "expires": "2026-01-14T19:00:00Z" },
            { "id": "p2", "code": "PTW-2042", "type": "CONFINED SPACE", "zone_id": "z2", "contractor": "Ingress Corp", "status": "ACTIVE", "opened": "2026-01-14T06:30:00Z", "expires": "2026-01-14T18:30:00Z" },
            { "id": "p3", "code": "PTW-2043", "type": "HEIGHT", "zone_id": "z3", "contractor": "SkyLift", "status": "ACTIVE", "opened": "2026-01-14T08:00:00Z", "expires": "2026-01-14T17:00:00Z" },
            { "id": "p4", "code": "PTW-2044", "type": "ELECTRICAL", "zone_id": "z6", "contractor": "PowerGrid Services", "status": "PENDING", "opened": "2026-01-14T09:00:00Z", "expires": "2026-01-14T20:00:00Z" },
            { "id": "p5", "code": "PTW-2045", "type": "EXCAVATION", "zone_id": "z8", "contractor": "TerraDig", "status": "ACTIVE", "opened": "2026-01-13T11:00:00Z", "expires": "2026-01-14T23:00:00Z" },
            { "id": "p6", "code": "PTW-2039", "type": "HOT WORK", "zone_id": "z7", "contractor": "Weldtech Ltd", "status": "COMPLETED", "opened": "2026-01-13T05:00:00Z", "expires": "2026-01-13T17:00:00Z" },
            { "id": "p7", "code": "PTW-2037", "type": "HEIGHT", "zone_id": "z4", "contractor": "SkyLift", "status": "EXPIRED", "opened": "2026-01-12T08:00:00Z", "expires": "2026-01-12T17:00:00Z" },
        ]
        for p in permits_data:
            session.add(Permit(**p))
        await session.commit()

        # 6. Maintenance
        print("Seeding maintenance...")
        maint_data = [
            { "id": "m1", "code": "WO-8801", "equipment": "Reactor A Cooling Loop", "zone_id": "z1", "team": "TeamAlpha", "status": "IN PROGRESS", "progress": 62, "eta": "2h 14m" },
            { "id": "m2", "code": "WO-8802", "equipment": "Cracker Feed Valve V-204", "zone_id": "z2", "team": "TeamBravo", "status": "IN PROGRESS", "progress": 41, "eta": "3h 30m" },
            { "id": "m3", "code": "WO-8803", "equipment": "Compressor C-2 Rotor", "zone_id": "z4", "team": "TeamCharlie", "status": "IN PROGRESS", "progress": 88, "eta": "0h 18m" },
            { "id": "m4", "code": "WO-8804", "equipment": "Tank T-11 Level Sensor", "zone_id": "z3", "team": "InstrumentTech", "status": "SCHEDULED", "progress": 0, "eta": "Tomorrow" },
            { "id": "m5", "code": "WO-8805", "equipment": "Effluent Pump P-6", "zone_id": "z10", "team": "MechOps", "status": "COMPLETED", "progress": 100, "eta": "—" },
            { "id": "m6", "code": "WO-8806", "equipment": "Pipeline Cathodic Protection", "zone_id": "z9", "team": "CorroTech", "status": "OVERDUE", "progress": 10, "eta": "Late 4h" },
        ]
        for m in maint_data:
            session.add(Maintenance(**m))
        await session.commit()

        # 7. Rules
        print("Seeding rules...")
        rules_data = [
            {
                "id": "r1", "code": "CR-014", "name": "Hot Work + Rising Hydrocarbon + Workers In Zone",
                "conditions": ["Hot Work Permit ACTIVE", "Gas > 30ppm rising", "Worker count ≥ 3", "Wind toward zone"],
                "severity": "critical", "triggered": True, "regulation": "OSHA 1910.119 · IS 15656"
            },
            {
                "id": "r2", "code": "CR-021", "name": "Confined Space + Falling O₂ + Maintenance Running",
                "conditions": ["Confined Space Permit ACTIVE", "O₂ < 19.5%", "Maintenance IN PROGRESS in zone"],
                "severity": "critical", "triggered": True, "regulation": "OSHA 1910.146"
            },
            {
                "id": "r3", "code": "CR-008", "name": "Overpressure + Vibration Spike",
                "conditions": ["Pressure > 10.2 bar", "Vibration > 8mm/s for 5m"],
                "severity": "elevated", "triggered": True, "regulation": "API 618"
            },
            {
                "id": "r4", "code": "CR-032", "name": "Tank Overfill Precursor",
                "conditions": ["Tank level > 92%", "Flow-in > Flow-out for 15m", "Level sensor calibration overdue"],
                "severity": "elevated", "triggered": False, "regulation": "API 2350"
            },
            {
                "id": "r5", "code": "CR-047", "name": "Ambient Storm + Height Permit + Rope Access",
                "conditions": ["Wind > 45km/h", "Height Permit ACTIVE", "Worker at height detected"],
                "severity": "watch", "triggered": False, "regulation": "IS 3696"
            },
        ]
        for r in rules_data:
            session.add(CompoundRule(**r))
        await session.commit()

        # 8. Alerts
        print("Seeding alerts...")
        now = datetime.utcnow()
        alerts_data = [
            { "id": "a1", "severity": "critical", "title": "Compound Risk CR-014 triggered", "zone_id": "z1", "detail": "Hot Work + Rising HC + 4 workers inside Reactor Bay A.", "ts": (now - timedelta(seconds=45)).isoformat() + "Z", "ack": False, "category": "COMPOUND", "assignee": "Priya Kapoor" },
            { "id": "a2", "severity": "critical", "title": "Compound Risk CR-021 triggered", "zone_id": "z2", "detail": "Confined space entry with O₂ trending toward 19.2%.", "ts": (now - timedelta(minutes=3)).isoformat() + "Z", "ack": False, "category": "COMPOUND" },
            { "id": "a3", "severity": "elevated", "title": "Pressure trend near limit", "zone_id": "z2", "detail": "PR-108 at 10.4 bar (crit 10.5).", "ts": (now - timedelta(minutes=6)).isoformat() + "Z", "ack": False, "category": "GAS" },
            { "id": "a4", "severity": "elevated", "title": "Vibration anomaly", "zone_id": "z4", "detail": "VI-114 sustained 8.6mm/s over 4 min.", "ts": (now - timedelta(minutes=8)).isoformat() + "Z", "ack": True, "category": "MAINT", "assignee": "Sameer Joshi" },
            { "id": "a5", "severity": "watch", "title": "Permit expiring in <60m", "zone_id": "z3", "detail": "PTW-2043 (HEIGHT) closes at 17:00.", "ts": (now - timedelta(minutes=12)).isoformat() + "Z", "ack": False, "category": "PERMIT" },
            { "id": "a6", "severity": "watch", "title": "Sensor calibration overdue", "zone_id": "z3", "detail": "GA-119 last calibrated 46 days ago.", "ts": (now - timedelta(minutes=20)).isoformat() + "Z", "ack": True, "category": "SYSTEM" },
        ]
        for a in alerts_data:
            session.add(Alert(**a))
        await session.commit()

        # 9. Incidents
        print("Seeding incidents...")
        incidents_data = [
            {
                "id": "i1", "code": "INC-2026-014", "title": "Reactor Bay A · Hydrocarbon leak precursor",
                "zone_id": "z1", "severity": "critical", "status": "OPEN",
                "opened": (now - timedelta(minutes=46)).isoformat() + "Z",
                "root_cause": None,
                "evidence": [
                    "https://images.pexels.com/photos/6804266/pexels-photo-6804266.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                    "https://images.unsplash.com/photo-1581091012184-5c98a1f61b2c?auto=format&fit=crop&q=80&w=940&h=520"
                ]
            },
            {
                "id": "i2", "code": "INC-2026-013", "title": "Cracker unit · O₂ depletion in confined vessel",
                "zone_id": "z2", "severity": "critical", "status": "CONTAINED",
                "opened": (now - timedelta(hours=3)).isoformat() + "Z",
                "root_cause": "Ventilation blower V-3 offline during PTW window; permit did not require independent air feed.",
                "evidence": [
                    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=940&h=520"
                ]
            },
            {
                "id": "i3", "code": "INC-2026-011", "title": "Compressor C-2 · Bearing vibration event",
                "zone_id": "z4", "severity": "elevated", "status": "RESOLVED",
                "opened": (now - timedelta(hours=26)).isoformat() + "Z",
                "closed": (now - timedelta(hours=22)).isoformat() + "Z",
                "root_cause": "Lubrication line partial blockage — replaced strainer; retorqued mounts.",
                "evidence": [
                    "https://images.unsplash.com/photo-1615309662036-8ea9d94dcd66?auto=format&fit=crop&q=80&w=940&h=520"
                ]
            },
            {
                "id": "i4", "code": "INC-2026-009", "title": "Tank Farm North · Level sensor drift",
                "zone_id": "z3", "severity": "watch", "status": "RESOLVED",
                "opened": (now - timedelta(days=3)).isoformat() + "Z",
                "closed": (now - timedelta(days=3) + timedelta(hours=2)).isoformat() + "Z",
                "root_cause": "Sensor drift beyond ±3% band — recalibrated in-place.",
                "evidence": []
            },
        ]
        for inc in incidents_data:
            session.add(Incident(**inc))
        await session.commit()

        # 10. Risk History
        print("Seeding risk history...")
        for i in range(96):
            import math
            base = 30 + math.sin(i / 6.0) * 12.0 + math.sin(i / 3.0) * 5.0
            spike = (i - 78) * 3.4 if i > 78 else 0.0
            val = min(100.0, round(base + spike + (i % 5)))
            session.add(RiskHistory(id=f"rh{i+1}", t=i, v=int(val)))
        await session.commit()

        # 11. Activity Feed
        print("Seeding activity feed...")
        activity_data = [
            { "ts": (now - timedelta(seconds=20)).isoformat() + "Z", "actor": "Priya Kapoor", "text": "acknowledged CR-014 in Reactor Bay A" },
            { "ts": (now - timedelta(seconds=90)).isoformat() + "Z", "actor": "PRAAN AI", "text": "raised compound risk to CRITICAL (74)" },
            { "ts": (now - timedelta(minutes=4)).isoformat() + "Z", "actor": "Rohit Datta", "text": "opened PTW-2044 (Electrical, Control Room)" },
            { "ts": (now - timedelta(minutes=7)).isoformat() + "Z", "actor": "SCADA Bridge", "text": "PR-108 crossed elevated threshold" },
            { "ts": (now - timedelta(minutes=15)).isoformat() + "Z", "actor": "Sameer Joshi", "text": "completed WO-8801 stage 4 · Cooling loop flush" },
            { "ts": (now - timedelta(minutes=40)).isoformat() + "Z", "actor": "PRAAN AI", "text": "predicted 12m lead time before CR-014 escalation" },
        ]
        for act in activity_data:
            session.add(ActivityFeedItem(
                id=f"af{now.microsecond + hash(act['ts']) % 10000}",
                ts=act["ts"],
                actor=act["actor"],
                text=act["text"]
            ))
        await session.commit()

        # 12. Weather
        print("Seeding weather...")
        weather_obj = Weather(
            id="weather_singleton",
            temp=34,
            wind=42,
            wind_dir="SW → NE",
            humidity=62,
            visibility="6.4 km",
            pressure=1008,
            condition="Dust haze",
            alert="Wind above 35 km/h — height work review"
        )
        session.add(weather_obj)
        await session.commit()

    print("DB successfully seeded!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_db())
