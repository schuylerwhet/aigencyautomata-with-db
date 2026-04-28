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
            className="absolute top-20 left-0 w-full glass-header-scrolled overflow-hidden md:hidden z  Lueer-scrolled overflow-te/10 :hidden z  Lity:  t/footer>
      )}

      {!isPortal &n-e/1e5P_uratiL    d0Ne}}
            exit={{ opId={i   M, heigh 1, 0px] text-gray-700 fd tracking-widest uppercase text-gheigh4>
          <moe */}
    s-center space-x-6 n 
     ner noreferrer" className="block tex transition-ver:w-full transitiy-700 fd tracking-win-300" />
      heigh4>
          <moe */}
    s-center space-x-6 n 
     ner noreferrer" className="block tex titin-ver:w-full transitiy-70dium">Contact</a>
        </div>

            {/* Bottom Row */}
            <divd={i   M,0px] text-gray-700 on-all duration-300" />
         iL    d0Ne}}
            exit={{ opId={i   M flex-col md:flex-iL    dlassName="flex items-cccccccenter space-x-6Name="flex items-ccccccc" />
      heigh}
    assName="hdiv>
                <h4 classNa      t="_blank"
               href={to} 
          className={className}
                  lex-col md:flex-iL      [-b border-red- ]ex-col md:flex-iL    dMATA</span>
               d    {portalLabel}
              href={to} 
  {d] = us();         className={classNa;  transition={{               </span>
             assName="hdiv>
                <h4 classNa       heigh 1,      <a href="#" t="_blank"
           lex-col md:flex-iL      [-LOGOUT_SESSION ]ex-col md:flex-iL    dM              >
    iL    dM-medium">The Swiss DitrokeWidth={2} d="M6    d    {portalLabel}
            href={to} 
  {d] =in();         className={classNa;  transition={{         " />
      heigh}
    assName="hdiv>
                <h4 classNa       heigh 1, 0ransition={{       lex-col md:flex-iL    [ AUTH_REQUIRED /-LOGIN ]ex-col md:flex-iL  dM              >
    iL  ame}
              ll transitiy-700 f             <div claName="mt-8">
                  <a 
                    href="https://caldar.app.google/xUxvNAFCRzkpmkfX6"                    target="_blank"
               </Routes noreferrer"
         8  cl5           <div>
                <44 classNaransssNa:hiddensName="hidden md:block bg-reborder border-whitttttttlex-col md:flex-iL  black text-xs trackiny-700 flassName="hover:tedium">Contact</a>
        </div>

         assNa 8    "flex itemdiv className=div>
                <5-[10px] text-gray-700 assNameStatus:{new Date().e="te //       _, cl_=> setsName="hover:tedium">Cme="hover:tedium">Cme="hover:t-red-500um">Cme="hove)sActive ? button>
      </div>
</      !isPortal && <Chatbot />}
 { Lin   <Analytics />
    </div>
  );
};

export default App;