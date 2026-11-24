import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../api';
import { useApp } from '../context/AppContext';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ name: '', address: '', city: '', postalCode: '', country: 'India' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = event => setAddress(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    if (!cart.length) return navigate('/cart');
    setBusy(true);
    setError('');
    try {
      if (!await loadRazorpayScript()) throw new Error('Unable to load Razorpay Checkout. Check your internet connection.');
      const { data: order } = await api.post('/orders', {
        items: cart.map(item => ({ product: item._id, quantity: item.quantity })),
        shippingAddress: address
      });
      const { data: paymentOrder } = await api.post('/payments/create-order', { orderId: order._id });

      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: paymentOrder.name,
        description: paymentOrder.description,
        order_id: paymentOrder.razorpayOrderId,
        theme: { color: '#24483e' },
        prefill: { name: address.name },
        notes: { mongoOrderId: order._id },
        handler: async response => {
          try {
            await api.post('/payments/verify', { ...response, orderId: order._id });
            clearCart();
            navigate('/payment/success');
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || 'Payment verification is pending. Check My Orders before attempting another payment.');
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) }
      });
      checkout.on('payment.failed', response => {
        setError(response.error?.description || 'Payment failed. You can try checkout again.');
        setBusy(false);
      });
      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
      setBusy(false);
    }
  };

  return <div className="auth-wrap"><form className="panel auth-panel wide checkout-panel" onSubmit={submit}>
    <span className="eyebrow">ALMOST YOURS</span><h1>Delivery details</h1>
    <p className="muted">Where should we send your order?</p>
    {Object.entries({ name: 'Full name', address: 'Street address', city: 'City', postalCode: 'Postal code', country: 'Country' }).map(([key, label]) => <label key={key}>{label}<input name={key} value={address[key]} onChange={change} required maxLength="200" autoComplete={key === 'name' ? 'name' : key === 'address' ? 'street-address' : key === 'postalCode' ? 'postal-code' : 'address-level2'} /></label>)}
    <div className="checkout-total"><span>Order total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="primary full" disabled={busy || !cart.length}>{busy ? 'Opening secure checkout…' : 'Pay securely with Razorpay'}</button>
    <p className="secure-note"><ShieldCheck size={15}/> Secure checkout · Payment details are handled by Razorpay</p>
    <p className="muted small">Use Razorpay test keys and test payment methods while developing.</p>
  </form></div>;
}
