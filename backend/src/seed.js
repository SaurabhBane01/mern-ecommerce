import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import mongoose from 'mongoose';

const email = String(process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || '';
if (!email || password.length < 12) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12+ characters) in backend/.env before running the seed script.');
  process.exit(1);
}

await connectDB();
let admin = await User.findOne({ email });
if (!admin) {
  admin = await User.create({ name: 'Store Admin', email, password: await bcrypt.hash(password, 12), role: 'admin' });
  console.log('Admin account created:', email);
} else {
  console.log('Admin account already exists:', email);
}

if (!await Product.countDocuments()) {
  await Product.insertMany([
    { name: 'Classic Sneakers', description: 'Everyday lightweight sneakers with a clean, versatile design.', price: 2499, category: 'Footwear', stock: 20, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
    { name: 'Smart Watch', description: 'A modern smartwatch for everyday productivity and fitness tracking.', price: 3999, category: 'Electronics', stock: 15, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
    { name: 'Travel Backpack', description: 'A durable everyday backpack with practical storage.', price: 1799, category: 'Accessories', stock: 30, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' }
  ]);
  console.log('Sample products created.');
}
await mongoose.disconnect();
console.log('Seed complete. Keep the admin password private.');
