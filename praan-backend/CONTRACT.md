# API Contract Documentation — Praan Platform

This document describes the API interface between the Next.js frontend and the FastAPI backend.

## Field Casing & Formatting
* **Casing:** The API uses **camelCase** for JSON responses to match the TypeScript types expected by the frontend. The backend translates internal SQLAlchemy models (`snake_case`) to Pydantic schemas using a custom camelCase alias generator.
* **Date Formats:** Datetimes are formatted as ISO 8601 strings (e.g. `2026-01-14T07:15:00Z`).
* **Enums:** Enums are serialized as uppercase or lowercase strings to match the exact frontend enums:
  - `Severity`: `"safe" | "watch" | "elevated" | "critical" | "offline"`
  - `Sensor.type`: `"GAS" | "TEMP" | "PRESSURE" | "FLOW" | "VIBRATION" | "SMOKE" | "OXYGEN"`
  - `Worker.status`: `"ACTIVE" | "BREAK" | "OFFDUTY" | "EMERGENCY"`
  - `Permit.status`: `"ACTIVE" | "PENDING" | "COMPLETED" | "EXPIRED"`
  - `Maintenance.status`: `"IN PROGRESS" | "SCHEDULED" | "COMPLETED" | "OVERDUE"`
  - `Incident.status`: `"OPEN" | "CONTAINED" | "RESOLVED"`

---

## REST Endpoints Mapping

### 1. General & Infrastructure Data

#### `GET /api/kpis`
* **Purpose:** Serves executive dashboard statistics.
* **Response Shape:**
  ```json
  {
    "compoundRisk": 74,
    "activePermits": 5,
    "activeMaint": 3,
    "workersOnSite": 15,
    "openIncidents": 2,
    "sensorsOnline": 42,
    "sensorsCritical": 1
  }
  ```

#### `GET /api/weather`
* **Purpose:** Serves local meteorological data.
* **Response Shape:**
  ```json
  {
    "temp": 34,
    "wind": 42,
    "windDir": "SW → NE",
    "humidity": 62,
    "visibility": "6.4 km",
    "pressure": 1008,
    "condition": "Dust haze",
    "alert": "Wind above 35 km/h — height work review"
  }
  ```

#### `GET /api/plants`
* **Purpose:** Serves multi-plant summary listings.
* **Response Shape:**
  ```json
  [
    {
      "id": "pl1",
      "code": "IN-JMN-01",
      "name": "Jamnagar Refinery Cluster",
      "location": "Gujarat, India",
      "status": "OPERATIONAL",
      "risk": 74,
      "workers": 218,
      "sensors": 812
    }
  ]
  ```

---

### 2. Live Operational Data

#### `GET /api/zones`
* **Purpose:** Serves facility zones, bounding boxes, risk, and worker counts.
* **Response Shape:**
  ```json
  [
    {
      "id": "z1",
      "code": "Z-01",
      "name": "Reactor Bay A",
      "type": "PROCESS",
      "x": 4,
      "y": 6,
      "w": 26,
      "h": 34,
      "risk": 82,
      "workers": 4
    }
  ]
  ```

#### `GET /api/sensors`
* **Purpose:** Serves all telemetry channels.
* **Response Shape:**
  ```json
  [
    {
      "id": "s1",
      "code": "GA-101",
      "name": "Gas · Z-01",
      "type": "GAS",
      "unit": "ppm",
      "zoneId": "z1",
      "value": 28.5,
      "threshold": {
        "warn": 25.0,
        "crit": 45.0
      },
      "status": "elevated",
      "x": 12.4,
      "y": 18.2,
      "history": [24.1, 26.2, 28.5],
      "lastCalibrated": "2025-01-14"
    }
  ]
  ```

#### `GET /api/workers`
* **Purpose:** Serves active worker locations and vitals.
* **Response Shape:**
  ```json
  [
    {
      "id": "w1",
      "name": "Arjun Mehta",
      "role": "Field Engineer",
      "avatar": "https://...",
      "zoneId": "z1",
      "status": "ACTIVE",
      "vitals": {
        "hr": 74,
        "temp": 36.6
      },
      "x": 14.5,
      "y": 22.1
    }
  ]
  ```

#### `GET /api/permits`
* **Purpose:** Serves Permit-to-Work logs.
* **Response Shape:**
  ```json
  [
    {
      "id": "p1",
      "code": "PTW-2041",
      "type": "HOT WORK",
      "zoneId": "z1",
      "contractor": "Weldtech Ltd",
      "status": "ACTIVE",
      "opened": "2026-01-14T07:15:00Z",
      "expires": "2026-01-14T19:00:00Z"
    }
  ]
  ```

