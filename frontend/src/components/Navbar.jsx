import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';

export default function Navbar({ variant = 'solid' }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isTransparent = variant === 'transparent' && !scrolled;

  const navBg = isTransparent
    ? 'bg-transparent'
    : 'glass-strong shadow-nova';

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/#features', label: 'Features', isAnchor: true },
    { to: '/about', label: 'About' },
  ];

  const handleAnchorClick = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={token ? '/dashboard' : '/'}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-nova-gradient flex items-center justify-center group-hover:shadow-nova transition-shadow duration-300">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">NOVA</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {!token ? (
              <>
                {publicLinks.map((link) =>
                  link.isAnchor ? (
                    <a
                      key={link.label}
                      href={link.to}
                      onClick={(e) => handleAnchorClick(e, '#features')}
                      className="px-4 py-2 text-sm text-nova-text-muted hover:text-nova-accent-light transition-colors duration-200 rounded-lg hover:bg-white/5"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                        location.pathname === link.to
                          ? 'text-nova-accent-light bg-white/5'
                          : 'text-nova-text-muted hover:text-nova-accent-light hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <Link
                  to="/login"
                  className="ml-3 btn-nova text-sm !py-2 !px-5"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'text-nova-accent-light bg-white/5'
                      : 'text-nova-text-muted hover:text-nova-accent-light hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="ml-3 px-4 py-2 text-sm text-nova-text-muted hover:text-nova-rose transition-colors duration-200 rounded-lg hover:bg-white/5"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-nova-text-muted hover:text-nova-accent-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass-strong px-4 pb-4 pt-2 space-y-1 border-t border-nova-border">
          {!token ? (
            <>
              {publicLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.label}
                    href={link.to}
                    onClick={(e) => handleAnchorClick(e, '#features')}
                    className="block px-4 py-3 text-nova-text-muted hover:text-nova-accent-light rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-3 text-nova-text-muted hover:text-nova-accent-light rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                to="/login"
                className="block text-center btn-nova text-sm !py-2.5 mt-2"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="block px-4 py-3 text-nova-text-muted hover:text-nova-accent-light rounded-lg hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-3 text-nova-text-muted hover:text-nova-rose rounded-lg hover:bg-white/5 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
