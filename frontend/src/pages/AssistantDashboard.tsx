import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Briefcase, Star, Power, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Booking, Assistant } from '../types';
import { Spinner, StatusBadge, EmptyState, Alert } from '../components/common/UI';

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pending, setPending] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [bookRes, pendRes, profRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/pending'),
        api.get('/assistants/me')
      ]);
      setBookings(bookRes.data.bookings || []);
      setPending(pendRes.data.bookings || []);
      setProfile(profRes.data.assistant || null);
    } catch {
      setMessage('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleOnline = async () => {
    if (!profile?.isApproved) return;
    setToggling(true);
    try {
      const res = await api.put('/assistants/toggle-availability');
      setProfile(p => p ? { ...p, isOnline: res.data.isOnline } : p);
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setToggling(false);
    }
  };

  const handleBookingAction = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage(e?.response?.data?.message || 'Action failed');
    }
  };

  const stats = {
    earnings: profile?.totalEarnings || 0,
    jobs: profile?.completedJobs || 0,
    rating: profile?.rating || 0,
    active: bookings.filter(b => b.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name.split(' ')[0]}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!profile?.isApproved ? (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl text-sm">
                <AlertTriangle className="w-4 h-4" /> Pending Approval
              </div>
            ) : (
              <button onClick={toggleOnline} disabled={toggling} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${profile?.isOnline ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                {toggling ? <Spinner size="sm" /> : <Power className="w-4 h-4" />}
                {profile?.isOnline ? 'Online' : 'Go Online'}
              </button>
            )}
          </div>
        </div>

        {message && <div className="mb-4"><Alert type="info" message={message} onClose={() => setMessage('')} /></div>}

        {!profile?.isApproved && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Your profile is under review</p>
              <p className="text-yellow-600 text-sm mt-0.5">Our team will verify your details and approve your account within 24–48 hours.</p>
              <Link to="/profile" className="text-yellow-700 font-semibold text-sm underline mt-1 inline-block">Complete your profile →</Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₹${stats.earnings}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Jobs Done', value: stats.jobs, icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-50' },
            { label: 'Rating', value: stats.rating ? `${stats.rating}★` : 'N/A', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            { label: 'Active Jobs', value: stats.active, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-gray-900">Pending Requests</h2>
              <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full">{pending.length}</span>
            </div>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> :
              pending.length === 0 ? (
                <EmptyState icon={<Briefcase className="w-7 h-7" />} title="No pending requests" description="Stay online to receive new booking requests." />
              ) : (
                <div className="space-y-3">
                  {pending.map(b => (
                    <div key={b._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{b.location.name}</div>
                          <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{b.location.address}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-brand-600">₹{b.price}</div>
                          <div className="text-xs text-gray-400">{b.duration}h</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">Customer: {b.customer?.name}</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleBookingAction(b._id, 'accepted')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                          <CheckCircle className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => handleBookingAction(b._id, 'rejected')} className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Recent Jobs */}
          <div className="card">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">My Jobs</h2>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> :
              bookings.length === 0 ? (
                <EmptyState icon={<Briefcase className="w-7 h-7" />} title="No jobs yet" description="Once you accept bookings, they'll appear here." />
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 6).map(b => (
                    <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-brand-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{b.location.name}</div>
                          <div className="text-xs text-gray-400">{b.duration}h · ₹{b.price}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        {b.status === 'accepted' && (
                          <button onClick={() => handleBookingAction(b._id, 'active')} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition-colors">Start</button>
                        )}
                        {b.status === 'active' && (
                          <button onClick={() => handleBookingAction(b._id, 'completed')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors">Complete</button>
                        )}
                        {['accepted', 'active'].includes(b.status) && (
                          <Link to={`/chat/${b._id}`} className="text-xs bg-brand-500 text-white px-2 py-1 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Chat
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
