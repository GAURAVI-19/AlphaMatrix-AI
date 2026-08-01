# Software Design Document (SDD)
## AlphaMatrix Responsible AI Enterprise Platform

### 1. Architectural Overview
The AlphaMatrix architecture follows a modular, microservice-oriented design decoupled into three principal tiers:

```
+-----------------------------------------------------------------------+
|                         Frontend Client (React)                       |
|   Vite 8 + TailwindCSS + Lucide Icons + Framer Motion + Recharts      |
+-----------------------------------------------------------------------+
                                   | HTTP / WebSockets
                                   v
+-----------------------------------------------------------------------+
|                    Node.js / Express Backend Gateway                  |
|   JWT Auth + Mongoose ODM + Winston Logger + Socket.io Server         |
+-----------------------------------------------------------------------+
             | Mongoose                              | Axios HTTP
             v                                       v
+-----------------------------+        +--------------------------------+
|      MongoDB Database       |        |   Python FastAPI AI Microservice|
|  Users, Predictions, Logs   |        |   XGBoost + SHAP + LIME            |
+-----------------------------+        +--------------------------------+
```

---

### 2. Component Design & Directory Structure

#### 2.1 Backend Component Hierarchy (`backend/src/`)
* `app.js`: Express application initialization, security middleware setup (Helmet, CORS, Rate Limiters), and routing registration.
* `server.js`: Server bootstrapper, MongoDB connection handler, and Socket.io server instance startup.
* `controllers/`:
  * `authController.js`: JWT token creation, login lockouts, user profiles.
  * `predictionController.js`: Prediction orchestrator, SHAP/LIME proxying, heuristic fallback engine, ethical rule evaluator.
  * `approvalController.js`: Managerial approval queue workflow actions.
  * `auditController.js`: Security audit queries and CSV exporter.
  * `employeeController.js`: Employee profiles, metrics calculations, LMS assignments.
  * `ethicalRuleController.js`: Ethical guardrail threshold matrix management.
* `middleware/`:
  * `authMiddleware.js`: Bearer token validation and request context population.
  * `roleMiddleware.js`: Role enforcement (`requireSuperAdmin`, `requireBranchManager`).

#### 2.2 Frontend Component Hierarchy (`frontend/src/`)
* `App.jsx`: Route definitions, React.lazy dynamic code splitting, Suspense loaders.
* `context/`: `AuthContext.jsx`, `ThemeContext.jsx`, `SocketContext.jsx`, `ToastContext.jsx`.
* `components/`:
  * `PredictionForm.jsx`: Parameter sliders, model selection tabs, employee node pickers.
  * `ShapChart.jsx`: SHAP Waterfall, Force Plot, Feature Importance Bar chart, LIME bounds.
  * `RiskAlert.jsx`: Loud high-risk banner interdictor and ethical status cards.
  * `DecisionCertificateModal.jsx`: ISO seal certificate renderer & PDF generator.
  * `NotificationBell.jsx`: WebSocket push notification list.
* `pages/`: `Dashboard.jsx`, `AIInsights.jsx`, `PredictionHistory.jsx`, `Approvals.jsx`, `AuditLogs.jsx`, `Settings.jsx`, `PIP.jsx`, `Courses.jsx`, `Branches.jsx`.

---

### 3. Data Flow Sequences

#### 3.1 Explainable Prediction & Interdiction Sequence
1. Client selects employee node and adjusts input parameter sliders (e.g., satisfactionScore = 1).
2. Client submits payload to `POST /api/v1/predictions/generate`.
3. Express backend checks FastAPI AI service health (`http://localhost:8000/predict`).
4. If online, XGBoost predicts score & SHAP values; if offline, heuristic fallback calculates signed vector attributions.
5. Backend evaluates active `EthicalRule` array against computed prediction score.
6. If prediction score >= 70%, ethical rule flags violation (`passed = false`), creating an `Approval` document in MongoDB.
7. Backend records `PredictionHistory` and `AuditLog` entry, and emits `HIGH_RISK_AI` WebSocket event.
8. Backend returns prediction payload to client; UI renders red risk interdiction banner and opens HIP queue action card.
