import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
export default function Payment({ success = false }) {
  const Icon = success ? CheckCircle2 : AlertCircle;
  return <div className="empty-state payment-state">
    <Icon size={48} aria-hidden="true" className={success ? 'success-icon' : 'warning-icon'}/>
    <span className="eyebrow">PAYMENT</span>
    <h1>{success ? 'Payment successful!' : 'Payment not completed'}</h1>
    <p>{success ? 'Your payment was verified and your order is confirmed.' : 'Your order may remain pending. Check your order history before trying to pay again.'}</p>
    <Link className="primary-link" to={success ? '/orders' : '/orders'}>View my orders</Link>
    {!success && <p><Link to="/cart" className="text-button">Return to cart</Link></p>}
  </div>;
}
