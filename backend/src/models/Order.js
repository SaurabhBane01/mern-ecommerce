import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  total: { type: Number, required: true, min: 1 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending Payment' },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: String,
  webhookEventIds: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
