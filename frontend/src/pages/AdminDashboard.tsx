import React, { useEffect, useState } from 'react';
import { Users, Briefcase, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { Spinner, StatusBadge } from '../components/common/UI';

interface DashStats {
  totalUsers: number;
  totalAssistants: number;
  totalBookings: number;
  pendingApprovals: number;
  activeBookings: number;
  totalRevenue: number;
}

interface PendingAssistant {
  _id: string;
  user: { name: string; email: string; phone?: string; createdAt: string };
  bio?: string;
  languages?: string[];
  location?: { city: string };
}

interface BookingItem {
  _id: string;
  customer?: { name: string; email: string };
  assistant?: { name: string; email: string };
  location: { name: string };
  status: string;
  price: number;
  duration: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [pendingAssistants, setPendingAssistants] = useState<PendingAssistant[]>([]);
  const [tab, setTab] = useState<'overview' | 'assistants' | 'bookings'>('overview');
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/assistants/pending')
    ]).then(([dashRes, pendRes]) => {
      setStats(dashRes.data.stats);
      setRecentBookings(dashRes.data.recentBookings);
      setPendingAssistants(pendRes.data.assistants);
    }).catch(() => {
      setActionMsg('Failed to load dashboard. Please refresh.');
    }).finally(() => setLoading(false));
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setAllBookings(res.data.bookings);
    } catch {
      setActionMsg('Failed to load bookings');
    }
  };

  const approveAssistant = async (id: string, approve: boolean) => {
    await api.put(`/admin/assistants/${id}/approve`, { approve });
    setPendingAssistants(p => p.filter(a => a._id !== id));
    setActionMsg(`Assistant ${approve ? 'approved' : 'rejected'} successfully`);
    setTimeout(() => setActionMsg(''), 3000);
    if (stats) setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your CarryHand platform</p>
        </div>

        {actionMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Customers', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Assistants', value: stats?.totalAssistants, icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Total Bookings', value: stats?.totalBookings, icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-50' },
            { label: 'Pending Review', value: stats?.pendingApprovals, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            { label: 'Active Now', value: stats?.activeBookings, icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[['overview', 'Overview'], ['assistants', `Pending (${pendingAssistants.length})`], ['bookings', 'All Bookings']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key as typeof tab); if (key === 'bookings') loadBookings(); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === key ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="card">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Location</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Assistant</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{b.customer?.name || '—'}</td>
                      <td className="py-3 px-2 text-gray-500">{b.location?.name}</td>
                      <td className="py-3 px-2 text-gray-500">{b.assistant?.name || <span className="text-yellow-500 text-xs">Unassigned</span>}</td>
                      <td className="py-3 px-2"><StatusBadge status={b.status} /></td>
                      <td className="py-3 px-2 text-right font-semibold text-brand-600">₹{b.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Assistants Tab */}
        {tab === 'assistants' && (
          <div className="card">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">Pending Assistant Approvals</h2>
            {pendingAssistants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-semibold">All caught up!</p>
                <p className="text-sm text-gray-400">No assistants pending approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssistants.map(a => (
                  <div key={a._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{a.user?.name}</div>
                        <div className="text-sm text-gray-400">{a.user?.email}</div>
                        {a.user?.phone && <div className="text-sm text-gray-400">{a.user.phone}</div>}
                        {a.bio && <p className="text-sm text-gray-600 mt-2">{a.bio}</p>}
                        <div className="flex gap-2 mt-2">
                          {a.languages?.map(l => <span key={l} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{l}</span>)}
                          {a.location?.city && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{a.location.city}</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Applied: {new Date(a.user?.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => approveAssistant(a._id, true)} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => approveAssistant(a._id, false)} className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Bookings Tab */}
        {tab === 'bookings' && (
          <div className="card overflow-x-auto">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">All Bookings</h2>
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Customer', 'Location', 'Duration', 'Status', 'Amount', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allBookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{b.customer?.name || '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{b.location?.name}</td>
                    <td className="py-3 px-2 text-gray-500">{b.duration}h</td>
                    <td className="py-3 px-2"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-2 font-semibold text-brand-600">₹{b.price}</td>
                    <td className="py-3 px-2 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