#### `GET /api/maintenance`
* **Purpose:** Serves ongoing CMMS work-order loops.
* **Response Shape:**
  ```json
  [
    {
      "id": "m1",
      "code": "WO-8801",
      "equipment": "Reactor A Cooling Loop",
      "zoneId": "z1",
      "team": "TeamAlpha",
      "status": "IN PROGRESS",
      "progress": 62,
      "eta": "2h 14m"
    }
  ]
  ```

---

### 3. AI Insights & Incidents

#### `GET /api/rules`
* **Purpose:** Serves active compound rules and regulatory grounding.
* **Response Shape:**
  ```json
  [
    {
      "id": "r1",
      "code": "CR-014",
      "name": "Hot Work + Rising Hydrocarbon + Workers In Zone",
      "conditions": [
        "Hot Work Permit ACTIVE",
        "Gas > 30ppm rising",
        "Worker count ≥ 3"
      ],
      "severity": "critical",
      "triggered": true,
      "regulation": "OSHA 1910.119 · IS 15656"
    }
  ]
  ```

#### `GET /api/alerts`
* **Purpose:** Serves alerts stream.
* **Response Shape:**
  ```json
  [
    {
      "id": "a1",
      "severity": "critical",
      "title": "Compound Risk CR-014 triggered",
      "zoneId": "z1",
      "detail": "Hot Work + Rising HC + 4 workers inside Reactor Bay A.",
      "ts": "2026-07-22T22:00:00Z",
      "ack": false,
      "category": "COMPOUND",
      "assignee": "Priya Kapoor"
    }
  ]
  ```

#### `GET /api/incidents`
* **Purpose:** Serves major safety incidents.
* **Response Shape:**
  ```json
  [
    {
      "id": "i1",
      "code": "INC-2026-014",
      "title": "Reactor Bay A · Hydrocarbon leak precursor",
      "zoneId": "z1",
      "severity": "critical",
      "status": "OPEN",
      "opened": "2026-07-22T21:14:00Z",
      "closed": null,
      "rootCause": null,
      "evidence": [
        "https://images.unsplash.com/..."
      ]
    }
  ]
  ```

#### `GET /api/risk-history`
* **Purpose:** Serves 24h plant risk timeline.
* **Response Shape:**
  ```json
  [
    {
      "t": 0,
      "v": 32
    }
  ]
  ```

#### `GET /api/regulations`
* **Purpose:** Serves regulatory frameworks citation metrics.
* **Response Shape:**
  ```json
  [
    {
      "code": "OSHA 1910.119",
      "title": "Process Safety Management",
      "region": "US",
      "triggered": 4
    }
  ]
  ```

#### `GET /api/activity-feed`
* **Purpose:** Serves audit logs.
* **Response Shape:**
  ```json
  [
    {
      "ts": "2026-07-22T22:05:00Z",
      "actor": "Priya Kapoor",
      "text": "acknowledged CR-014 in Reactor Bay A"
    }
  ]
  ```

---

### 4. Write/Command Operations

#### `POST /api/alerts/{id}/ack`
* **Purpose:** Acknowledges an alert in the database.
* **Response Shape:**
  ```json
  {
    "success": true,
    "message": "Alert a1 acknowledged successfully"
  }
  ```

#### `POST /api/emergency/broadcast`
* **Purpose:** Triggers evacuation alert, raises PA warning, and sets worker statuses in Z-01 to `EMERGENCY`.
* **Response Shape:**
  ```json
  {
    "success": true,
    "incidentId": "i1",
    "message": "Emergency broadcast initiated. Evacuation protocol active."
  }
  ```

#### `POST /api/emergency/stand-down`
* **Purpose:** Stands down the active evacuation state and restores workers in Z-01 to `ACTIVE`.
* **Response Shape:**
  ```json
  {
    "success": true,
    "message": "Emergency stand down complete."
  }
  ```

#### `GET /api/mock-data`
* **Purpose:** Aggregates all database entities into a single payload. **Crucial endpoint** queried synchronously at frontend startup inside `mock.ts` to sync the state without requiring asynchronous refactors across 27+ component files.

---

## WebSocket Channels

### `WS /ws/live`
* **Purpose:** Real-time telemetry broadcast.
* **Transmission Frequency:** Every 2.0 seconds.
* **Message Payload Envelope:**
  ```json
  {
    "type": "telemetry",
    "payload": {
      "kpis": { ... },
      "sensors": [ ... ],
      "zones": [ ... ],
      "ts": "2026-07-22T22:06:02Z"
    }
  }
  ```
