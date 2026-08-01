# API Documentation
## AlphaMatrix Responsible AI REST API (`v1`)

Base URL: `http://localhost:5000/api/v1`

---

### 🔑 Authentication Endpoints

#### 1. POST `/auth/login`
Authenticates user credentials and returns JWT tokens.
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "admin@alphamatrix.com",
    "password": "Admin@123456"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "_id": "60d5ec49f1a2c80015f8e9a1",
        "name": "Sarah Jenkins",
        "email": "admin@alphamatrix.com",
        "role": "SUPER_ADMIN"
      }
    }
  }
  ```

---

### 🧠 Prediction & Explainable AI Endpoints

#### 2. POST `/predictions/generate`
Generates prediction score, SHAP attributions, ethical checks, and logs history.
* **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "employeeId": "60d5ec49f1a2c80015f8e9a5",
    "predictionType": "ATTRITION",
    "domain": "HR",
    "selectedModel": "XGBOOST",
    "inputData": {
      "performanceScore": 40,
      "attendance": 50,
      "satisfactionScore": 1,
      "productivity": 30
    }
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Prediction generated successfully",
    "data": {
      "prediction": {
        "_id": "60d5ec49f1a2c80015f8e9b0",
        "employee": "60d5ec49f1a2c80015f8e9a5",
        "prediction": 98,
        "confidence": 0.89,
        "riskLevel": "HIGH",
        "explanation": {
          "features": [
            { "name": "satisfactionScore", "importance": -0.32, "value": "1" },
            { "name": "attendance", "importance": -0.36, "value": "50" }
          ],
          "summary": "Unified exit gradient computed successfully.",
          "details": "The main feature driving this score is satisfactionScore."
        },
        "ethicalCheck": {
          "passed": false,
          "biasDetected": true,
          "biasDetails": "Risk 98% exceeds limit of 70% set by rule: \"High Attrition Risk Firewall Limit\""
        }
      }
    }
  }
  ```

#### 3. GET `/predictions/history`
Fetches chronological list of generated AI predictions with stored SHAP attributions.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Prediction history retrieved successfully",
    "data": {
      "history": [
        {
          "_id": "60d5ec49f1a2c80015f8e9c1",
          "employee": "60d5ec49f1a2c80015f8e9a5",
          "prediction": 98,
          "riskLevel": "HIGH",
          "type": "ATTRITION",
          "shapValues": [...]
        }
      ]
    }
  }
  ```

---

### 🛡️ Human-in-the-Loop Approval Endpoints

#### 4. GET `/approvals`
Lists pending high-risk decision approvals in the HIP governance queue.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Success Response (200 OK)**

#### 5. PUT `/approvals/:id/approve`
Approves a pending high-risk AI prediction override.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
  ```json
  {
    "comments": "Reviewed performance metrics and approved exception."
  }
  ```
* **Success Response (200 OK)**

---

### 🔒 Security Audit Logs Endpoints

#### 6. GET `/audit-logs`
Queries paginated cryptographic system audit logs (SUPER_ADMIN only).
* **Headers**: `Authorization: Bearer <accessToken>`
* **Success Response (200 OK)**

#### 7. GET `/audit-logs/export`
Generates authorized CSV download stream of system audit logs.
* **Headers**: `Authorization: Bearer <accessToken>`
* **Success Response (200 OK)**: File Stream (`Content-Type: text/csv`)
