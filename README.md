# PRAAN — Industrial Safety Intelligence Platform
### PS#1: Compound Risk Detection for Zero-Harm Operations (ET AI Hackathon 2026)

Praan is a next-generation safety intelligence dashboard that unifies SCADA sensor metrics, permit registries, worker location tracking, and maintenance schedules into a dynamic, real-time safety indicator. 

Traditional systems monitor thresholds in isolation. Praan detects the **precursor gap**—dangerous *combinations* of individually-safe parameters (e.g. rising gas + active welding permit + worker density)—and alerts operators up to tens of minutes before a disaster occurs.

---

## 🏗️ Architecture Overview

The application is structured into two main components:
1. **Frontend (`/Praan`):** A modern Next.js 14 Web Application built with React, TailwindCSS, Lucide-React, and Framer Motion. It includes live heatmaps, alert widgets, emergency controls, and connection monitoring.
2. **Backend (`/praan-backend`):** A robust FastAPI (Python 3.12) REST & WebSocket Server driven by SQLAlchemy 2.0, Pydantic v2, and SQLite (`praan_safety.db`). It executes the Compound Risk scoring models, drifts sensor metrics continuously, and broadcasts telemetry to active clients.

---

## ⚡ Quick Start: Run Everything in One Command

We have included pre-configured automation scripts in the workspace root directory to spin up the entire application instantly:

### For Windows Users (PowerShell/Command Prompt)
Double-click `dev.bat` or run:
```bash
.\dev.bat
```
*This script will navigate to the backend, run the SQLite database seeder, launch the FastAPI server, and start the Next.js frontend in separate, persistent terminal windows.*

### For Linux/Mac/Git-Bash Users
Run:
```bash
chmod +x run.sh
./run.sh
```

---

## 🔑 Demo Access Credentials

* **Dashboard URL:** `http://localhost:3000`
* **API Documentation (Swagger UI):** `http://localhost:8000/docs`
* **Default Demo User:**
  * **Email:** `priya.kapoor@praan.io`
  * **Password:** `mission-critical-2026`
  * *Alternatively, click the green **"Demo Sign In (Bypass Network)"** button to bypass network credentials instantly.*

---

## 🧠 The Compound Risk Engine

The core math behind Praan’s calculations ($R(t)$) aggregates weighted normalized inputs and applies customized interaction multipliers:

$$R(t) = \min\left(100, \left( \sum W_i \cdot x_i(t) \cdot 60.0 \right) + I_{\text{terms}}\right)$$

### Modeled Precursor Scenarios
1. **Rule CR-014 (Vizag Scenario):** Hot Work Permit + Rising Hydrocarbon Gas + Worker exposure density ($\ge$ 3 workers inside zone) $\rightarrow$ Adds a **37-point** interaction bonus, raising the score immediately into the **Critical** band ($\ge$ 75).
2. **Rule CR-021 (Confined Space Entry):** Confined Space Permit + Falling O₂ Trend + Active Maintenance $\rightarrow$ Adds a **32-point** interaction bonus.
3. **Rule CR-008 (Structural Fatigue):** Simultaneous Overpressure + Vibration Spike $\rightarrow$ Adds a **27-point** interaction bonus.

---

## 🛠️ Technology Stack & Dependencies

### Frontend (`/Praan`)
* **Framework:** Next.js 14 (App Router)
* **Styling:** TailwindCSS
* **Icons:** Lucide-React
* **Animations:** Framer Motion
* **Package Manager:** Yarn

### Backend (`/praan-backend`)
* **Framework:** FastAPI
* **ASGI Server:** Uvicorn
* **Database Toolkit:** SQLAlchemy 2.0 (Async)
* **Database Driver:** `aiosqlite`
* **Validation & Settings:** Pydantic v2 & Pydantic-Settings
* **Math & Graphs:** NumPy & NetworkX
* **Authentication:** Python-Jose (JWT) & Passlib (Bcrypt)
* **Unit Testing:** PyTest

