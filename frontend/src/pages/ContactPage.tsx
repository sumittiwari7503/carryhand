import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Alert, Spinner } from '../components/common/UI';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Get in Touch</h1>
          <p className="text-gray-500 text-lg">Have a question or need help? We're here for you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'support@carryhand.in', sub: 'We reply within 2 hours' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210', sub: 'Mon–Sat, 9am–8pm' },
              { icon: MapPin, label: 'Office', value: 'New Delhi, India', sub: 'By appointment only' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="card flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{label}</div>
                  <div className="text-gray-700 text-sm">{value}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{sub}</div>
                </div>
              </div>
            ))}

            <div className="card bg-brand-50 border border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-brand-500" />
                <span className="font-semibold text-brand-800 text-sm">Quick Support</span>
              </div>
              <p className="text-brand-700 text-sm leading-relaxed">
                For urgent booking issues or safety concerns, use the <strong>SOS button</strong> inside your active booking or call us directly.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 card">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-5">Send a Message</h2>
            {success && <div className="mb-4"><Alert type="success" message="Message sent! We'll get back to you within 2 hours." /></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input type="text" className="input-field" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <select className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                  <option value="">Select a topic</option>
                  <option>Booking Issue</option>
                  <option>Assistant Complaint</option>
                  <option>Payment Problem</option>
                  <option>Become an Assistant</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea className="input-field" rows={5} placeholder="Describe your issue or question in detail..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Spinner size="sm" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
