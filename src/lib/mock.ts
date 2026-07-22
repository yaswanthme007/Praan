import { seedRandom } from "./utils";

export type Severity = "safe" | "watch" | "elevated" | "critical" | "offline";

export type Sensor = {
  id: string;
  code: string;
  name: string;
  type: "GAS" | "TEMP" | "PRESSURE" | "FLOW" | "VIBRATION" | "SMOKE" | "OXYGEN";
  unit: string;
  zoneId: string;
  value: number;
  threshold: { warn: number; crit: number };
  status: Severity;
  x: number; // % on plant map
  y: number;
  history: number[];
  lastCalibrated: string;
};

export type Zone = {
  id: string;
  code: string;
  name: string;
  type: "PROCESS" | "STORAGE" | "UTILITY" | "CONTROL" | "LOADING";
  x: number; y: number; w: number; h: number;
  risk: number;
  workers: number;
};

export type Worker = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  zoneId: string;
  status: "ACTIVE" | "BREAK" | "OFFDUTY" | "EMERGENCY";
  vitals: { hr: number; temp: number };
  x: number; y: number;
};

export type Permit = {
  id: string;
  code: string;
  type: "HOT WORK" | "CONFINED SPACE" | "HEIGHT" | "ELECTRICAL" | "EXCAVATION";
  zoneId: string;
  contractor: string;
  status: "ACTIVE" | "PENDING" | "COMPLETED" | "EXPIRED";
  opened: string;
  expires: string;
};

export type Maintenance = {
  id: string;
  code: string;
  equipment: string;
  zoneId: string;
  team: string;
  status: "IN PROGRESS" | "SCHEDULED" | "COMPLETED" | "OVERDUE";
  progress: number;
  eta: string;
};

export type Alert = {
  id: string;
  severity: Severity;
  title: string;
  zoneId: string;
  detail: string;
  ts: string;
  ack: boolean;
  assignee?: string;
  category: "GAS" | "COMPOUND" | "PERMIT" | "WORKER" | "MAINT" | "SYSTEM";
};

export type Incident = {
  id: string;
  code: string;
  title: string;
  zoneId: string;
  severity: Severity;
  status: "OPEN" | "CONTAINED" | "RESOLVED";
  opened: string;
  closed?: string;
  rootCause?: string;
  evidence: string[];
};

export type CompoundRule = {
  id: string;
  code: string;
  name: string;
  conditions: string[];
  severity: Severity;
  triggered: boolean;
  regulation: string;
};

// ============= FIXED SEED DATASETS =============

export const zones: Zone[] = [
  { id: "z1", code: "Z-01", name: "Reactor Bay A", type: "PROCESS", x: 4, y: 6, w: 26, h: 34, risk: 82, workers: 4 },
  { id: "z2", code: "Z-02", name: "Cracker Unit", type: "PROCESS", x: 32, y: 6, w: 22, h: 34, risk: 58, workers: 2 },
  { id: "z3", code: "Z-03", name: "Tank Farm North", type: "STORAGE", x: 56, y: 4, w: 40, h: 22, risk: 34, workers: 1 },
  { id: "z4", code: "Z-04", name: "Compressor Hall", type: "UTILITY", x: 56, y: 28, w: 22, h: 16, risk: 22, workers: 3 },
  { id: "z5", code: "Z-05", name: "Cooling Tower B", type: "UTILITY", x: 80, y: 28, w: 16, h: 16, risk: 12, workers: 0 },
  { id: "z6", code: "Z-06", name: "Control Room", type: "CONTROL", x: 4, y: 42, w: 22, h: 14, risk: 4, workers: 6 },
  { id: "z7", code: "Z-07", name: "Loading Bay", type: "LOADING", x: 28, y: 42, w: 26, h: 14, risk: 18, workers: 2 },
  { id: "z8", code: "Z-08", name: "Utilities Corridor", type: "UTILITY", x: 56, y: 46, w: 40, h: 10, risk: 8, workers: 1 },
  { id: "z9", code: "Z-09", name: "Feedstock Pipeline", type: "PROCESS", x: 4, y: 58, w: 52, h: 8, risk: 41, workers: 0 },
  { id: "z10", code: "Z-10", name: "Effluent Treatment", type: "UTILITY", x: 58, y: 58, w: 38, h: 12, risk: 14, workers: 1 },
];

