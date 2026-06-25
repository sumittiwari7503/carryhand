import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Shield, AlertTriangle, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { Booking } from '../types';
import { Spinner, Alert, StarRating } from '../components/common/UI';

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [error, setError] = useState('');
  const [assistantPos, setAssistantPos] = useState({ x: 30, y: 40 });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    api.get(`/bookings/${id}`)
      .then(res => {
        setBooking(res.data.booking);
        setSosTriggered(res.data.booking.sosTriggered);
        // Only animate position if booking is active
        if (res.data.booking.status === 'active') {
          interval = setInterval(() => {
            setAssistantPos(prev => ({
              x: Math.max(10, Math.min(85, prev.x + (Math.random() - 0.5) * 6)),
              y: Math.max(10, Math.min(85, prev.y + (Math.random() - 0.5) * 6))
            }));
          }, 2000);
        }
      })
      .catch(() => setError('Booking not found'))
      .finally(() => setLoading(false));

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]);

  const triggerSOS = async () => {
    setSosLoading(true);
    try {
      await api.post(`/bookings/${id}/sos`);
      setSosTriggered(true);
    } catch {
      setError('Failed to send SOS. Call 112 immediately.');
    } finally {
      setSosLoading(false);
    }
  };

  const getStatusStep = () => {
    if (!booking) return 0;
    if (booking.status === 'pending') return 1;
    if (booking.status === 'accepted') return 2;
    if (booking.status === 'active') return 3;
    if (booking.status === 'completed') return 4;
    return 0;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Spinner size="lg" /></div>;
  if (error || !booking) return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error || 'Booking not found'}</p>
        <Link to="/customer/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );

  const step = getStatusStep();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/customer/dashboard" className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Live Tracking</h1>
            <p className="text-gray-500 text-sm">{booking.location.name}</p>
          </div>
        </div>

        {/* Status Steps */}
        <div className="card mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0" />
            <div className="absolute left-0 h-0.5 bg-brand-500 z-0 transition-all duration-700" style={{ width: `${Math.min(((step - 1) / 3) * 100, 100)}%`, top: '20px' }} />
            {[
              { label: 'Requested', icon: Clock },
              { label: 'Accepted', icon: CheckCircle },
              { label: 'Active', icon: MapPin },
              { label: 'Delivered', icon: CheckCircle }
            ].map(({ label, icon: Icon }, i) => (
              <div key={label} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all ${i + 1 <= step ? 'border-brand-500 bg-brand-500' : 'border-gray-200'}`}>
                  <Icon className={`w-5 h-5 ${i + 1 <= step ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <span className={`text-xs mt-2 font-medium ${i + 1 <= step ? 'text-brand-600' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mock Map */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <div className="relative bg-gradient-to-br from-green-50 to-blue-50 h-72 sm:h-96 overflow-hidden">
                {/* Grid pattern to simulate map */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Mock roads */}
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d1d5db" strokeWidth="6" />
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#d1d5db" strokeWidth="4" />
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#d1d5db" strokeWidth="4" />
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e5e7eb" strokeWidth="2" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e5e7eb" strokeWidth="2" />
                </svg>

                {/* Shopping location pin */}
                <div className="absolute" style={{ left: '65%', top: '45%', transform: 'translate(-50%, -100%)' }}>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-lg whitespace-nowrap mb-1">
                      {booking.location.name}
                    </div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                  </div>
                </div>

                {/* Assistant pin (animated) */}
                {booking.status === 'active' && (
                  <div className="absolute transition-all duration-700" style={{ left: `${assistantPos.x}%`, top: `${assistantPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-40 w-8 h-8 -m-1" />
                      <div className="w-8 h-8 bg-brand-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center relative z-10">
                        <span className="text-white text-xs font-bold">{booking.assistant?.name?.[0] || 'A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer pin */}
                <div className="absolute" style={{ left: '20%', top: '60%', transform: 'translate(-50%, -50%)' }}>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold">You</span>
                  </div>
                </div>

                {/* Map label */}
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-xs text-gray-500 px-2 py-1 rounded-lg">
                  Mock Map • Live Tracking
                </div>

                {booking.status !== 'active' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Live tracking starts when assistant begins the job</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Assistant info */}
            {booking.assistant ? (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Your Assistant</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-lg">
                    {booking.assistant.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{booking.assistant.name}</div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={4} size="sm" />
                      <span className="text-xs text-gray-400">4.8</span>
                    </div>
                  </div>
                </div>
                {booking.assistant.phone && (
                  <a href={`tel:${booking.assistant.phone}`} className="flex items-center gap-2 w-full bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm">
                    <Phone className="w-4 h-4" /> Call Assistant
                  </a>
                )}
              </div>
            ) : (
              <div className="card text-center py-4">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Waiting for assistant...</p>
                <p className="text-xs text-gray-400 mt-1">Usually within 5–10 mins</p>
              </div>
            )}

            {/* Booking details */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-right text-gray-900 max-w-[60%] truncate">{booking.location.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{booking.duration} hours</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-brand-600">₹{booking.price}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-medium capitalize">{booking.paymentMethod}</span></div>
              </div>
            </div>

            {/* SOS Button */}
            <div className="card bg-red-50 border border-red-100">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">Emergency SOS</h3>
                  <p className="text-red-600 text-xs mt-0.5">Tap if you feel unsafe. Our team responds immediately.</p>
                </div>
              </div>
              {sosTriggered ? (
                <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> SOS Sent — Help is coming!
                </div>
              ) : (
                <button onClick={triggerSOS} disabled={sosLoading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {sosLoading ? <Spinner size="sm" /> : <AlertTriangle className="w-5 h-5" />}
                  {sosLoading ? 'Sending...' : 'SOS — Send Emergency Alert'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
