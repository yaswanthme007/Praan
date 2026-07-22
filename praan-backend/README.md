# Praan Backend — Safety Intelligence Platform

This repository contains the FastAPI backend for **Praan**, an AI-powered Industrial Safety Intelligence platform for zero-harm operations (ET AI Hackathon 2026, PS#1).

The backend implements the **Compound Risk Engine** (Section 7 of the PRD), calculates real-time multi-silo risk indicators, maintains a PostgreSQL database containing active permits, workers, and telemetry, and streams real-time updates via WebSockets.

---

## Technical Stack
* **Language/Framework:** Python 3.11+ / FastAPI
* **Database & ORM:** PostgreSQL 16 / SQLAlchemy 2.0 (asyncio)
* **Real-time Streaming:** Native FastAPI WebSockets
* **Risk Engine Calculations:** NumPy / Python
* **Deployment/Local Dev:** Docker Compose

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* Python 3.11 or higher
* Docker & Docker Compose
* PostgreSQL client (optional)

### 2. Environment Setup
Clone the repository and copy the environment variables file:
```bash
cd praan-backend
cp .env.example .env
```
*(The default `.env` is configured to connect to PostgreSQL running via Docker Compose at `localhost:5432`).*

### 3. Spin Up PostgreSQL Database
Start the database service in the background:
```bash
docker-compose up -d
```

### 4. Install Dependencies
Create a virtual environment and install requirements:
```bash
python -m venv venv
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On Mac/Linux

pip install -r requirements.txt
```

### 5. Seed the Database
Run the seed script to compile tables and insert the identical hackathon datasets:
```bash
python -m seeds.seed
```
This script populates plants, zones, active permits, workers, maintenance loops, compound rules, alerts, and 24h risk history curves.

### 6. Run the Dev Server
Launch the FastAPI uvicorn server:
```bash
uvicorn app.main:app --reload --port 8000
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
* **REST Root:** [http://localhost:8000/](http://localhost:8000/)
* **WebSocket Endpoint:** `ws://localhost:8000/ws/live`

---

## Compound Risk Engine Math
The risk score $R(t)$ for each zone is computed dynamically every 2.0 seconds by the background service using:
1. **Base Contributions:** Sum of normalized weights for Gas sensor accumulation, Gas trajectory trend, active Permits, active Maintenance, Worker density, and Process abnormalities.
2. **Interaction Terms:** Pairwise bonuses (e.g. `gas × hot work`) and Triple interactions (e.g. `gas × hot work × workers` matching **Rule CR-014**).
3. **Regulatory Grounding:** High-risk scores are linked to official safety guidelines (OSHA 1910.119 / IS 15656 / API 618) to provide explanations and citations.

---

## Verification & Tests
To run the automated tests verifying the Compound Risk Engine scoring models:
```bash
pytest tests/
```