const sensorSeed = seedRandom(42);
export const sensors: Sensor[] = Array.from({ length: 42 }).map((_, i) => {
  const zone = zones[i % zones.length];
  const types: Sensor["type"][] = ["GAS", "TEMP", "PRESSURE", "FLOW", "VIBRATION", "SMOKE", "OXYGEN"];
  const type = types[i % types.length];
  const unitMap: Record<Sensor["type"], string> = {
    GAS: "ppm", TEMP: "°C", PRESSURE: "bar", FLOW: "m³/h", VIBRATION: "mm/s", SMOKE: "%", OXYGEN: "%",
  };
  const rangeMap: Record<Sensor["type"], [number, number, number, number]> = {
    GAS: [0, 60, 25, 45],
    TEMP: [20, 180, 120, 160],
    PRESSURE: [0, 12, 8, 10.5],
    FLOW: [0, 400, 300, 380],
    VIBRATION: [0, 12, 7, 10],
    SMOKE: [0, 8, 3, 5],
    OXYGEN: [16, 22, 19, 17.5],
  };
  const [lo, hi, warn, crit] = rangeMap[type];
  const val = lo + sensorSeed() * (hi - lo);
  const history = Array.from({ length: 40 }, () => lo + sensorSeed() * (hi - lo));
  const status: Severity =
    (type === "OXYGEN" ? val < crit : val > crit) ? "critical" :
    (type === "OXYGEN" ? val < warn : val > warn) ? "elevated" :
    "safe";
  return {
    id: `s${i + 1}`,
    code: `${type.slice(0, 2)}-${(i + 101).toString().padStart(3, "0")}`,
    name: `${type[0] + type.slice(1).toLowerCase()} · ${zone.code}`,
    type,
    unit: unitMap[type],
    zoneId: zone.id,
    value: Number(val.toFixed(1)),
    threshold: { warn, crit },
    status,
    x: zone.x + 4 + sensorSeed() * (zone.w - 8),
    y: zone.y + 4 + sensorSeed() * (zone.h - 8),
    history: history.map((v) => Number(v.toFixed(1))),
    lastCalibrated: `2025-${(1 + (i % 12)).toString().padStart(2, "0")}-${(1 + (i % 27)).toString().padStart(2, "0")}`,
  };
});

const workerSeed = seedRandom(7);
const workerAvatars = [
  "https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=200&h=200",
];
const workerNames = [
  ["Arjun Mehta", "Field Engineer"], ["Priya Kapoor", "Safety Officer"], ["Nikhil Rao", "Ops Technician"],
  ["Rhea D'Souza", "Instrumentation"], ["Vikram Shah", "Turnaround Lead"], ["Sana Iyer", "Boiler Ops"],
  ["Danish Khan", "HSE Auditor"], ["Ishaan Verma", "Electrical Tech"], ["Tara Sinha", "Env. Analyst"],
  ["Zoya Bhat", "Control Op."], ["Farhan Ali", "Contractor"], ["Meera Nair", "Response Team"],
  ["Karan Puri", "Response Team"], ["Anjali Rao", "Response Team"], ["Rohit Datta", "SCADA Eng."],
  ["Sameer Joshi", "Maintenance"], ["Lea Fernandes", "Rope Access"], ["Yash Trivedi", "Loader Op."],
];
export const workers: Worker[] = workerNames.map(([name, role], i) => {
  const zone = zones[i % zones.length];
  const statuses: Worker["status"][] = ["ACTIVE", "ACTIVE", "ACTIVE", "BREAK", "ACTIVE", "OFFDUTY"];
  return {
    id: `w${i + 1}`,
    name,
    role,
    avatar: workerAvatars[i % workerAvatars.length],
    zoneId: zone.id,
    status: i === 4 ? "EMERGENCY" : statuses[i % statuses.length],
    vitals: { hr: 60 + Math.floor(workerSeed() * 40), temp: 36 + Number((workerSeed() * 2).toFixed(1)) },
    x: zone.x + 4 + workerSeed() * (zone.w - 8),
    y: zone.y + 4 + workerSeed() * (zone.h - 8),
  };
});

