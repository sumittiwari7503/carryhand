import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Clock, Star, MapPin, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Booking } from '../types';
import { Spinner, StatusBadge, EmptyState } from '../components/common/UI';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings')
      .then(res => setBookings(res.data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['pending', 'accepted', 'active'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent: bookings.filter(b => b.status === 'completed').reduce((a, b) => a + b.price, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Good day, {user?.name.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-1">Here's your shopping activity</p>
          </div>
          <Link to="/book" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Book Assistant
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-50' },
            { label: 'Active', value: stats.active, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: Star, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Total Spent', value: `₹${stats.spent}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
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

        {/* Quick Book Banner */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Ready to shop?</h2>
              <p className="text-brand-100 text-sm">Verified assistants available near you right now.</p>
            </div>
            <Link to="/book" className="bg-white text-brand-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm">
              Book Now →
            </Link>
          </div>
        </div>

        {/* Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Recent Bookings</h2>
            <span className="text-sm text-gray-400">{bookings.length} total</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8" />}
              title="No bookings yet"
              description="Your first shopping session is just a click away."
              action={<Link to="/book" className="btn-primary text-sm py-2">Book Your First Assistant</Link>}
            />
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{booking.location.name}</div>
                      <div className="text-gray-400 text-xs">{booking.duration}h • ₹{booking.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={booking.status} />
                    {/* Show Track for active bookings */}
                    {booking.status === 'active' && (
                      <Link to={`/tracking/${booking._id}`}
                        className="text-xs text-brand-600 font-semibold hover:text-brand-700 border border-brand-200 px-2 py-1 rounded-lg">
                        Track
                      </Link>
                    )}
                    {/* Show Chat for accepted/active bookings that have an assistant */}
                    {['accepted', 'active'].includes(booking.status) && booking.assistant && (
                      <Link to={`/chat/${booking._id}`}
                        className="text-xs text-white bg-brand-500 hover:bg-brand-600 font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
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
  );
}
