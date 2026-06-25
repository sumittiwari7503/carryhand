import React, { useState } from 'react';
import { User, Phone, MapPin, Save, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner, StarRating } from '../components/common/UI';

export default function ProfilePage() {
  const { user, assistantProfile, refreshUser, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: assistantProfile?.bio || '',
    languages: assistantProfile?.languages?.join(', ') || '',
    experience: assistantProfile?.experience || '',
    city: assistantProfile?.location?.city || '',
    area: assistantProfile?.location?.area || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        languages: form.languages.split(',').map((l: string) => l.trim()).filter(Boolean),
        experience: form.experience,
        location: { city: form.city, area: form.area }
      };
      await updateProfile(payload);
      await refreshUser();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>

        {/* Avatar + Role */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-3xl">
              {user?.name[0]}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : user?.role === 'assistant' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {user?.role}
                </span>
                {user?.isVerified && <span className="badge bg-green-100 text-green-700">Verified ✓</span>}
              </div>
            </div>
            {user?.role === 'assistant' && assistantProfile && (
              <div className="ml-auto text-right hidden sm:block">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <StarRating rating={Math.round(assistantProfile.rating)} />
                  <span className="text-sm font-semibold text-gray-700">{assistantProfile.rating}</span>
                </div>
                <div className="text-xs text-gray-400">{assistantProfile.totalRatings} reviews</div>
                <div className="text-sm font-bold text-brand-600 mt-1">₹{assistantProfile.totalEarnings} earned</div>
              </div>
            )}
          </div>
        </div>

        {message && <div className="mb-4"><Alert type="success" message={message} /></div>}
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" className="input-field bg-gray-50 cursor-not-allowed" value={user?.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Address</label>
                <input type="text" className="input-field" placeholder="Your city / area" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Assistant-specific */}
          {user?.role === 'assistant' && (
            <div className="card">
              <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-500" /> Assistant Profile
              </h3>

              {!assistantProfile?.isApproved && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                  Complete your profile to get approved faster. Our team reviews applications within 24–48 hours.
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio / About You</label>
                  <textarea className="input-field" rows={3} placeholder="Tell customers about yourself — experience, strengths, areas you know well..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Languages</label>
                    <input type="text" className="input-field" placeholder="Hindi, English, Marathi" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />
                    <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
                    <input type="text" className="input-field" placeholder="e.g., 2 years" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input type="text" className="input-field" placeholder="Delhi" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Locality</label>
                    <input type="text" className="input-field" placeholder="Connaught Place" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* ID Verification placeholder */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">ID Verification</p>
                    <p className="text-xs text-gray-400">Upload Aadhaar, PAN, or Driving License</p>
                  </div>
                  <button type="button" className="ml-auto text-sm text-brand-600 font-semibold border border-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                    Upload
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
