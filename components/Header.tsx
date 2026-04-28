import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/hooks/useAuth';
import { useProfile } from '../src/hooks/useProfile';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, login, logout, user } = useAuth();
  const { isAdmin } = useProfile();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const portalPath = isAdmin ? '/admin' : '/client';
  const portalLabel = isAdmin ? 'Admin' : 'Dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, children, className = "" }: { to: string, children: React.ReactNode, className?: string }) => {
    const isActive = to === location.pathname || (to.startsWith('#') && location.hash === to);
    
    if (to.startsWith('#') && !isHome) {
      return (
        <Link 
          to={`/${to}`} 
          className={`${className} ${isActive ? 'text-white' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-current={isActive ? 'page' : undefined}
        >
          {children}
        </Link>
      );
    }
    if (to.startsWith('#')) {
      return (
        <a 
          href={to} 
          className={className}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-current={isActive ? 'page' : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link 
        to={to} 
        className={`${className} ${isActive ? 'text-white' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 h-20 flex items-center transition-all duration-500 ${
      isScrolled ? 'glass-header-scrolled' : 'glass-header'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <motion.span 
            className="text-2xl font-black tracking-tighter text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            AIGENCY<span className="text-red-600 group-hover:text-red-500 transition-colors">AUTOMATA</span>
          </motion.span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-widest uppercase text-gray-400">
          <NavLink to="#services" className="hover:text-white transition-colors duration-300 relative group">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-300" />
          </NavLink>
          <NavLink to="#roi" className="hover:text-white transition-colors duration-300 relative group">
            ROI
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-300" />
          </NavLink>
          <NavLink to="/blog" className="hover:text-white transition-colors duration-300 relative group">
            Insights
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-300" />
          </NavLink>
          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link 
                to={portalPath}
                className="hover:text-white transition-colors uppercase border-b border-red-600 pb-1"
              >
                {portalLabel}
              </Link>
              <button 
                onClick={logout}
                className="hover:text-white transition-colors uppercase"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="hover:text-white transition-colors uppercase"
            >
              Login
            </button>
          )}
          <a 
            href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block bg-red-600 text-white px-6 py-3 hover:bg-red-500 transition-all duration-300 btn-primary font-black text-xs tracking-widest"
          >
            Book Audit
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white w-11 h-11 flex items-center justify-center border border-white/10 hover:border-red-600 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-20 left-0 w-full glass-header-scrolled overflow-hidden md:hidden z-40"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="p-8 flex flex-col space-y-8">
              <div className="flex flex-col space-y-6 text-left">
                <NavLink to="#services" className="text-4xl font-black text-white uppercase tracking-tighter hover:text-red-600 transition-colors">Services</NavLink>
                <NavLink to="#roi" className="text-4xl font-black text-white uppercase tracking-tighter hover:text-red-600 transition-colors">ROI</NavLink>
                <NavLink to="/blog" className="text-4xl font-black text-white uppercase tracking-tighter hover:text-red-600 transition-colors">Insights</NavLink>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col space-y-6">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Link 
                      to={portalPath} 
                      className="text-white font-bold uppercase tracking-[0.3em] text-[10px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      [ {portalLabel} ]
                    </Link>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] text-left hover:text-white"
                    >
                      [ LOGOUT_SESSION ]
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { login(); setIsMobileMenuOpen(false); }}
                    className="text-white font-bold uppercase tracking-[0.3em] text-[10px] text-left"
                  >
                    [ AUTH_REQUIRED / LOGIN ]
                  </button>
                )}
                
                <a 
                  href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white px-8 py-5 font-black uppercase tracking-[0.4em] text-xs text-center hover:bg-red-500 transition-colors"
                >
                  Book Audit
                </a>
              </div>

              <div className="pt-8 text-[8px] font-mono text-gray-700 uppercase tracking-[0.5em]">
                System_Status: Operational_v4.2 // Mobile_Node_Active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;