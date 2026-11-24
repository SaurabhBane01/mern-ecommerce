import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
export default function ProtectedRoute({ admin = false }) { const { user } = useApp(); if (!user) return <Navigate to="/login" replace/>; if (admin && user.role !== 'admin') return <Navigate to="/" replace/>; return <Outlet/>; }
