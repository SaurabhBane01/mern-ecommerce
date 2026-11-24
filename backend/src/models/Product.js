import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: 'https://placehold.co/600x400?text=Product' },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
