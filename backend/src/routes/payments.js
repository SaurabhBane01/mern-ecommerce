import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = Router();
const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });

function getRazorpay() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.');
    error.status = 503;
    throw error;
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

function safeHexEqual(received, expected) {
  if (typeof received !== 'string' || !/^[a-f0-9]+$/i.test(received)) return false;
  const a = Buffer.from(received, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

// Create the Razorpay order from the trusted MongoDB order total (never a client-supplied amount).
router.post('/create-order', paymentLimiter, protect, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid') return res.status(409).json({ message: 'This order has already been paid.' });
    if (order.paymentStatus === 'failed') return res.status(409).json({ message: 'This order payment failed. Create a new order to retry.' });

    const amount = Math.round(order.total * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) return res.status(400).json({ message: 'Order amount must be at least ₹1.00.' });

    const razorpayOrder = order.razorpayOrderId
      ? await razorpay.orders.fetch(order.razorpayOrderId)
      : await razorpay.orders.create({
          amount,
          currency: 'INR',
          receipt: `ord_${order.id}`.slice(0, 40),
          notes: { mongoOrderId: order.id, userId: req.user.id }
        });
    if (razorpayOrder.amount !== amount || razorpayOrder.currency !== 'INR') {
      return res.status(409).json({ message: 'Existing Razorpay order details do not match this order.' });
    }
    if (!order.razorpayOrderId) {
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'ShopSphere',
      description: `Payment for order ${order.id}`
    });
  } catch (error) {
    res.status(error.status || 502).json({ message: error.status ? error.message : 'Unable to create Razorpay order. Please try again.' });
  }
});

// Verify the Checkout signature AND confirm the payment with Razorpay before marking it paid.
router.post('/verify', paymentLimiter, protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Razorpay is not configured on the server.' });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
      if (order.razorpayPaymentId === razorpay_payment_id) return res.json({ message: 'Payment was already verified', order });
      return res.status(409).json({ message: 'This order has already been paid with a different payment reference.' });
    }
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Razorpay order does not match this purchase' });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest('hex');
    if (!safeHexEqual(razorpay_signature, expectedSignature)) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (payment.order_id !== order.razorpayOrderId || payment.amount !== Math.round(order.total * 100) || payment.currency !== 'INR') {
      return res.status(400).json({ message: 'Payment details do not match this order' });
    }
    if (payment.status !== 'captured') {
      return res.status(409).json({ message: 'Payment is not captured yet. The order will update when Razorpay confirms capture.' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'Processing';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(error.status || 502).json({ message: error.status ? error.message : 'Could not verify payment with Razorpay. Check the order status before retrying.' });
  }
});

// Configure this URL in Razorpay Dashboard > Account & Settings > Webhooks.
// Keep express.raw() in server.js before express.json() or signature validation will fail.
export async function razorpayWebhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send('Webhook secret is not configured');
  if (!Buffer.isBuffer(req.body)) return res.status(400).send('Expected raw JSON body');

  const signature = req.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (!safeHexEqual(signature, expected)) return res.status(400).send('Invalid webhook signature');

  try {
    const event = JSON.parse(req.body.toString('utf8'));
    const eventId = req.get('x-razorpay-event-id');
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id || event.payload?.order?.entity?.id;
    if (!razorpayOrderId) return res.status(200).json({ received: true, ignored: true });

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(200).json({ received: true, ignored: true });
    if (eventId && order.webhookEventIds.includes(eventId)) return res.status(200).json({ received: true, duplicate: true });

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paidOrder = event.payload?.order?.entity;
      const eventAmount = payment?.amount ?? paidOrder?.amount_paid;
      const eventCurrency = payment?.currency ?? paidOrder?.currency;
      if (eventAmount !== undefined && eventAmount !== Math.round(order.total * 100)) return res.status(400).send('Payment amount mismatch');
      if (eventCurrency && eventCurrency !== 'INR') return res.status(400).send('Payment currency mismatch');
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'Processing';
        if (payment?.id) order.razorpayPaymentId = payment.id;
      }
    } else if (event.event === 'payment.failed') {
      if (order.paymentStatus !== 'paid') order.paymentStatus = 'failed';
    } else {
      return res.status(200).json({ received: true, ignored: true });
    }

    if (eventId) {
      order.webhookEventIds.push(eventId);
      if (order.webhookEventIds.length > 100) order.webhookEventIds = order.webhookEventIds.slice(-100);
    }
    await order.save();
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error.message);
    return res.status(500).send('Webhook processing failed');
  }
}

export default router;
