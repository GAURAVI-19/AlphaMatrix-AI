import Joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
  JWT_SECRET: Joi.string().required().description('JWT Access Token secret'),
  JWT_REFRESH_SECRET: Joi.string().required().description('JWT Refresh Token secret'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info')
}).unknown().required();

const { error, value } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('❌ Environment validation failed:');
  error.details.forEach((detail) => {
    console.error(`  - ${detail.message}`);
  });
  throw new Error('Invalid environment configuration');
}

export default value;