export const permits: Permit[] = [
  { id: "p1", code: "PTW-2041", type: "HOT WORK", zoneId: "z1", contractor: "Weldtech Ltd", status: "ACTIVE", opened: "2026-01-14T07:15:00Z", expires: "2026-01-14T19:00:00Z" },
  { id: "p2", code: "PTW-2042", type: "CONFINED SPACE", zoneId: "z2", contractor: "Ingress Corp", status: "ACTIVE", opened: "2026-01-14T06:30:00Z", expires: "2026-01-14T18:30:00Z" },
  { id: "p3", code: "PTW-2043", type: "HEIGHT", zoneId: "z3", contractor: "SkyLift", status: "ACTIVE", opened: "2026-01-14T08:00:00Z", expires: "2026-01-14T17:00:00Z" },
  { id: "p4", code: "PTW-2044", type: "ELECTRICAL", zoneId: "z6", contractor: "PowerGrid Services", status: "PENDING", opened: "2026-01-14T09:00:00Z", expires: "2026-01-14T20:00:00Z" },
  { id: "p5", code: "PTW-2045", type: "EXCAVATION", zoneId: "z8", contractor: "TerraDig", status: "ACTIVE", opened: "2026-01-13T11:00:00Z", expires: "2026-01-14T23:00:00Z" },
  { id: "p6", code: "PTW-2039", type: "HOT WORK", zoneId: "z7", contractor: "Weldtech Ltd", status: "COMPLETED", opened: "2026-01-13T05:00:00Z", expires: "2026-01-13T17:00:00Z" },
  { id: "p7", code: "PTW-2037", type: "HEIGHT", zoneId: "z4", contractor: "SkyLift", status: "EXPIRED", opened: "2026-01-12T08:00:00Z", expires: "2026-01-12T17:00:00Z" },
];

export const maintenance: Maintenance[] = [
  { id: "m1", code: "WO-8801", equipment: "Reactor A Cooling Loop", zoneId: "z1", team: "TeamAlpha", status: "IN PROGRESS", progress: 62, eta: "2h 14m" },
  { id: "m2", code: "WO-8802", equipment: "Cracker Feed Valve V-204", zoneId: "z2", team: "TeamBravo", status: "IN PROGRESS", progress: 41, eta: "3h 30m" },
  { id: "m3", code: "WO-8803", equipment: "Compressor C-2 Rotor", zoneId: "z4", team: "TeamCharlie", status: "IN PROGRESS", progress: 88, eta: "0h 18m" },
  { id: "m4", code: "WO-8804", equipment: "Tank T-11 Level Sensor", zoneId: "z3", team: "InstrumentTech", status: "SCHEDULED", progress: 0, eta: "Tomorrow" },
  { id: "m5", code: "WO-8805", equipment: "Effluent Pump P-6", zoneId: "z10", team: "MechOps", status: "COMPLETED", progress: 100, eta: "—" },
  { id: "m6", code: "WO-8806", equipment: "Pipeline Cathodic Protection", zoneId: "z9", team: "CorroTech", status: "OVERDUE", progress: 10, eta: "Late 4h" },
];

export const compoundRules: CompoundRule[] = [
  {
    id: "r1", code: "CR-014", name: "Hot Work + Rising Hydrocarbon + Workers In Zone",
    conditions: ["Hot Work Permit ACTIVE", "Gas > 30ppm rising", "Worker count ≥ 3", "Wind toward zone"],
    severity: "critical", triggered: true, regulation: "OSHA 1910.119 · IS 15656",
  },
  {
    id: "r2", code: "CR-021", name: "Confined Space + Falling O₂ + Maintenance Running",
    conditions: ["Confined Space Permit ACTIVE", "O₂ < 19.5%", "Maintenance IN PROGRESS in zone"],
    severity: "critical", triggered: true, regulation: "OSHA 1910.146",
  },
  {
    id: "r3", code: "CR-008", name: "Overpressure + Vibration Spike",
    conditions: ["Pressure > 10.2 bar", "Vibration > 8mm/s for 5m"],
    severity: "elevated", triggered: true, regulation: "API 618",
  },
  {
    id: "r4", code: "CR-032", name: "Tank Overfill Precursor",
    conditions: ["Tank level > 92%", "Flow-in > Flow-out for 15m", "Level sensor calibration overdue"],
    severity: "elevated", triggered: false, regulation: "API 2350",
  },
  {
    id: "r5", code: "CR-047", name: "Ambient Storm + Height Permit + Rope Access",
    conditions: ["Wind > 45km/h", "Height Permit ACTIVE", "Worker at height detected"],
    severity: "watch", triggered: false, regulation: "IS 3696",
  },
];

