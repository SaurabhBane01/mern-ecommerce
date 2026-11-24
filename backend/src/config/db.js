import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Add it to backend/.env or your hosting environment variables.');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
}
