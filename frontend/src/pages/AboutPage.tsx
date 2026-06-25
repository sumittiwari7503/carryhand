import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl font-extrabold mb-5">About CarryHand</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            We started CarryHand because we believe shopping should be joyful — not an exhausting physical task. We connect shoppers with trusted local assistants who make that possible.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Target className="w-4 h-4" /> Our Mission
              </div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-5 leading-tight">
                Making shopping accessible for everyone
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Whether you're an elderly person who finds heavy bags difficult, a parent shopping with young children, a tourist navigating an unfamiliar market, or simply someone who wants to shop without the physical strain — CarryHand is for you.
              </p>
              <p className="text-gray-600 leading-relaxed">
                At the same time, we create dignified earning opportunities for local workers who want flexible, service-oriented work.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, title: 'Customer First', desc: 'Every feature built around your comfort and safety' },
                { icon: Shield, title: 'Safety Verified', desc: 'All assistants ID-verified and background-checked' },
                { icon: Zap, title: 'Instant Service', desc: 'Match in under 5 minutes, assist within 10' },
                { icon: Users, title: 'Community', desc: 'Creating jobs for local workers across India' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 gradient-bg px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['10,000+', 'Happy Shoppers'], ['500+', 'Verified Assistants'], ['12+', 'Cities'], ['4.8★', 'Average Rating']].map(([val, label]) => (
              <div key={label} className="card">
                <div className="font-display text-3xl font-extrabold text-brand-600 mb-1">{val}</div>
                <div className="text-gray-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-10 h-10 text-brand-500 mx-auto mb-4" />
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Built by people who shop</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12">
            Our founding team was inspired after a 4-hour shopping trip in Lajpat Nagar that left everyone exhausted. We asked: why doesn't this already exist?
          </p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base">
            Join CarryHand Today →
          </Link>
        </div>
      </section>
    </div>
  );
}
