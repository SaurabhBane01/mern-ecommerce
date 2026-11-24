import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const productFields = ['name', 'description', 'price', 'image', 'category', 'stock'];
function productInput(body) {
  return Object.fromEntries(productFields.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
}

router.get('/', asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim().slice(0, 80);
  const filter = search ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(products);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}));

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(productInput(req.body));
    res.status(201).json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, productInput(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}));

export default router;
