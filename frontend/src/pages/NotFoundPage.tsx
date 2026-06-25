import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-brand-400" />
        </div>
        <h1 className="font-display text-6xl font-extrabold text-gray-900 mb-3">404</h1>
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like this page went shopping without us. Let's get you back on track.</p>
        <Link to="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    </div>
  );
}
