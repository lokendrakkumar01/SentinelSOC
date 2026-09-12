# 🛡️ SentinelSOC — AI-Driven Real-Time Log Anomaly Detection Platform

> A mini-SIEM (Security Information & Event Management) platform that collects logs in real-time, detects anomalies using statistical and rule-based methods, maps threats to the MITRE ATT&CK framework, and presents everything on a live SOC analyst dashboard.

![Tech Stack](https://img.shields.io/badge/Java-17-orange?logo=openjdk) ![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js) ![React](https://img.shields.io/badge/React-18-blue?logo=react) ![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen?logo=mongodb) ![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

---

## 🏗️ Architecture

```
┌─────────────────┐     POST /api/logs     ┌──────────────────┐     Redis Streams     ┌────────────────────┐
│  Java Log Agent  │ ──────────────────────→ │  Node.js Server  │ ───────────────────→  │  Anomaly Engine    │
│  (Generator +    │                         │  (Express API)   │                       │  • Brute Force     │
│   Real Log Parse)│                         │                  │                       │  • Z-Score Behavioral│
└─────────────────┘                         └──────┬───────────┘                       │  • Impossible Travel│
                                                   │                                   └────────┬───────────┘
                                                   │ Socket.io                                  │
                                            ┌──────▼───────────┐     Alerts                    │
                                            │  React Dashboard  │ ◄────────────────────────────┘
                                            │  • Live Feed      │
                                            │  • World Map      │     ┌─────────────┐
                                            │  • Timeline       │     │   MongoDB    │
                                            │  • MITRE Matrix   │     │  (Logs +     │
                                            └──────────────────┘     │   Alerts)    │
                                                                      └─────────────┘
```

## ✨ Features

### 🔍 Anomaly Detection
- **Brute Force Detection** — Flags 5+ failed logins from same IP within 60 seconds (MITRE T1110)
- **Behavioral Anomaly (Z-Score)** — Detects unusual login times based on per-user statistical baselines (MITRE T1078)
- **Impossible Travel** — Alerts when same user logs in from two distant locations faster than physically possible (MITRE T1078.004)
- **Privilege Escalation** — Monitors unauthorized access to admin resources (MITRE T1548)

### 📊 Live Dashboard
- Real-time incident feed with Socket.io
- World map with geo-plotted login attempts (green=normal, red=alert)
- Attack timeline visualization
- MITRE ATT&CK mini-heatmap
- Severity distribution charts

### 🤖 Automated Response
- Auto-block IPs on critical alerts
- Slack & Email notifications
- In-memory blocklist with MongoDB persistence

### 🗺️ MITRE ATT&CK Mapping
Every detected anomaly is tagged with industry-standard MITRE ATT&CK technique IDs.

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- (Optional) Node.js 20+, Java 17+, Maven 3.9+ for local development

### One-Command Deploy
```bash
# Clone and start all services
git clone <your-repo-url>
cd SentinelSOC
cp .env.example .env
docker-compose up --build -d
```

### Seed Demo Data
```bash
# Install mongodb driver and run seed script
npm install mongodb
node scripts/seed-data.js
```

### Run Attack Simulation
```bash
bash scripts/attack-simulator.sh
```

### Access Dashboard
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:5000
- **Login**: `admin@sentinelsoc.io` / `SentinelSOC@2024`

---

## 🛠️ Local Development

### Backend Server
```bash
cd server
npm install
npm run dev    # Starts on port 5000 with hot reload
```

### React Frontend
```bash
cd client
npm install
npm run dev    # Starts on port 3000 with Vite proxy to backend
```

### Java Log Agent
```bash
cd log-agent
mvn clean package
java -jar target/log-agent-1.0.0-shaded.jar --api-url http://localhost:5000/api/logs
```

### Required Services
```bash
# Start MongoDB and Redis via Docker
docker-compose up mongodb redis -d
```

---

## 📁 Project Structure

```
SentinelSOC/
├── docker-compose.yml          # All services orchestration
├── .env.example                # Environment configuration template
│
├── log-agent/                  # Java Log Agent (Maven)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/sentinelsoc/agent/
│       ├── LogAgent.java               # Main entry point
│       ├── SimulatedLogGenerator.java  # Realistic log generation
│       ├── LogSender.java              # HTTP client with retry
│       ├── LogParser.java              # Log line parser
│       └── model/LogEntry.java         # Log data model
│
├── server/                     # Node.js Backend (TypeScript)
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── index.ts                    # Express + Socket.io bootstrap
│       ├── config/                     # DB, Redis, env configuration
│       ├── models/                     # Mongoose schemas
│       ├── routes/                     # API endpoints
│       ├── queue/                      # Redis Streams producer/consumer
│       ├── engine/                     # Anomaly detection core
│       ├── services/                   # GeoIP, notifications, auto-response
│       ├── middleware/                 # Auth, rate limiting
│       └── utils/                      # Logger, math helpers
│
├── client/                     # React Frontend (Vite + TailwindCSS)
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── pages/                      # Login, Dashboard, AlertDetail
│       ├── components/                 # Dashboard widgets, alerts, layout
│       ├── context/                    # Auth + Socket.io contexts
│       ├── hooks/                      # Custom React hooks
│       └── api/                        # Axios configuration
│
└── scripts/
    ├── seed-data.js                    # Database seeding
    └── attack-simulator.sh             # Demo attack scenarios
```

---

## 🔒 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create analyst account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| POST | `/api/logs` | No | Ingest log event |
| GET | `/api/logs` | Yes | Query logs (paginated) |
| GET | `/api/alerts` | Yes | Query alerts (paginated) |
| GET | `/api/alerts/:id` | Yes | Single alert details |
| PATCH | `/api/alerts/:id` | Yes | Update alert status |
| GET | `/api/alerts/stats/summary` | Yes | Alert statistics |
| GET | `/api/dashboard/stats` | Yes | Dashboard overview stats |
| POST | `/api/response/block-ip` | Yes (Admin) | Block an IP address |
| POST | `/api/response/unblock-ip` | Yes (Admin) | Unblock an IP address |
| GET | `/api/response/blocked-ips` | Yes | List blocked IPs |

---

## 🧪 Attack Scenarios (Demo)

The `attack-simulator.sh` script runs 5 scenarios:

1. **Brute Force** — 20 rapid failed logins → success (T1110)
2. **Impossible Travel** — Singapore → Moscow in 5 minutes (T1078.004)
3. **Behavioral Anomaly** — 3 AM login for a 9-to-5 user (T1078)
4. **Privilege Escalation** — Regular user accessing admin resources (T1548)
5. **Lateral Movement** — Compromised account accessing sensitive APIs (T1021)

---

## 📝 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Log Agent | Java 17 + Gson | System log collection & simulation |
| Backend API | Node.js + Express + TypeScript | Log ingestion, anomaly detection, REST API |
| Message Queue | Redis Streams | Async log processing pipeline |
| Database | MongoDB 7 | Logs, alerts, user baselines storage |
| Frontend | React 18 + Vite + TailwindCSS | Real-time SOC analyst dashboard |
| Real-time | Socket.io | Live event streaming to dashboard |
| Auth | JWT + bcrypt | Analyst authentication |
| Visualization | Chart.js + react-simple-maps | Charts and world map |
| Notifications | Nodemailer + Slack Webhooks | Alert notifications |
| Deployment | Docker Compose | Single-command deployment |

---

## 🎓 Learning Outcomes

- Real-time streaming architecture (Redis Streams, consumer groups)
- Statistical anomaly detection (Z-score, incremental baseline)
- MITRE ATT&CK framework mapping (industry-standard)
- Socket.io live dashboards
- Java agent-based system design
- Geo-IP threat intelligence
- Docker multi-service orchestration

---

## 📄 License

MIT License — feel free to use for learning and portfolio purposes.
