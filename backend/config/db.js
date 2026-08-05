import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/happymoments';
    
    // Auto-sanitize angle brackets from username/password placeholders if left by the user
    if (typeof uri === 'string' && (uri.includes('<') || uri.includes('>'))) {
      uri = uri.replace(/<|>/g, '');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if offline
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.isMockDB = false;
  } catch (error) {
    console.error('==================================================');
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('SERVER RUNNING IN SANDBOX DEMO MODE (Local In-Memory DB)');
    console.error('==================================================');
    global.isMockDB = true;
  }
};

export default connectDB;
