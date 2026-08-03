import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-gold-400/20 text-zinc-400 font-sans">
      
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="flex flex-col">
            <span className="font-outfit font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-400 to-gold-700">
              HAPPYMOMENTS
            </span>
            <span className="text-[9px] font-sans tracking-[0.25em] text-gold-300/80 -mt-1 uppercase">
              Luxury Decorators
            </span>
          </Link>
          <p className="text-sm text-zinc-400 leading-relaxed font-sans">
            Crafting premium, luxurious, and elegant event decoration setups that create timeless memories. We specialize in wedding stages, theme birthdays, luxury baby showers, and exclusive prop rentals.
          </p>
          <div className="flex space-x-4">
            <a 
              href="https://www.instagram.com/happymomentsrentals?igsh=aHd6ZGVjd2pvMzBl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-slate-900 border border-gold-400/10 hover:border-gold-400/50 rounded-full text-gold-400 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Categories Quick Links */}
        <div>
          <h3 className="font-outfit text-white tracking-wider text-base font-semibold mb-6 border-b border-gold-400/10 pb-2">
            SERVICES
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/decorations?category=birthday-decorations" className="hover:text-gold-400 transition-colors">
                Themed Birthday Setups
              </Link>
            </li>
            <li>
              <Link to="/decorations?category=baby-shower-decorations" className="hover:text-gold-400 transition-colors">
                Pastel Baby Showers
              </Link>
            </li>
            <li>
              <Link to="/decorations?category=anniversary-decorations" className="hover:text-gold-400 transition-colors">
                Anniversary Backdrop Styling
              </Link>
            </li>
          </ul>
        </div>

        {/* Props Rental links */}
        <div>
          <h3 className="font-outfit text-white tracking-wider text-base font-semibold mb-6 border-b border-gold-400/10 pb-2">
            PROP RENTALS
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/rentals?category=led-neon-lights" className="hover:text-gold-400 transition-colors">
                LED & Neon Signages
              </Link>
            </li>
            <li>
              <Link to="/rentals?category=backdrops-walls" className="hover:text-gold-400 transition-colors">
                Shimmer Walls & Ring Backdrops
              </Link>
            </li>
            <li>
              <Link to="/rentals?category=tables-stands" className="hover:text-gold-400 transition-colors">
                Acrylic Plinths & Tables
              </Link>
            </li>
            <li>
              <Link to="/rentals?category=themed-props" className="hover:text-gold-400 transition-colors">
                Plush Teddy Bears & Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="font-outfit text-white tracking-wider text-base font-semibold mb-6 border-b border-gold-400/10 pb-2">
            CONNECT
          </h3>
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 text-gold-400 mr-3 shrink-0" />
              <span>Gottigere,Banglore, India</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 text-gold-400 mr-3 shrink-0" />
              <span>+91 9035628787</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 text-gold-400 mr-3 shrink-0" />
              <span>support@happymoments.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Policies & Copyright Section */}
      <div className="bg-slate-900/50 py-8 border-t border-gold-400/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-gold-400 transition-colors">Terms & Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-gold-400 transition-colors">Cancellation Policy</Link>
            <Link to="/faq" className="hover:text-gold-400 transition-colors">FAQs</Link>
          </div>
          <p className="text-zinc-500 text-center">
            © {new Date().getFullYear()} HappyMoments Decorators. All Rights Reserved. Built with MERN Stack.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
