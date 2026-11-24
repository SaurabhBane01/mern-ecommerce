import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, ArrowUpRight } from 'lucide-react';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useApp();
  const load = async (term = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: term ? { search: term } : {} });
      setProducts(data);
      setError('');
    } catch {
      setError('Could not load products. Check your API connection and try again.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return <>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">THE EVERYDAY EDIT</span><h1>Find your next<br/><em>favourite thing.</em></h1><p>Thoughtfully picked essentials, delivered to your door.</p><a href="#products" className="primary-link">Explore collection <ArrowUpRight size={16}/></a></div>
      <div className="hero-art" aria-label="ShopSphere curated collection"><div className="hero-circle">SS</div><span>GOOD FINDS.<br/>GREAT DAYS.</span></div>
      <span className="hero-index">01 / CURATED FOR YOU</span>
    </section>
    <section id="products" className="section-head"><div><span className="eyebrow">OUR COLLECTION</span><h2>Shop the latest</h2><p className="muted">Useful pieces. Considered details.</p></div>
      <form className="search" onSubmit={event => { event.preventDefault(); load(search); }}><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products…" aria-label="Search products"/><button>Search</button></form>
    </section>
    {error && <p className="error" role="alert">{error} <button className="text-button" onClick={() => load(search)}>Retry</button></p>}
    {loading ? <p className="empty">Loading the collection…</p> : <div className="product-grid">{products.map(product => <article className="product-card" key={product._id}>
      <Link className="product-image-link" to={`/products/${product._id}`}><img src={product.image} alt={product.name} loading="lazy"/><span className="image-cta">View product <ArrowUpRight size={14}/></span></Link>
      <div className="product-info"><span className="category">{product.category}</span><Link className="product-name" to={`/products/${product._id}`}>{product.name}</Link><div className="product-bottom"><strong>₹{product.price.toLocaleString('en-IN')}</strong><button className="icon-button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`} disabled={!product.stock}><ShoppingCart size={18}/></button></div><span className="stock-note">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></div>
    </article>)}</div>}
    {!loading && !products.length && !error && <p className="empty">No products found. Try another search or add products from the admin dashboard.</p>}
  </>;
}
