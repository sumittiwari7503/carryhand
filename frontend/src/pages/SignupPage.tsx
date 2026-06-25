import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/common/UI';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: params.get('role') || 'customer' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('role')) setForm(f => ({ ...f, role: params.get('role') || 'customer' }));
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const registeredUser = await register(form);
      if (registeredUser.role === 'assistant') navigate('/assistant/dashboard');
      else if (registeredUser.role === 'admin') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">CarryHand</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500">Join thousands of happy shoppers</p>
        </div>

        <div className="card">
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', icon: User, label: 'Shop with assistance', sublabel: 'Hire a bag carrier' },
                { value: 'assistant', icon: Briefcase, label: 'Work as assistant', sublabel: 'Earn ₹500–₹2000/day' }
              ].map(({ value, icon: Icon, label, sublabel }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Icon className={`w-5 h-5 mb-1.5 ${form.role === value ? 'text-brand-500' : 'text-gray-400'}`} />
                  <div className={`font-semibold text-sm ${form.role === value ? 'text-brand-700' : 'text-gray-700'}`}>{label}</div>
                  <div className="text-xs text-gray-400">{sublabel}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input type="text" className="input-field" placeholder="Priya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
              <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our <Link to="/terms" className="text-brand-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
          <p className="text-center text-sm text-gray-500 mt-3">
            Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
