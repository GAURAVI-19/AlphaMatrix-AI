# 🛡️ AlphaMatrix: Hardened Multi-Domain Layered AI Decision Backend System

AlphaMatrix is an enterprise-grade, highly secure, explainable, and ethical AI-powered decision intelligence platform. It features real-time predictions, SHAP model transparency, a human-in-the-loop decision approval pipeline, and a layered role-based architecture designed to deploy at FAANG-level quality.

---

## 🚀 Key Architectural Features

### 1. Hardened API Space (v1)
* **Pre-fixed Routes**: Secure endpoints grouped under the `/api/v1/` prefix space.
* **Backward Compatibility**: Parallel legacy route support to prevent breakage in existing integrations or test suites.

### 2. Multi-Tier Cache with Failover
* **Real Redis Caching**: Active caching inside executive dashboard metrics endpoints with 5-minute TTL expirations.
* **Resilient Fallback**: Auto-failover to a local memory cache map with real TTLs on connection losses.

### 3. Bulletproof Input Sanitization Middleware
* **NoSQL Injection Guard**: Automatically blocks any payload keys starting with `$` or containing `.`.
* **XSS Script Sweeper**: Filters scripts and tags case-insensitively from string payloads.

### 4. Correlation Trace Logging
* **Async Request Contexts**: Uses Node `AsyncLocalStorage` to associate a unique `requestId` to every execution trace.
* **JSON Structured Logs**: Rotates files under `logs/error.log` and `logs/combined.log` in structured formats.

### 5. Highly Optimized DB Schema
* **High-Speed Indexes**: Sparse/compound indexes on roles, branch lookups, and employee associations.
* **Hydrator Bypass (`.lean()`)**: Applied `.lean()` read-only flags to boost read times and slash system overhead.

---

## 🛠️ Tech Stack & Services
* **Engine**: Node.js, Express.js (ES Modules)
* **Database**: MongoDB (Mongoose schemas)
* **Caching**: Redis (using `ioredis`)
* **Process Manager**: PM2 Runtime
* **Containerization**: Docker (multi-stage builds)
* **Testing**: Jest, Supertest

---

## 📦 Getting Started

### 1. Configuration
Create a `.env` file in the root workspace folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/alphamatrix
JWT_SECRET=supersecretaccesskey123
JWT_REFRESH_SECRET=supersecretrefreshkey456
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

### 2. Run Locally (Development)
```bash
# Install dependencies
npm install

# Run database & cache servers locally, then trigger dev boot
npm run dev
```

### 3. Execute Verification Suite
```bash
npm run test
```

---

## 🐳 Containerized Production Deployment

### PM2 Clustered Run
To start the clustered process manager scaling horizontal instances dynamically across CPU cores:
```bash
# Install PM2 globally
npm install -g pm2

# Run production runtime cluster
npm start
```

### Docker Multi-Stage Build
Compile and run the secure, lightweight Node container:
```bash
# Build production image
docker build -t alphamatrix-backend .

# Run container mapping port 5000
docker run -p 5000:5000 --env-file .env alphamatrix-backend
```

---

## 🛡️ Standard API Spec Summary

* **Interactive OpenAPI Specs**: served live at `/api/docs`
* **Real-time Health Status**: served live at `/health`

### Global Response Contract

All endpoint operations return a standardized JSON envelope:
```json
{
  "success": true,
  "message": "Operations successful",
  "data": {},
  "error": null
}
```
If an operation encounters a syntax or runtime error:
```json
{
  "success": false,
  "message": "Operation failed",
  "data": {},
  "error": "Error Description Details"
}
```
