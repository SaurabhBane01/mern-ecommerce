import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ message: 'Provide between 1 and 50 cart items.' });
    const requiredAddress = ['name', 'address', 'city', 'postalCode', 'country'];
    if (!shippingAddress || requiredAddress.some(key => !String(shippingAddress[key] || '').trim())) {
      return res.status(400).json({ message: 'Complete all shipping address fields.' });
    }

    const normalized = [];
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.product)) return res.status(400).json({ message: 'Invalid product in cart.' });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: 'Each item quantity must be between 1 and 20.' });
      const product = await Product.findById(item.product);
      if (!product || product.stock < quantity) return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'an item'}` });
      normalized.push({ product: product.id, name: product.name, image: product.image, price: product.price, quantity });
    }

    const total = Number(normalized.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    if (!Number.isFinite(total) || total <= 0) return res.status(400).json({ message: 'Invalid order total.' });
    const cleanAddress = Object.fromEntries(requiredAddress.map(key => [key, String(shippingAddress[key]).trim().slice(0, 200)]));
    const order = await Order.create({ user: req.user.id, items: normalized, shippingAddress: cleanAddress, total });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Could not create order. Check the cart and shipping details.' });
  }
});

router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
}));

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
}));

router.patch('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const allowed = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: 'Invalid order status' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentStatus !== 'paid') return res.status(409).json({ message: 'Only paid orders can be moved through fulfilment.' });
  order.orderStatus = req.body.orderStatus;
  await order.save();
  res.json(order);
}));

export default router;
