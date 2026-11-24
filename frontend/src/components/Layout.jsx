import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
export default function Layout() {
  const { user, cart, logout } = useApp(); const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/'); };
  return <><header className="topbar"><Link className="brand" to="/"><ShoppingBag size={24}/> ShopSphere</Link><nav><NavLink to="/">Shop</NavLink>{user && <NavLink to="/orders">My orders</NavLink>}{user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}<NavLink className="cart-link" to="/cart"><ShoppingCart size={18}/> Cart ({cart.reduce((n, x) => n + x.quantity, 0)})</NavLink>{user ? <button className="nav-button" onClick={signOut}><LogOut size={16}/> Logout</button> : <Link to="/login"><User size={16}/> Login</Link>}</nav></header><main className="container"><Outlet/></main><footer>© {new Date().getFullYear()} ShopSphere </footer></>;
}