// live alert stream (initial)
export const initialAlerts: Alert[] = [
  { id: "a1", severity: "critical", title: "Compound Risk CR-014 triggered", zoneId: "z1", detail: "Hot Work + Rising HC + 4 workers inside Reactor Bay A.", ts: new Date(Date.now() - 45_000).toISOString(), ack: false, category: "COMPOUND", assignee: "Priya Kapoor" },
  { id: "a2", severity: "critical", title: "Compound Risk CR-021 triggered", zoneId: "z2", detail: "Confined space entry with O₂ trending toward 19.2%.", ts: new Date(Date.now() - 3 * 60_000).toISOString(), ack: false, category: "COMPOUND" },
  { id: "a3", severity: "elevated", title: "Pressure trend near limit", zoneId: "z2", detail: "PR-108 at 10.4 bar (crit 10.5).", ts: new Date(Date.now() - 6 * 60_000).toISOString(), ack: false, category: "GAS" },
  { id: "a4", severity: "elevated", title: "Vibration anomaly", zoneId: "z4", detail: "VI-114 sustained 8.6mm/s over 4 min.", ts: new Date(Date.now() - 8 * 60_000).toISOString(), ack: true, category: "MAINT", assignee: "Sameer Joshi" },
  { id: "a5", severity: "watch", title: "Permit expiring in <60m", zoneId: "z3", detail: "PTW-2043 (HEIGHT) closes at 17:00.", ts: new Date(Date.now() - 12 * 60_000).toISOString(), ack: false, category: "PERMIT" },
  { id: "a6", severity: "watch", title: "Sensor calibration overdue", zoneId: "z3", detail: "GA-119 last calibrated 46 days ago.", ts: new Date(Date.now() - 20 * 60_000).toISOString(), ack: true, category: "SYSTEM" },
];

export const incidents: Incident[] = [
  {
    id: "i1", code: "INC-2026-014", title: "Reactor Bay A · Hydrocarbon leak precursor",
    zoneId: "z1", severity: "critical", status: "OPEN",
    opened: new Date(Date.now() - 46 * 60_000).toISOString(),
    rootCause: undefined,
    evidence: [
      "https://images.pexels.com/photos/6804266/pexels-photo-6804266.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      "https://images.unsplash.com/photo-1581091012184-5c98a1f61b2c?auto=format&fit=crop&q=80&w=940&h=520",
    ],
  },
  {
    id: "i2", code: "INC-2026-013", title: "Cracker unit · O₂ depletion in confined vessel",
    zoneId: "z2", severity: "critical", status: "CONTAINED",
    opened: new Date(Date.now() - 3 * 3600_000).toISOString(),
    rootCause: "Ventilation blower V-3 offline during PTW window; permit did not require independent air feed.",
    evidence: [
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=940&h=520",
    ],
  },
  {
    id: "i3", code: "INC-2026-011", title: "Compressor C-2 · Bearing vibration event",
    zoneId: "z4", severity: "elevated", status: "RESOLVED",
    opened: new Date(Date.now() - 26 * 3600_000).toISOString(),
    closed: new Date(Date.now() - 22 * 3600_000).toISOString(),
    rootCause: "Lubrication line partial blockage — replaced strainer; retorqued mounts.",
    evidence: [
      "https://images.unsplash.com/photo-1615309662036-8ea9d94dcd66?auto=format&fit=crop&q=80&w=940&h=520",
    ],
  },
  {
    id: "i4", code: "INC-2026-009", title: "Tank Farm North · Level sensor drift",
    zoneId: "z3", severity: "watch", status: "RESOLVED",
    opened: new Date(Date.now() - 3 * 86400_000).toISOString(),
    closed: new Date(Date.now() - 3 * 86400_000 + 2 * 3600_000).toISOString(),
    rootCause: "Sensor drift beyond ±3% band — recalibrated in-place.",
    evidence: [],
  },
];

