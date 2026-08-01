# 🟣 AlphaMatrix Responsible AI Enterprise Platform

> **Enterprise-Grade 8-Layer Explainable (SHAP/LIME) & Ethical Decision Governance System**

AlphaMatrix is an advanced multi-domain AI management ecosystem engineered for modern enterprise environments. Built upon an 8-Layer Responsible AI Framework, AlphaMatrix delivers predictive decision analytics, local & global explainability attributions (SHAP & LIME), automated ethical bias firewalls, human-in-the-loop (HIP) governance sign-offs, and immutable security audit logs in a sleek, cohesive **Lavender / Purple** design system.

---

## 🚀 Key Features

* **Multi-Domain Intelligence Hub**: Seamlessly switch between Human Resources, Healthcare, Banking & Finance, Smart Industry, Higher Education, and SaaS analytics.
* **Dual Explainable AI Engine (SHAP & LIME)**:
  * **SHAP Attributions**: Dynamic Waterfall charts, Force Vector plots, and Feature Importance metrics measuring positive and negative risk drivers.
  * **LIME Local Bounds**: Linear surrogate modeling for local decision boundaries.
* **Ethical AI Firewall Interdictor**: Real-time demographic parity checking, custom threshold validation, and automatic interdiction of high-risk decisions (Score >= 70%).
* **Human-in-the-Loop (HIP) Governance**: Role-restricted approval queues requiring managerial override sign-offs for flagged AI decisions.
* **Cryptographic Security Audit Ledger**: Chronological audit trail logging of all user activities, system seeds, and policy edits with one-click authorized CSV export.
* **ISO-Compliant Decision Certificates**: Cryptographically verifiable PDF export (`jsPDF`) complete with ISO seal, certificate hash, risk scores, and signature blocks.
* **Role-Based Analytics (RBAC)**: Customized executive views for `SUPER_ADMIN`, `BRANCH_MANAGER`, and `EMPLOYEE`.
* **Real-time WebSockets & Toast Notifications**: Instant push alerts on critical AI firewall triggers and employee onboarding events.
* **Lavender / Purple Enterprise Design System**: Modern dark glassmorphic UI with vibrant violet accents, responsive radar charts, smooth micro-animations (`framer-motion`), and theme toggling.

---

## 🏗️ Architecture Overview

AlphaMatrix is structured into three microservices:
1. **Frontend Client**: React 18, Vite 8, TailwindCSS with custom purple design tokens, Lucide React icons, Framer Motion, Recharts, and jsPDF.
2. **Backend Gateway**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT Authentication, and Winston logging.
3. **AI Explanation Engine**: FastAPI Python microservice running XGBoost prediction models and SHAP / LIME explainability calculators.

---

## 🛠️ Quick Start & Installation

### Prerequisites
* **Node.js**: v18+ 
* **Python**: v3.10+
* **MongoDB**: v6.0+

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Pre-populates database with demo users, branches, and rules
npm run dev      # Starts API server on http://localhost:5000
```

### 2. AI Microservice Setup
```bash
cd ai_service
pip install -r requirements.txt
python app.py    # Starts FastAPI AI engine on http://localhost:8000
```

### 3. Frontend Client Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@alphamatrix.com` | `Admin@123456` |
| **Branch Manager** | `manager@alphamatrix.com` | `Admin@123456` |
| **Employee** | `employee@alphamatrix.com` | `Admin@123456` |

---

## 📚 Documentation Sitemap

Comprehensive documentation is available in the [`docs/`](./docs) directory:

1. [Software Requirement Specification (SRS)](./docs/SRS.md)
2. [Software Design Document (SDD)](./docs/SDD.md)
3. [API Documentation](./docs/API_DOCUMENTATION.md)
4. [Database Documentation](./docs/DATABASE_DOCUMENTATION.md)
5. [Architecture Documentation](./docs/ARCHITECTURE_DOCUMENTATION.md)
6. [User Manual](./docs/USER_MANUAL.md)
7. [Installation Guide](./docs/INSTALLATION_GUIDE.md)
8. [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
9. [Testing & QA Report](./docs/TESTING_REPORT.md)
10. [Viva / Technical Review Notes](./docs/VIVA_NOTES.md)
11. [Executive Project Report](./docs/EXECUTIVE_PROJECT_REPORT.md)
12. [IEEE Research Paper Draft](./docs/IEEE_PAPER_DRAFT.md)
13. [Presentation (PPT) Content](./docs/PPT_CONTENT.md)
14. [Project Abstract](./docs/PROJECT_ABSTRACT.md)
15. [Resume Project Description](./docs/RESUME_PROJECT_DESCRIPTION.md)
