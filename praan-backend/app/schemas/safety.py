from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

class PlantSchema(CamelModel):
    id: str
    code: str
    name: str
    location: str
    status: str
    risk: int
    workers: int
    sensors: int

class ZoneSchema(CamelModel):
    id: str
    code: str
    name: str
    type: str # PROCESS, STORAGE, UTILITY, CONTROL, LOADING
    x: float
    y: float
    w: float
    h: float
    risk: int
    workers: int

class SensorThreshold(CamelModel):
    warn: float
    crit: float

class SensorSchema(CamelModel):
    id: str
    code: str
    name: str
    type: str # GAS, TEMP, PRESSURE, FLOW, VIBRATION, SMOKE, OXYGEN
    unit: str
    zone_id: str
    value: float
    threshold: SensorThreshold
    status: str # safe, watch, elevated, critical, offline
    x: float
    y: float
    history: List[float]
    last_calibrated: str

class WorkerVitals(CamelModel):
    hr: int
    temp: float

class WorkerSchema(CamelModel):
    id: str
    name: str
    role: str
    avatar: str
    zone_id: str
    status: str # ACTIVE, BREAK, OFFDUTY, EMERGENCY
    vitals: WorkerVitals
    x: float
    y: float

class PermitSchema(CamelModel):
    id: str
    code: str
    type: str # HOT WORK, CONFINED SPACE, HEIGHT, ELECTRICAL, EXCAVATION
    zone_id: str
    contractor: str
    status: str # ACTIVE, PENDING, COMPLETED, EXPIRED
    opened: str
    expires: str

class MaintenanceSchema(CamelModel):
    id: str
    code: str
    equipment: str
    zone_id: str
    team: str
    status: str # IN PROGRESS, SCHEDULED, COMPLETED, OVERDUE
    progress: int
    eta: str

class AlertSchema(CamelModel):
    id: str
    severity: str # safe, watch, elevated, critical, offline
    title: str
    zone_id: str
    detail: str
    ts: str
    ack: bool
    assignee: Optional[str] = None
    category: str # GAS, COMPOUND, PERMIT, WORKER, MAINT, SYSTEM

class IncidentSchema(CamelModel):
    id: str
    code: str
    title: str
    zone_id: str
    severity: str
    status: str # OPEN, CONTAINED, RESOLVED
    opened: str
    closed: Optional[str] = None
    root_cause: Optional[str] = None
    evidence: List[str]

class CompoundRuleSchema(CamelModel):
    id: str
    code: str
    name: str
    conditions: List[str]
    severity: str
    triggered: bool
    regulation: str

class KpiSchema(CamelModel):
    compound_risk: int
    active_permits: int
    active_maint: int
    workers_on_site: int
    open_incidents: int
    sensors_online: int
    sensors_critical: int

class WeatherSchema(CamelModel):
    temp: int
    wind: int
    wind_dir: str
    humidity: int
    visibility: str
    pressure: int
    condition: str
    alert: str

class RiskTrendItemSchema(CamelModel):
    t: int
    v: int

class SafetyRegulationSchema(CamelModel):
    code: str
    title: str
    region: str
    triggered: int

class ActivityFeedItemSchema(CamelModel):
    ts: str
    actor: str
    text: str

class AlertAckResponse(CamelModel):
    success: bool
    message: str

class EmergencyBroadcastResponse(CamelModel):
    success: bool
    incident_id: str
    message: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfileSchema(CamelModel):
    name: str
    email: str
    role: str

class LoginResponse(CamelModel):
    access_token: str
    token_type: str
    user: UserProfileSchema
