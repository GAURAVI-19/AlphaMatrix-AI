import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import sanitizeMiddleware from './middleware/sanitize.js';
import requestIdMiddleware from './middleware/requestId.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import pipRoutes from './routes/pipRoutes.js';
import ethicalRoutes from './routes/ethicalRuleRoutes.js';

const app = express(); // express app instantiation

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Ensure Swagger can load UI assets
}));

// Strict CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy - Strict Origin Verification failed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Global Input Sanitization Middleware (NoSQL Injection & XSS Protection)
app.use(sanitizeMiddleware);

// Global Request ID middleware (X-Request-Id & ReqContext storage)
app.use(requestIdMiddleware);

// Winston HTTP Request Logging Middleware (Start & Duration logs)
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request completed: ${req.method} ${req.originalUrl} [Status: ${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusLabels = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  const health = {
    status: dbStatus === 1 ? 'UP' : 'DOWN',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: statusLabels[dbStatus] || 'UNKNOWN',
      connected: dbStatus === 1
    }
  };

  return res.status(dbStatus === 1 ? 200 : 503).json({
    success: true,
    message: 'Health status check complete',
    data: health,
    error: null
  });
});

// Swagger Specification Document (OpenAPI 3.0)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AlphaMatrix AI Enterprise API Docs',
    version: '1.0.0',
    description: 'TOP 1% Multi-Domain Layered AI Decision System with Explainability, Ethics, and Human Oversight.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production API v1 Base Path'
    },
    {
      url: '/api',
      description: 'Legacy API Base Path (Backward Compatibility)'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT Access token here.'
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticate and retrieve Access + Refresh token pair.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@alphamatrix.com' },
                  password: { type: 'string', example: 'Admin@123456' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Logged in successfully' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Check API Health',
        description: 'Fetches the uptime and Mongoose database state.',
        responses: {
          200: { description: 'API health ok' }
        }
      }
    }
  }
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rate Limiting applied to API endpoints (both v1 and legacy)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please retry later.',
    data: {},
    error: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(['/api/', '/api/v1/'], limiter);

// API v1 Routes (Hardened Versioning Prefix)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/pips', pipRoutes);
app.use('/api/v1/ethical-rules', ethicalRoutes);

// Legacy API Routes (Backward Compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/pips', pipRoutes);
app.use('/api/ethical-rules', ethicalRoutes);

// Fallback endpoint
app.use(notFound);

// Central error catcher
app.use(errorHandler);

export default app;
