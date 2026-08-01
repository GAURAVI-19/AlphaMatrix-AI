# Viva & Technical Defense Notes
## AlphaMatrix Responsible AI Enterprise Platform

### Key Questions & Model Answers for Project Viva Defense

#### Q1: What makes AlphaMatrix a "Responsible AI" platform rather than a simple machine learning dashboard?
**Answer**: Standard dashboards display predictions as black-box outputs. AlphaMatrix implements an **8-Layer Responsible AI Framework** that combines model predictions with:
1. **Explainable AI (XAI)** using SHAP (Shapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) to reveal exact feature contributions.
2. **Ethical Bias Firewalling** that automatically interdicts high-risk predictions (Risk >= 70%).
3. **Human-in-the-Loop (HIP) Governance** forcing mandatory manager sign-offs before high-risk predictions take operational effect.
4. **Cryptographic Security Audit Ledgers** and ISO-verified Decision Certificates for complete auditability.

#### Q2: How are SHAP values calculated in the system?
**Answer**: SHAP values are calculated by the Python FastAPI microservice using additive feature attribution methods rooted in game theory. They calculate how much each feature pushes the model output away from the baseline expectation (50%). Positive weights represent risk stimulators, while negative weights represent protective factors. When the Python microservice is offline, the backend executes a deterministic heuristic algorithm calculating signed relative deviations.

#### Q3: How does the system enforce multi-role governance (RBAC)?
**Answer**: Authentication relies on JWT bearer tokens containing signed user IDs and roles (`SUPER_ADMIN`, `BRANCH_MANAGER`, `EMPLOYEE`). Express middleware (`authMiddleware.js` and `roleMiddleware.js`) intercepts request headers, validating token signature and enforcing branch boundaries (e.g. Branch Managers can only view employees in their assigned branch).

#### Q4: How is high-risk decision interdiction handled?
**Answer**: When a user submits parameter injections (e.g. low satisfaction score), the prediction score is computed. If the resulting risk tier is `>= 70%` or violates active `EthicalRule` thresholds, the system flags `ethicalCheck.passed = false`, creates a pending `Approval` record in MongoDB, emits a real-time `HIGH_RISK_AI` WebSocket alert, and renders a prominent red alert banner on the UI.
