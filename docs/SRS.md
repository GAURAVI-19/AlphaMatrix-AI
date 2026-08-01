# Software Requirement Specification (SRS)
## AlphaMatrix Responsible AI Enterprise Platform

### 1. Introduction
#### 1.1 Purpose
This document specifies the software requirements for the **AlphaMatrix Responsible AI Enterprise Platform**. It provides a comprehensive technical breakdown of functional, non-functional, interface, security, and algorithmic requirements governing the system.

#### 1.2 Scope
AlphaMatrix is a multi-domain corporate decision governance system that combines machine learning risk modeling, Explainable AI (SHAP & LIME), ethical bias firewalling, human-in-the-loop (HIP) approval routing, and cryptographic audit ledgers into an enterprise-grade web application.

---

### 2. Overall Description
#### 2.1 Product Perspective
AlphaMatrix acts as a central governance layer sitting between enterprise operational databases and machine learning inference services.
* **Frontend**: React single-page application (SPA) built with Vite and TailwindCSS.
* **Backend API Gateway**: Node.js / Express REST API managing authentication, DB persistence, and WebSockets.
* **AI Explanation Service**: Python FastAPI microservice calculating SHAP values and LIME bounds.
* **Database Layer**: MongoDB cluster handling document persistence for users, predictions, approvals, and audit logs.

#### 2.2 User Classes and Characteristics
1. **SUPER_ADMIN**: Full platform control, ethical rule configuration, security audit log access, global analytics, system seeding.
2. **BRANCH_MANAGER**: Oversees assigned branch nodes, reviews pending high-risk decision approvals, monitors branch performance.
3. **EMPLOYEE**: Accesses personalized career statistics, individual radar skill vectors, enrolled LMS courses, and active PIP status banners.

---

### 3. Specific Functional Requirements

#### 3.1 Authentication & Authorization
* **FR-1.1**: User login with email/password returning JWT access and refresh tokens.
* **FR-1.2**: Role-Based Access Control (RBAC) restricting UI routes and backend API endpoints based on role (`SUPER_ADMIN`, `BRANCH_MANAGER`, `EMPLOYEE`).
* **FR-1.3**: Automated account lockout after 5 consecutive failed login attempts.

#### 3.2 Dynamic Prediction Engine & Parameter Injections
* **FR-2.1**: Support predictive model inference for Attrition, Promotion, and Performance metrics.
* **FR-2.2**: Allow real-time parameter tuning via glassmorphic sliders (Performance Score, Attendance, Productivity, Quality, Teamwork, Initiative, Satisfaction, Projects, Skills, Certifications).
* **FR-2.3**: Execute AI FastAPI microservice predictions, falling back to a deterministic heuristic model if the microservice is offline.

#### 3.3 Explainable AI (SHAP & LIME)
* **FR-3.1**: Compute feature attributions pushing model outputs from baseline 50%.
* **FR-3.2**: Render interactive SHAP Waterfall diagrams, Force Vector plots, and Feature Importance bar charts.
* **FR-3.3**: Compute local linear surrogate bounds using LIME.

#### 3.4 Ethical AI Firewall & Human Approvals
* **FR-4.1**: Automatically evaluate active ethical rules (Threshold Validation, Demographic Parity, Equal Opportunity).
* **FR-4.2**: Trigger high-risk interdictions when predicted attrition risk is >= 70%, creating a mandatory pending record in the Human-in-the-Loop queue.
* **FR-4.3**: Provide managers with `APPROVE` and `REJECT` controls with required review notes.

#### 3.5 Security Audit Ledger & Decision Certificates
* **FR-5.1**: Log all user actions, predictions, rule updates, and logins to an immutable audit collection.
* **FR-5.2**: Provide authorized CSV downloads of security log data.
* **FR-5.3**: Generate cryptographically signed ISO Decision Certificate PDF documents complete with QR seals and signature blocks.

---

### 4. Non-Functional Requirements
* **NFR-1 (Performance)**: API endpoint response times < 200ms under standard loads. AI inference explanations < 800ms.
* **NFR-2 (Security)**: Password hashing with bcrypt (salt rounds 10), JWT verification headers, Helmet security middleware, and CORS restriction.
* **NFR-3 (Usability)**: Responsive dark-mode interface utilizing a cohesive **Lavender / Purple** design system (`purple-600`, `purple-400`, `violet`), smooth `framer-motion` transitions, and accessible contrast ratios.
* **NFR-4 (Reliability)**: Automatic AI service fallback guaranteeing 99.9% prediction availability even during microservice outages.
