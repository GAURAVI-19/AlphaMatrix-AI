# Deployment Guide
## AlphaMatrix Production Containerization & Deployment

### 1. Docker Compose Deployment Overview
AlphaMatrix includes a production multi-stage `docker-compose.yml` orchestrating MongoDB, Backend API, Python AI Service, and Nginx Frontend.

```
+-------------------------------------------------------------------------+
|                              Docker Host                                |
|                                                                         |
|  +---------------------+  +---------------------+  +-----------------+  |
|  |   Frontend Nginx    |  |   Backend Gateway   |  |   Python AI     |  |
|  |     Port: 80        |  |     Port: 5000      |  |   Port: 8000    |  |
|  +---------------------+  +---------------------+  +-----------------+  |
|             │                        │                      │           |
|             └────────────────────────┼──────────────────────┘           |
|                                      ▼                                  |
|                             +-----------------+                         |
|                             |  MongoDB Container|                       |
|                             |   Port: 27017   |                         |
|                             +-----------------+                         |
+-------------------------------------------------------------------------+
```

---

### 2. Launching with Docker Compose

```bash
# Build and launch all services in detached mode
docker-compose up -d --build

# Verify container status
docker-compose ps
```

---

### 3. Production Environment Variables (`.env.production`)

```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongo:27017/alphamatrix_prod
JWT_SECRET=prod_alphamatrix_jwt_secret_998877
JWT_REFRESH_SECRET=prod_alphamatrix_refresh_secret_998877
AI_SERVICE_URL=http://ai_service:8000
CORS_ORIGIN=https://alphamatrix.enterprise.com
```

---

### 4. Nginx Reverse Proxy Configuration (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/v1 {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
