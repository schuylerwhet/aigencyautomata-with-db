import React from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Services from './components/Services';
import Solutions from './components/Solutions';
import Calculator from './components/Calculator';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Chatbot from './components/Chatbot';
import AuditSection from './components/AuditSection';
import AEOAuditSection from './components/AEOAuditSection';
import ObjectionHandlers from './components/ObjectionHandlers';
import LeadMagnet from './components/LeadMagnet';
import BlogPage from './pages/BlogPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProjects from './pages/AdminProjects';
import AdminRedditAgent from './pages/AdminRedditAgent';
import AdminInvoices from './pages/AdminInvoices';
import AdminClients from './pages/AdminClients';
import AdminCRM from './pages/AdminCRM';
import ClientDashboard from './pages/ClientDashboard';
import ClientProjects from './pages/ClientProjects';
import ClientInvoices from './pages/ClientInvoices';
import ClientMessages from './pages/ClientMessages';
import { useAuth } from './src/hooks/useAuth';
import { useProfile } from './src/hooks/useProfile';
import { useLeadCapture } from './src/hooks/useLeadCapture';
import { Analytics } from '@vercel/analytics/react';

const SectionDivider = () => <div className="section-divider" />;

const LandingPage: React.FC = () => (
  <>
    <Hero />
    <Ticker />
    <SectionDivider />
    <LeadMagnet />
    <SectionDivider />
    <Services />
    <Solutions />
    <SectionDivider />
    <AuditSection />
    <SectionDivider />
    <AEOAuditSection />
    <SectionDivider />
    <ObjectionHandlers />
    <SectionDivider />
    <Calculator />
    <SectionDivider />
    <Blog limit={4} showViewAll={true} />
    <SectionDivider />
    <Contact />
    <LeadMagnet />
  </>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: 'admin' | 'client' }> = ({ children, role }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, isAdmin } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isLoading } = useAuth();
  useLeadCapture();
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/client');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="texture-overlay"></div>
      {!isPortal && <Header />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />

        {/* Portal Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/projects" element={<AdminProjects />} />
                <Route path="/clients" element={<AdminClients />} />
                <Route path="/crm" element={<AdminCRM />} />
                <Route path="/invoices" element={<AdminInvoices />} />
                <Route path="/reddit-agent" element={<AdminRedditAgent />} />
                <Route path="/settings" element={<AdminDashboard />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/*"
          element={
            <ProtectedRoute role="client">
              <Routes>
                <Route path="/" element={<ClientDashboard />} />
                <Route path="/projects" element={<ClientProjects />} />
                <Route path="/invoices" element={<ClientInvoices />} />
                <Route path="/messages" element={<ClientMessages />} />
                <Route path="/profile" element={<ClientDashboard />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isPortal && (
        <footer className="bg-black pt-20 pb-12 border-t border-white/10 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              {/* Brand */}
              <div>
                <Link to="/" className="inline-block mb-6">
                  <span className="text-2xl font-black tracking-tighter text-white">
                    AIGENCY<span className="text-red-600">AUTOMATA</span>
                  </span>
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  Premier AI automation and digital marketing agency. We kill your team's busywork so you can scale without limits.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Navigation</h4>
                <div className="space-y-3">
                  <a href="#services" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">Services</a>
                  <a href="#solutions" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">Solutions</a>
                  <a href="#roi" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">ROI Calculator</a>
                  <Link to="/blog" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">Insights</Link>
                  <a href="#contact" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">Contact</a>
                </div>
              </div>

              {/* Connect */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Connect</h4>
                <div className="space-y-3">
                  <a href="https://twitter.com/aigencyautomata" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">Twitter / X</a>
                  <a href="#" className="block text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-medium">LinkedIn</a>
                  <a href="https://swiss.schuylerwhet.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-red-600 transition-colors uppercase tracking-wider font-medium">The Swiss Directory ↗</a>
                </div>
                <div className="mt-8">
                  <a 
                    href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase px-6 py-3 tracking-widest transition-all duration-300 btn-primary relative overflow-hidden"
                  >
                    Book Free Audit →
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} AIGENCYAUTOMATA. All Systems Operational.
              </p>
              <div className="flex items-center space-x-6 text-[10px] text-gray-700 font-mono uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
                <span className="text-gray-800">|</span>
                <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
                <span className="text-gray-800">|</span>
                <span>System_v4.2</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {!isPortal && <Chatbot />}
      <Analytics />
    </div>
  );
};

export default App;