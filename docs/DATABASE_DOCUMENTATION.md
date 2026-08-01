# Database Documentation
## AlphaMatrix MongoDB Schema Specification

### Database Engine
* **DBMS**: MongoDB v6.0+
* **ODM**: Mongoose v7.0
* **Database Name**: `alphamatrix`

---

### Collections & Schemas

#### 1. `users` Collection
Stores authentication credentials, role assignments, profile fields, and refresh tokens.
* **Fields**:
  * `_id`: `ObjectId` (Primary Key)
  * `name`: `String` (Required)
  * `email`: `String` (Required, Unique, Indexed)
  * `password`: `String` (Required, Select: false, bcrypt hash)
  * `role`: `String` (Enum: `SUPER_ADMIN`, `BRANCH_MANAGER`, `EMPLOYEE`, Default: `EMPLOYEE`)
  * `branch`: `ObjectId` (Ref: `Branch`)
  * `department`: `String`
  * `position`: `String`
  * `status`: `String` (Enum: `ACTIVE`, `INACTIVE`, `SUSPENDED`)
  * `loginAttempts`: `Number` (Default: 0)
  * `lockedUntil`: `Date`
  * `refreshTokens`: `[String]`

#### 2. `employees` Collection
Stores employee operational profiles, performance ratings, skill matrices, LMS enrollments, and metric vectors.
* **Fields**:
  * `_id`: `ObjectId`
  * `userId`: `ObjectId` (Ref: `User`, Required, Indexed)
  * `employeeId`: `String` (Required, Unique, e.g. `EMP-001`)
  * `branch`: `ObjectId` (Ref: `Branch`, Required)
  * `department`: `String`
  * `position`: `String`
  * `salary`: `Number`
  * `performance`: `Object`
    * `currentScore`: `Number` (0–100)
    * `level`: `String` (Enum: `POOR`, `AVERAGE`, `GOOD`, `EXCELLENT`)
    * `attendance`: `Number` (0–100)
    * `productivity`: `Number` (0–100)
    * `quality`: `Number` (0–100)
    * `teamwork`: `Number` (0–100)
    * `initiative`: `Number` (0–100)
  * `skills`: `Array<{ name: String, proficiency: String }>`
  * `courses`: `[ObjectId]` (Ref: `Course`)
  * `satisfactionScore`: `Number` (1–10)
  * `attritionRisk`: `Number` (0–100)

#### 3. `predictions` Collection
Stores model predictions, confidence indices, ethical check results, and embedded SHAP feature attributions.
* **Fields**:
  * `_id`: `ObjectId`
  * `employee`: `ObjectId` (Ref: `Employee`, Required)
  * `type`: `String` (Enum: `ATTRITION`, `PERFORMANCE`, `PROMOTION`)
  * `domain`: `String` (Default: `HR`)
  * `selectedModel`: `String` (Default: `XGBOOST`)
  * `certificateId`: `String` (Unique, e.g. `AM-CERT-1785608`)
  * `prediction`: `Number` (0–100)
  * `confidence`: `Number` (0.0–1.0)
  * `riskLevel`: `String` (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  * `explanation`: `Object`
    * `features`: `Array<{ name: String, importance: Number, value: String }>`
    * `summary`: `String`
    * `details`: `String`
  * `ethicalCheck`: `Object`
    * `passed`: `Boolean`
    * `biasDetected`: `Boolean`
    * `biasDetails`: `String`
    * `riskScore`: `Number`

#### 4. `approvals` Collection
Tracks human-in-the-loop managerial overrides for high-risk predictions.
* **Fields**:
  * `_id`: `ObjectId`
  * `prediction`: `ObjectId` (Ref: `Prediction`)
  * `employee`: `ObjectId` (Ref: `Employee`)
  * `createdBy`: `ObjectId` (Ref: `User`)
  * `status`: `String` (Enum: `PENDING`, `APPROVED`, `REJECTED`)
  * `comments`: `Array<{ author: ObjectId, text: String, timestamp: Date }>`

#### 5. `auditlogs` Collection
Immutable ledger storing all user events, logins, and predictions.
* **Fields**:
  * `_id`: `ObjectId`
  * `user`: `ObjectId` (Ref: `User`)
  * `action`: `String` (e.g. `GENERATE_PREDICTION`, `LOGIN`, `CREATE_ETHICAL_RULE`)
  * `module`: `String`
  * `status`: `String` (Enum: `SUCCESS`, `FAILURE`)
  * `ipAddress`: `String`
  * `createdAt`: `Date` (Indexed)
