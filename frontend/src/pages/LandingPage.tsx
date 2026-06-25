import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Shield, Clock, MapPin, ChevronDown, ChevronUp, ArrowRight, Users, CheckCircle, Zap } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', location: 'Delhi', rating: 5, text: 'I was shopping at Select City Walk with my kids and CarryHand sent me Ramesh within 10 minutes. He carried everything while I focused on my kids. Absolute lifesaver!', avatar: 'P' },
  { name: 'Rahul Mehta', location: 'Mumbai', rating: 5, text: 'Used CarryHand at Phoenix Market City. The assistant was polite, strong, and helped me until I reached my car. Worth every rupee.', avatar: 'R' },
  { name: 'Anjali Reddy', location: 'Bangalore', rating: 4, text: 'Great service at Majestic market. The assistant knew the area well and even helped me find the best deals. Highly recommend!', avatar: 'A' },
];

const faqs = [
  { q: 'How quickly can I book an assistant?', a: 'You can book an assistant instantly. Available assistants in your area are notified and the first to accept gets assigned to you, typically within 5–10 minutes.' },
  { q: 'Are the assistants verified?', a: 'Yes. Every assistant goes through ID verification and background check before approval. All assistants are rated by customers after each session.' },
  { q: 'What locations do you cover?', a: 'We cover major malls, local markets, railway stations, airports, and tourist places across Delhi, Mumbai, Bangalore, Ahmedabad, and more cities.' },
  { q: 'What if I feel unsafe?', a: 'Every booking comes with an SOS button. Pressing it immediately alerts our safety team and local contacts. Your safety is our top priority.' },
  { q: 'How much does it cost?', a: 'Pricing starts at ₹150/hour. You can book for 1 to 8 hours. Payment can be made via cash, UPI, or card.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center relative pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Now available in 12+ cities
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
                Shop More.<br />
                <span className="text-brand-400">Carry Less.</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                Hire a verified shopping assistant who stays with you, carries your bags, and delivers them safely to your vehicle. Focus on shopping — we'll handle the heavy lifting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 text-base">
                  Book an Assistant <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/signup?role=assistant" className="btn-secondary flex items-center justify-center gap-2 text-base">
                  Earn as Assistant
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                {[['10K+', 'Happy Customers'], ['500+', 'Verified Assistants'], ['4.8★', 'Average Rating']].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-white font-bold text-xl">{val}</div>
                    <div className="text-gray-400 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Booking Confirmed!</div>
                      <div className="text-gray-400 text-sm">Assistant on the way</div>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                      <div className="w-10 h-10 bg-brand-400 rounded-full flex items-center justify-center text-white font-bold">R</div>
                      <div>
                        <div className="text-white font-medium text-sm">Ramesh Kumar</div>
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span className="text-gray-400 text-xs">4.8 • 47 jobs</span></div>
                      </div>
                      <div className="ml-auto text-green-400 text-sm font-medium">2 min away</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-gray-400 text-xs mb-1">Location</div>
                        <div className="text-white text-sm font-medium">Select City Walk</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-gray-400 text-xs mb-1">Duration</div>
                        <div className="text-white text-sm font-medium">2 hours • ₹300</div>
                      </div>
                    </div>
                    <div className="w-full bg-brand-500 text-white text-center py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" /> SOS Emergency Button
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 animate-pulse-soft">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-semibold text-gray-700">38 assistants online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">How CarryHand Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Three simple steps to a stress-free shopping experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-brand-100" />
            {[
              { step: '01', icon: MapPin, title: 'Choose Your Location', desc: 'Select your shopping destination — mall, market, airport, or station. Tell us how long you need assistance.' },
              { step: '02', icon: Users, title: 'Get Matched Instantly', desc: 'Our system matches you with a nearby verified assistant. They arrive at your location within minutes.' },
              { step: '03', icon: CheckCircle, title: 'Shop Hands-Free', desc: 'Your assistant carries all your bags as you shop. Rate your experience after they safely deliver to your vehicle.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-brand-50 rounded-3xl flex items-center justify-center mb-6 relative">
                  <Icon className="w-10 h-10 text-brand-500" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{step}</div>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 text-lg">Designed for a safe, smooth, and satisfying experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified & Safe', desc: 'Every assistant is ID-verified and background-checked. Your safety is guaranteed.' },
              { icon: Zap, title: 'Instant Booking', desc: 'Book in under 60 seconds. Assistants are notified immediately.' },
              { icon: Star, title: 'Rated Professionals', desc: 'Real reviews from real customers. Only highly-rated assistants stay active.' },
              { icon: Clock, title: 'Flexible Hours', desc: 'Book for 1 to 8 hours. Extend your session right from the app.' },
              { icon: MapPin, title: 'Live Tracking', desc: 'Track your assistant\'s location in real time throughout the session.' },
              { icon: ShoppingBag, title: 'Emergency SOS', desc: 'One tap sends an alert to our safety team and your emergency contact.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors">
                  <Icon className="w-6 h-6 text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">What Shoppers Say</h2>
            <p className="text-gray-500 text-lg">Thousands of happy customers across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-600">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 gradient-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card p-0 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-brand-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Shop Hands-Free?</h2>
          <p className="text-brand-100 text-lg mb-8">Join thousands of shoppers who shop smarter with CarryHand.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white text-brand-600 font-semibold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
              Book Your First Assistant →
            </Link>
            <Link to="/signup?role=assistant" className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
              Earn ₹500–₹2000/day
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
