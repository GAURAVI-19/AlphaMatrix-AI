import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import env from './envValidation.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`Database Connection Error: ${error.message}`);
    console.error('❌ MongoDB Connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
