import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, Loader, IndianRupee } from 'lucide-react';
import api from '../../utils/api';
import { Alert, Spinner } from './UI';

interface Props {
  bookingId: string;
  amount: number;
  locationName: string;
  customerName: string;
  customerEmail: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

export default function RazorpayPayment({ bookingId, amount, locationName, customerName, customerEmail, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setError('');
    setLoading(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay. Check your internet connection.');

      // Create order from backend
      const { data } = await api.post('/payments/create-order', { bookingId });
      if (!data.success) throw new Error(data.message);

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CarryHand',
        description: `Shopping Assistance at ${locationName}`,
        order_id: data.order.id,
        prefill: { name: customerName, email: customerEmail },
        theme: { color: '#f97316' },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });

            if (verifyRes.data.success) {
              setSuccess(true);
              setTimeout(() => onSuccess(response.razorpay_payment_id), 1500);
            } else {
              setError('Payment verification failed. Contact support.');
            }
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const e = err as { message?: string; response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || e?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-500 text-sm">₹{amount} paid for {locationName}</p>
          <p className="text-gray-400 text-xs mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">Complete Payment</h3>
            <p className="text-gray-400 text-sm">Secure payment via Razorpay</p>
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        {/* Amount */}
        <div className="bg-brand-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Booking at</div>
              <div className="font-semibold text-gray-900">{locationName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Amount</div>
              <div className="text-2xl font-bold text-brand-600">₹{amount}</div>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="flex items-center gap-4 mb-6">
          {['UPI', 'Cards', 'Net Banking', 'Wallets'].map(m => (
            <div key={m} className="flex-1 text-center bg-gray-50 rounded-lg py-2 px-1">
              <div className="text-xs text-gray-500">{m}</div>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span>256-bit SSL encrypted payment. Your card details are never stored.</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
          <button onClick={handlePayment} disabled={loading} className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Processing...</> : <>Pay ₹{amount}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
