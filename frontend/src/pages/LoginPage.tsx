import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/common/UI';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role: string) => {
    if (role === 'admin') return '/admin';
    if (role === 'assistant') return '/assistant/dashboard';
    return '/customer/dashboard';
  };
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(getDashboardPath(loggedInUser.role));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    if (role === 'customer') setForm({ email: 'priya@example.com', password: 'password123' });
    else if (role === 'assistant') setForm({ email: 'ramesh@example.com', password: 'password123' });
    else setForm({ email: 'admin@carryhand.com', password: 'admin123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">CarryHand</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to continue shopping smarter</p>
        </div>

        <div className="card">
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          {/* Demo Credentials */}
          <div className="mb-5 p-3 bg-brand-50 rounded-xl border border-brand-100">
            <p className="text-xs text-brand-700 font-semibold mb-2">Demo Accounts (click to fill):</p>
            <div className="flex gap-2 flex-wrap">
              {['customer', 'assistant', 'admin'].map(r => (
                <button key={r} onClick={() => fillDemo(r)} className="text-xs bg-brand-500 text-white px-2.5 py-1 rounded-lg capitalize hover:bg-brand-600 transition-colors">
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-700">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
