import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, CreditCard, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Alert, Spinner } from '../components/common/UI';
import RazorpayPayment from '../components/common/RazorpayPayment';

const locations = [
  { name: 'Select City Walk', address: 'Saket, New Delhi', type: 'mall' },
  { name: 'Phoenix Market City', address: 'Kurla, Mumbai', type: 'mall' },
  { name: 'Lajpat Nagar Market', address: 'Lajpat Nagar, Delhi', type: 'market' },
  { name: 'Indira Gandhi Airport', address: 'New Delhi', type: 'airport' },
  { name: 'Chhatrapati Shivaji Terminal', address: 'Mumbai', type: 'railway' },
  { name: 'Forum Mall', address: 'Koramangala, Bangalore', type: 'mall' },
  { name: 'Manek Chowk', address: 'Ahmedabad Old City', type: 'market' },
  { name: 'Other / Custom', address: '', type: 'other' },
];

const durations = [1, 2, 3, 4, 6, 8];

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [form, setForm] = useState({
    location: { name: '', address: '', type: 'mall' },
    duration: 2,
    notes: '',
  });
  const [customLocation, setCustomLocation] = useState(false);

  const price = form.duration * 150;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/bookings', { ...form, paymentMethod });
      const bookingId = res.data.booking._id;
      setCreatedBookingId(bookingId);

      // If card/upi selected → open Razorpay
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        setLoading(false);
        setShowRazorpay(true);
      } else {
        // Cash → go straight to success
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (_paymentId: string) => {
    setShowRazorpay(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-gray-500 mb-1">Your request has been sent to nearby assistants.</p>
          <p className="text-gray-400 text-sm mb-2">📧 A confirmation email has been sent to you.</p>
          <p className="text-gray-500 text-sm mb-6">You'll be notified once an assistant accepts your booking.</p>
          <div className="bg-brand-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm text-gray-600 space-y-1.5">
              <div className="flex justify-between"><span>Location:</span><span className="font-medium text-gray-900">{form.location.name}</span></div>
              <div className="flex justify-between"><span>Duration:</span><span className="font-medium">{form.duration} hours</span></div>
              <div className="flex justify-between"><span>Payment:</span><span className="font-medium capitalize">{paymentMethod}</span></div>
              <div className="flex justify-between border-t border-brand-100 pt-1.5 mt-1.5">
                <span>Total:</span><span className="font-bold text-brand-600">₹{price}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/customer/dashboard')} className="btn-primary w-full">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Razorpay modal */}
      {showRazorpay && user && (
        <RazorpayPayment
          bookingId={createdBookingId}
          amount={price}
          locationName={form.location.name}
          customerName={user.name}
          customerEmail={user.email}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowRazorpay(false);
            // Still confirm booking even if payment cancelled (pay later)
            setSuccess(true);
          }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Book an Assistant</h1>
          <p className="text-gray-500">Fill in the details below to find a verified helper near you.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Location', 'Duration', 'Payment'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i + 1 <= step ? 'text-brand-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i + 1 < step ? 'bg-brand-500 text-white' :
                  i + 1 === step ? 'border-2 border-brand-500 text-brand-600' :
                  'border-2 border-gray-200 text-gray-400'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-brand-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        <div className="card">
          {/* Step 1: Location */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h2 className="font-display text-xl font-bold text-gray-900">Choose Location</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {locations.map((loc, i) => (
                  <button key={i} onClick={() => {
                    if (loc.type === 'other') {
                      setCustomLocation(true);
                      setForm({ ...form, location: { name: '', address: '', type: 'other' } });
                    } else {
                      setCustomLocation(false);
                      setForm({ ...form, location: loc });
                    }
                  }} className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.location.name === loc.name && !customLocation
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className={`font-semibold text-sm ${form.location.name === loc.name && !customLocation ? 'text-brand-700' : 'text-gray-800'}`}>{loc.name}</div>
                    {loc.address && <div className="text-xs text-gray-400">{loc.address}</div>}
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      loc.type === 'mall' ? 'bg-purple-100 text-purple-600' :
                      loc.type === 'airport' ? 'bg-blue-100 text-blue-600' :
                      loc.type === 'railway' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>{loc.type}</span>
                  </button>
                ))}
              </div>
              {customLocation && (
                <div className="space-y-3 mt-4">
                  <input type="text" className="input-field" placeholder="Location name (e.g., Sarojini Nagar Market)"
                    value={form.location.name}
                    onChange={e => setForm({ ...form, location: { ...form.location, name: e.target.value } })} />
                  <input type="text" className="input-field" placeholder="Full address"
                    value={form.location.address}
                    onChange={e => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!form.location.name || (customLocation && !form.location.address)}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-brand-500" />
                <h2 className="font-display text-xl font-bold text-gray-900">Select Duration</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {durations.map(d => (
                  <button key={d} onClick={() => setForm({ ...form, duration: d })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${form.duration === d ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`text-2xl font-bold ${form.duration === d ? 'text-brand-600' : 'text-gray-800'}`}>{d}</div>
                    <div className={`text-xs ${form.duration === d ? 'text-brand-500' : 'text-gray-400'}`}>hour{d > 1 ? 's' : ''}</div>
                    <div className={`text-sm font-semibold mt-1 ${form.duration === d ? 'text-brand-700' : 'text-gray-600'}`}>₹{d * 150}</div>
                  </button>
                ))}
              </div>
              <div className="bg-brand-50 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Rate:</span><span className="font-medium">₹150/hour</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-gray-600">Duration:</span><span className="font-medium">{form.duration}h</span></div>
                <div className="flex justify-between font-bold text-brand-700 mt-2 pt-2 border-t border-brand-100">
                  <span>Total:</span><span>₹{price}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special instructions (optional)</label>
                <textarea className="input-field" rows={3} placeholder="Any specific requirements for your assistant..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-brand-500" />
                <h2 className="font-display text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'cash', label: 'Cash on Service', sublabel: 'Pay directly to the assistant' },
                  { value: 'upi', label: 'UPI / QR Code', sublabel: 'Instant payment via Razorpay' },
                  { value: 'card', label: 'Credit / Debit Card', sublabel: 'Secure payment via Razorpay' },
                ].map(({ value, label, sublabel }) => (
                  <button key={value} onClick={() => setPaymentMethod(value)}
                    className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                      paymentMethod === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === value ? 'border-brand-500' : 'border-gray-300'}`}>
                      {paymentMethod === value && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${paymentMethod === value ? 'text-brand-700' : 'text-gray-800'}`}>{label}</div>
                      <div className="text-xs text-gray-400">{sublabel}</div>
                    </div>
                    {(value === 'card' || value === 'upi') && (
                      <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Razorpay</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="font-medium text-gray-900 truncate ml-4 max-w-[60%]">{form.location.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span className="font-medium">{form.duration}h</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Payment:</span><span className="font-medium capitalize">{paymentMethod}</span></div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-brand-600 text-base">
                    <span>Total:</span><span>₹{price}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading
                    ? <><Spinner size="sm" /> Processing...</>
                    : (paymentMethod === 'cash' ? `Confirm Booking` : `Pay ₹${price} via Razorpay`)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
