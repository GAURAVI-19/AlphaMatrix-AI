# User Manual
## AlphaMatrix Responsible AI Enterprise Platform

### 1. Navigating the Platform

#### 1.1 Executive Dashboard
* **Overview**: View global organization metrics, active PIP banners, radar skill comparisons, and enrolled continuous learning courses.
* **Navigation**: Click `Executive Dashboard` from the sidebar.

#### 1.2 Explainability XAI & Prediction Engine
* **Selecting an Employee**: Navigate to `Explainability XAI` or `Prediction Engine`. Select an employee from the dropdown list.
* **Tuning Parameters**: Click the `Parameter Tuning` tab in the prediction card to adjust sliders (e.g., Performance, Satisfaction, Attendance).
* **Generating Predictions**: Click **Generate Prediction Insight**.
* **Interpreting SHAP Visualizations**:
  * **Waterfall Chart**: Displays step-by-step impact pushing score from 50% baseline.
  * **Force Vector Plot**: Balances green (protective factors) vs red (risk drivers).
  * **Feature Importance**: Ranks features by weight magnitude.
  * **LIME Bounds**: Shows local linear decision boundaries.

#### 1.3 Reviewing Pending High-Risk Approvals
* **Overview**: Decisions exceeding 70% risk automatically land in `Human Approvals`.
* **Action**: Select an item, review employee SHAP explanations, enter review comments, and click **Approve Decision** or **Reject Decision**.

#### 1.4 Exporting Decision Certificates & Audit Logs
* **Decision Certificate**: Click **Export Decision Certificate** on any prediction card to open the modal and generate an official ISO-verified PDF certificate.
* **Security Audit Logs**: Navigate to `Security Audit Logs`, apply filters (Date, Module, User), and click **Export CSV** for authorized ledger downloads.
