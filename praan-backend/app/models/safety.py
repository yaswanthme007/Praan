from typing import List, Dict, Any, Optional
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Plant(Base):
    __tablename__ = "plants"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. OPERATIONAL, MAINTENANCE
    risk: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    workers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sensors: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    zones: Mapped[List["Zone"]] = relationship("Zone", back_populates="plant", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # PROCESS, STORAGE, UTILITY, etc.
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    w: Mapped[float] = mapped_column(Float, nullable=False)
    h: Mapped[float] = mapped_column(Float, nullable=False)
    risk: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    workers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    plant_id: Mapped[Optional[str]] = mapped_column(ForeignKey("plants.id"), nullable=True)

    plant: Mapped[Optional["Plant"]] = relationship("Plant", back_populates="zones")
    sensors_rel: Mapped[List["Sensor"]] = relationship("Sensor", back_populates="zone", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # GAS, TEMP, etc.
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    warn_threshold: Mapped[float] = mapped_column(Float, nullable=False)
    crit_threshold: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="safe", nullable=False) # safe, watch, elevated, critical
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    history: Mapped[List[float]] = mapped_column(JSON, default=list, nullable=False) # list of past floats
    last_calibrated: Mapped[str] = mapped_column(String(50), nullable=False)

    zone: Mapped["Zone"] = relationship("Zone", back_populates="sensors_rel")

class Worker(Base):
    __tablename__ = "workers"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=False)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False) # ACTIVE, BREAK, OFFDUTY, EMERGENCY
    heart_rate: Mapped[int] = mapped_column(Integer, nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)

class Permit(Base):
    __tablename__ = "permits"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # HOT WORK, CONFINED SPACE, etc.
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    contractor: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False) # ACTIVE, PENDING, COMPLETED, EXPIRED
    opened: Mapped[str] = mapped_column(String(50), nullable=False) # ISO String
    expires: Mapped[str] = mapped_column(String(50), nullable=False) # ISO String

class Maintenance(Base):
    __tablename__ = "maintenance"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    equipment: Mapped[str] = mapped_column(String(100), nullable=False)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    team: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False) # IN PROGRESS, SCHEDULED, COMPLETED, OVERDUE
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    eta: Mapped[str] = mapped_column(String(50), nullable=False)

class Alert(Base):
    __tablename__ = "alerts"

    severity: Mapped[str] = mapped_column(String(50), nullable=False) # critical, elevated, watch, safe
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    detail: Mapped[str] = mapped_column(String(500), nullable=False)
    ts: Mapped[str] = mapped_column(String(50), nullable=False) # ISO String
    ack: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    assignee: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # GAS, COMPOUND, PERMIT, etc.

class Incident(Base):
    __tablename__ = "incidents"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.id"), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="OPEN", nullable=False) # OPEN, CONTAINED, RESOLVED
    opened: Mapped[str] = mapped_column(String(50), nullable=False)
    closed: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    root_cause: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    evidence: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False) # list of strings (urls)

class CompoundRule(Base):
    __tablename__ = "compound_rules"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    conditions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False) # list of strings
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    regulation: Mapped[str] = mapped_column(String(100), nullable=False)

class RiskHistory(Base):
    __tablename__ = "risk_history"

    t: Mapped[int] = mapped_column(Integer, nullable=False)
    v: Mapped[int] = mapped_column(Integer, nullable=False)

class ActivityFeedItem(Base):
    __tablename__ = "activity_feed"

    ts: Mapped[str] = mapped_column(String(50), nullable=False)
    actor: Mapped[str] = mapped_column(String(100), nullable=False)
    text: Mapped[str] = mapped_column(String(200), nullable=False)

class Weather(Base):
    __tablename__ = "weather"

    temp: Mapped[int] = mapped_column(Integer, nullable=False)
    wind: Mapped[int] = mapped_column(Integer, nullable=False)
    wind_dir: Mapped[str] = mapped_column(String(50), nullable=False)
    humidity: Mapped[int] = mapped_column(Integer, nullable=False)
    visibility: Mapped[str] = mapped_column(String(50), nullable=False)
    pressure: Mapped[int] = mapped_column(Integer, nullable=False)
    condition: Mapped[str] = mapped_column(String(50), nullable=False)
    alert: Mapped[str] = mapped_column(String(200), nullable=False)