export const kpis = {
  compoundRisk: 74,
  activePermits: permits.filter((p) => p.status === "ACTIVE").length,
  activeMaint: maintenance.filter((m) => m.status === "IN PROGRESS").length,
  workersOnSite: workers.filter((w) => w.status === "ACTIVE" || w.status === "EMERGENCY").length,
  openIncidents: incidents.filter((i) => i.status !== "RESOLVED").length,
  sensorsOnline: sensors.length,
  sensorsCritical: sensors.filter((s) => s.status === "critical").length,
};

export const weather = {
  temp: 34,
  wind: 42,
  windDir: "SW → NE",
  humidity: 62,
  visibility: "6.4 km",
  pressure: 1008,
  condition: "Dust haze",
  alert: "Wind above 35 km/h — height work review",
};

export const plants = [
  { id: "pl1", code: "IN-JMN-01", name: "Jamnagar Refinery Cluster", location: "Gujarat, India", status: "OPERATIONAL", risk: 74, workers: 218, sensors: 812 },
  { id: "pl2", code: "IN-VZG-02", name: "Vizag Petrochem", location: "Andhra Pradesh, India", status: "OPERATIONAL", risk: 41, workers: 164, sensors: 604 },
  { id: "pl3", code: "IN-BHR-03", name: "Bharuch Specialty Chem", location: "Gujarat, India", status: "MAINTENANCE", risk: 22, workers: 89, sensors: 412 },
  { id: "pl4", code: "SG-JUR-04", name: "Jurong Aromatics", location: "Singapore", status: "OPERATIONAL", risk: 58, workers: 141, sensors: 522 },
  { id: "pl5", code: "AE-RAK-05", name: "RAK Downstream", location: "Ras Al Khaimah, UAE", status: "STANDBY", risk: 12, workers: 34, sensors: 208 },
];

// Historical risk (24h)
export const riskHistory24h = Array.from({ length: 96 }).map((_, i) => {
  const base = 30 + Math.sin(i / 6) * 12 + Math.sin(i / 3) * 5;
  const spike = i > 78 ? (i - 78) * 3.4 : 0;
  return { t: i, v: Math.min(100, Math.round(base + spike + (i % 5))) };
});

// Rules library entries
export const safetyRegulations = [
  { code: "OSHA 1910.119", title: "Process Safety Management of Highly Hazardous Chemicals", region: "US", triggered: 4 },
  { code: "OSHA 1910.146", title: "Permit-required Confined Spaces", region: "US", triggered: 2 },
  { code: "IS 15656", title: "Hazard Identification & Risk Analysis (India)", region: "IN", triggered: 3 },
  { code: "API 618", title: "Reciprocating Compressors", region: "Global", triggered: 1 },
  { code: "API 2350", title: "Overfill Protection for Storage Tanks", region: "Global", triggered: 0 },
  { code: "IEC 61511", title: "Functional Safety – Safety Instrumented Systems", region: "Global", triggered: 2 },
];

export const activityFeed = [
  { ts: new Date(Date.now() - 20_000).toISOString(), actor: "Priya Kapoor", text: "acknowledged CR-014 in Reactor Bay A" },
  { ts: new Date(Date.now() - 90_000).toISOString(), actor: "PRAAN AI", text: "raised compound risk to CRITICAL (74)" },
  { ts: new Date(Date.now() - 4 * 60_000).toISOString(), actor: "Rohit Datta", text: "opened PTW-2044 (Electrical, Control Room)" },
  { ts: new Date(Date.now() - 7 * 60_000).toISOString(), actor: "SCADA Bridge", text: "PR-108 crossed elevated threshold" },
  { ts: new Date(Date.now() - 15 * 60_000).toISOString(), actor: "Sameer Joshi", text: "completed WO-8801 stage 4 · Cooling loop flush" },
  { ts: new Date(Date.now() - 40 * 60_000).toISOString(), actor: "PRAAN AI", text: "predicted 12m lead time before CR-014 escalation" },
];
