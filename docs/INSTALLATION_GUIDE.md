# Installation Guide
## AlphaMatrix Responsible AI Enterprise Platform

### Prerequisites & Dependencies
* **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu 20.04+)
* **Node.js**: v18.0.0 or higher
* **Python**: v3.10.0 or higher
* **MongoDB**: v6.0 or higher running locally on `mongodb://127.0.0.1:27017`

---

### Step-by-Step Installation

#### 1. Repository Setup
```bash
git clone https://github.com/AlphaMatrix/AlphaMatrix19.git
cd AlphaMatrix19
```

#### 2. Backend Gateway Service
```bash
cd backend
npm install

# Configure environment variables (.env)
cat <<EOT > .env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/alphamatrix
JWT_SECRET=super_secret_jwt_alphamatrix_key_2026
JWT_REFRESH_SECRET=super_secret_refresh_jwt_alphamatrix_key_2026
AI_SERVICE_URL=http://localhost:8000
EOT

# Seed database with sample enterprise data
npm run seed

# Start server
npm run dev
```

#### 3. Python AI Microservice
```bash
cd ../ai_service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Start FastAPI server
python app.py
```

#### 4. Frontend Client
```bash
cd ../frontend
npm install

# Start Vite development server
npm run dev
```

#### 5. Verification
Open your browser and navigate to `http://localhost:5173`. Log in using `admin@alphamatrix.com` and password `Admin@123456`.
