import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AssistantDashboard from './pages/AssistantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import TrackingPage from './pages/TrackingPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'assistant') return <Navigate to="/assistant/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
}

const noFooterPaths = [
  '/customer/dashboard', '/assistant/dashboard', '/admin',
  '/book', '/tracking', '/profile', '/chat'
];

const showFooter = (pathname: string) =>
  !noFooterPaths.some(p => pathname.startsWith(p));

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute roles={['customer']}><BookingPage /></ProtectedRoute>} />
          <Route path="/tracking/:id" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />

          {/* Assistant */}
          <Route path="/assistant/dashboard" element={<ProtectedRoute roles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* Profile — all authenticated */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Chat — customer & assistant */}
          <Route path="/chat/:bookingId" element={<ProtectedRoute roles={['customer', 'assistant']}><ChatPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <ConditionalFooter />
    </div>
  );
}

function ConditionalFooter() {
  const { pathname } = useLocation();
  return showFooter(pathname) ? <Footer /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
