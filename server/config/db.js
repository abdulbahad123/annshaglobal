import mongoose from 'mongoose';
import dns from 'dns';

// Ensure Google & Cloudflare DNS for reliable SRV resolution on all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

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
