import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annshaglobal';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] MongoDB connection warning: ${err.message}`);
    console.warn(`[Database] Please ensure MongoDB is running at ${uri} or set MONGO_URI in server/.env`);
    return null;
  }
};
