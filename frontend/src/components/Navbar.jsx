import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setIsOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/decorations' },
    { name: 'Rentals', path: '/rentals' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md shadow-luxury py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <span className="font-outfit font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-700">
              HAPPYMOMENTS
            </span>
            <span className="text-[9px] font-sans tracking-[0.25em] text-gold-300/80 -mt-1 uppercase text-center">
              Luxury Decorators
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-outfit tracking-wider text-sm transition-all duration-300 relative py-1 ${
                  isActive(link.path)
                    ? 'text-gold-400'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="hidden md:flex space-x-6 items-center">
            
            {/* Wishlist */}
            <Link
              to="/dashboard?tab=wishlist"
              className="text-zinc-300 hover:text-gold-400 transition-colors"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="text-zinc-300 hover:text-gold-400 transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-400 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 text-zinc-300 hover:text-gold-400 transition-colors focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full border border-gold-400/50 bg-slate-900 flex items-center justify-center text-gold-400 font-bold uppercase text-sm">
                      {user.name.charAt(0)}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 glassmorphism-dark rounded-lg shadow-luxury-lg overflow-hidden py-1 border border-gold-400/20"
                      >
                        <div className="px-4 py-3 border-b border-gold-400/10">
                          <p className="text-sm text-white font-medium truncate">{user.name}</p>
                          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-gold-400 hover:text-black transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          User Dashboard
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-gold-400 hover:text-black transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black transition-all duration-300 text-sm font-semibold rounded-md tracking-wider font-outfit"
                >
                  SIGN IN
                </Link>
              )}
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Cart on mobile */}
            <Link to="/cart" className="text-zinc-300 hover:text-gold-400 relative">
              <ShoppingBag className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-400 text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-300 hover:text-gold-400 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-gold-400/20"
          >
            <div className="px-2 pt-2 pb-6 space-y-2 sm:px-3 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md font-outfit text-base tracking-wider ${
                    isActive(link.path)
                      ? 'text-gold-400 bg-gold-950/20'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <hr className="border-gold-400/10 my-4 mx-8" />

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-zinc-300 hover:text-gold-400 font-outfit"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-zinc-300 hover:text-gold-400 font-outfit"
                    >
                      Admin Console
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-3 py-2 text-rose-400 hover:text-rose-500 font-outfit flex items-center justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  className="block mx-8 py-2 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black font-semibold rounded-md tracking-wider font-outfit"
                >
                  SIGN IN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
