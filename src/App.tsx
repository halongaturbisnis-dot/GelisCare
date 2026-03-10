import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/modules/landing/LandingPage';
import { LoginPage } from '@/modules/auth/LoginPage';
import { RegisterPage } from '@/modules/auth/RegisterPage';
import { ChatPage } from '@/modules/chat/ChatPage';
import { AdminDashboard } from '@/modules/dashboard/AdminDashboard';
import { AdminChatInbox } from '@/modules/dashboard/AdminChatInbox';
import { BroadcastPage } from '@/modules/broadcast/BroadcastPage';
import { ServiceManagement } from '@/modules/admin/ServiceManagement';
import { PromoManagement } from '@/modules/admin/PromoManagement';
import { PatientDashboard } from '@/modules/patient/PatientDashboard';
import { LogOut, MessageSquare, LayoutDashboard, Megaphone, User, Settings, Star } from 'lucide-react';
import { Button } from '@/components/UI';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'patient' }) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="border-b border-black/5 px-6 py-3 flex justify-between items-center bg-white sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">G</div>
          <span className="text-xl font-bold text-primary">GelisCare</span>
        </Link>
        <div className="flex items-center gap-6">
          {profile?.role === 'admin' ? (
            <>
              <Link to="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/admin/inbox" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <MessageSquare size={16} /> Inbox
              </Link>
              <Link to="/admin/services" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <Settings size={16} /> Layanan
              </Link>
              <Link to="/admin/promos" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <Star size={16} /> Promo
              </Link>
              <Link to="/admin/broadcast" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <Megaphone size={16} /> Broadcast
              </Link>
            </>
          ) : (
            <>
              <Link to="/patient/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/patient/chat" className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1">
                <MessageSquare size={16} /> Chat
              </Link>
            </>
          )}
          <div className="h-6 w-[1px] bg-black/5"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{profile?.role}</p>
            </div>
            <Button variant="ghost" className="p-2" onClick={signOut}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/patient/dashboard" element={
            <ProtectedRoute role="patient">
              <MainLayout><PatientDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patient/chat" element={
            <ProtectedRoute role="patient">
              <MainLayout><ChatPage /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <MainLayout><AdminDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/inbox" element={
            <ProtectedRoute role="admin">
              <MainLayout><AdminChatInbox /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/services" element={
            <ProtectedRoute role="admin">
              <MainLayout><ServiceManagement /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/promos" element={
            <ProtectedRoute role="admin">
              <MainLayout><PromoManagement /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/broadcast" element={
            <ProtectedRoute role="admin">
              <MainLayout><BroadcastPage /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/chat/:patientId" element={
            <ProtectedRoute role="admin">
              <MainLayout><ChatPage /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
