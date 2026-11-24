import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';
export default function Product() { const { id } = useParams(); const [p, setP] = useState(null); const [error, setError] = useState(''); const { addToCart } = useApp(); useEffect(() => { api.get(`/products/${id}`).then(r => setP(r.data)).catch(() => setError('Product not found')); }, [id]); if (error) return <p className="error">{error}</p>; if (!p) return <p>Loading product...</p>; return <div className="detail"><img src={p.image} alt={p.name}/><div><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><p>{p.description}</p><h2>₹{p.price.toLocaleString('en-IN')}</h2><p className="muted">{p.stock} available</p><button className="primary" disabled={!p.stock} onClick={() => addToCart(p)}>Add to cart</button></div></div>; }
