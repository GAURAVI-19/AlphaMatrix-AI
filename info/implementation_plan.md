# Implementation Plan - Step 6: Explainable AI (SHAP Visualization) + Prediction Firewall

We will build a complete, production-grade AI Insights module with interactive predictive parameter injections, SHAP explainability charts, and real-time ethical AI firewalls.

## Proposed Changes

### 1. Backend

#### [MODIFY] [predictionController.js](file:///c:/Users/Gaura/Documents/Codex/2026-05-21/AlphaMatrix19/backend/src/controllers/predictionController.js)
- Allow `req.body.inputData` to override employee metrics in `generatePrediction`.
- Upgrade the fallback mock prediction generator to calculate dynamic scores based on parameters:
  - Higher performance score, attendance rate, productivity, quality, and satisfaction should result in a lower attrition risk.
  - Lower satisfaction, lower attendance, and high workload should result in higher risk.
  - Dynamically generate SHAP features list that matches all input features and calculates realistic positive/negative impact magnitudes.

---

### 2. Frontend

#### [MODIFY] [AIInsights.jsx](file:///c:/Users/Gaura/Documents/Codex/2026-05-21/AlphaMatrix19/frontend/src/pages/AIInsights.jsx)
- Update endpoint target to `/predictions/generate` (currently incorrectly calling `/predictions` which causes a 404/method not allowed).
- Manage states for all prediction parameters:
  - `performanceScore` (0–100)
  - `attendance` (0–100)
  - `productivity` (0–100)
  - `quality` (0–100)
  - `teamwork` (0–100)
  - `initiative` (0–100)
  - `satisfactionScore` (1–10)
  - `projectsCompleted` (0–50)
  - `skillCount` (0–20)
  - `certificationCount` (0–20)
  - `courseCount` (0–20)
- Pre-populate these parameters when an employee is selected by reading their profile properties or fetching them. If the user edits them, they are injected into the payload.
- Render dynamic loading skeletons and clean error alerts.

#### [MODIFY] [PredictionForm.jsx](file:///c:/Users/Gaura/Documents/Codex/2026-05-21/AlphaMatrix19/frontend/src/components/PredictionForm.jsx)
- Redesign the layout to divide inputs into two tabs/sections:
  - **Core Settings**: Select Employee Node, Select Target Model.
  - **Parameter Tuning (AI Injections)**: Beautiful glassmorphic sliders and number inputs for all parameters, complete with current values.
- Gracefully handle parameter syncing and layout responsiveness.

#### [MODIFY] [ShapChart.jsx](file:///c:/Users/Gaura/Documents/Codex/2026-05-21/AlphaMatrix19/frontend/src/components/ShapChart.jsx)
- Ensure all possible features are classified properly into positive (red) and negative (green) risk drivers.
- Sort them by impact importance and handle empty values gracefully.

#### [MODIFY] [RiskAlert.jsx](file:///c:/Users/Gaura/Documents/Codex/2026-05-21/AlphaMatrix19/frontend/src/components/RiskAlert.jsx)
- Verify compliance with the ethical AI firewall. Under attrition predictions exceeding 70% risk, trigger the loud red high-risk alert banner and human-in-the-loop warning.

---

## Verification Plan

### Automated Build Verification
- Verify backend is running without errors.
- Run frontend build to ensure typescript/linter checks pass: `npm run build` inside `frontend`.

### Manual Browser Verification
- Select an employee node and check if their default scores load correctly.
- Tweak the performance and satisfaction scores using the sliders.
- Run the prediction and verify the resulting attrition risk score changes accordingly (e.g., lower satisfaction produces higher risk).
- Verify the SHAP bar chart displays red for positive risk drivers and green for protective factors, ordered by impact.
- Verify the ethical AI firewall highlights the "High Risk Decision — Human Review Required" warning banner when prediction score >= 70%.
