import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AppContext = createContext(null);
function readStoredJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readStoredJson('user', null));
  const [cart, setCart] = useState(() => readStoredJson('cart', []));
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const login = async (credentials, endpoint = 'login') => {
    const { data } = await api.post(`/auth/${endpoint}`, credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  const addToCart = product => setCart(old => {
    const found = old.find(item => item._id === product._id);
    return found
      ? old.map(item => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock || 20) } : item)
      : [...old, { ...product, quantity: 1 }];
  });
  const updateQty = (id, quantity) => setCart(old => old.map(item => {
    if (item._id !== id) return item;
    const max = Math.max(1, Number(item.stock) || 20);
    return { ...item, quantity: Math.min(max, Math.max(1, Number(quantity) || 1)) };
  }));
  const removeFromCart = id => setCart(old => old.filter(item => item._id !== id));
  const clearCart = () => setCart([]);
  const value = useMemo(() => ({ user, cart, login, logout, addToCart, updateQty, removeFromCart, clearCart }), [user, cart]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
