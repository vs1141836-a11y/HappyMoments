import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { openWhatsApp } from '../utils/whatsapp.js';
import * as api from '../services/api.js';

const Home = () => {
  const [decorations, setDecorations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const decorRes = await api.getDecorations();
        const catRes = await api.getCategories();
        if (decorRes.data.success) setDecorations(decorRes.data.decorations.slice(0, 3));
        if (catRes.data.success) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  return (
    <div className="bg-[#000814] text-zinc-300 min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80')` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-[#000814]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center space-x-2 text-gold-400 font-sans tracking-[0.3em] text-xs uppercase"
          >
            <Sparkles className="h-4 w-4" />
            <span>Welcome to Premium Events Styling</span>
            <Sparkles className="h-4 w-4" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-playfair text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            Lighting Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold-600 font-serif-lux italic">Happy Moments</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Experience luxury setups and premium decoration packages tailored for your dream wedding, birthday themes, anniversaries, and high-end prop rentals.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link
              to="/decorations"
              className="px-8 py-3.5 rounded-md text-sm font-semibold tracking-wider font-outfit btn-gold flex items-center shadow-luxury"
            >
              BOOK COMPLETE STAGES
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/rentals"
              className="px-8 py-3.5 rounded-md text-sm font-semibold tracking-wider font-outfit border border-gold-400 text-gold-400 hover:bg-gold-400/10 transition-colors"
            >
              RENT INDIVIDUAL PROPS
            </Link>
          </motion.div>
        </div>

        {/* Bottom decorative gold border line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
      </section>

      {/* 2. Category Highlights */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl text-white font-bold">Featured Event Categories</h2>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Curated Theme Collections</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Themed Birthdays', img: 'http://localhost:5000/uploads/gold_castle_birthday.jpg', desc: 'Sleek designs, organic chrome balloons & arches', link: '/decorations?category=birthday-decorations' },
            { name: 'Prop Rentals', img: 'http://localhost:5000/uploads/marquee_set_antique.jpg', desc: 'Marquee letters, neon signs & tables for rent', link: '/rentals' },
            { name: 'Baby Showers', img: 'http://localhost:5000/uploads/cloud_bear_babyshower.jpg', desc: 'Adorable pastels, plush teddy props & setups', link: '/decorations?category=baby-shower-decorations' },
            { name: 'Naming Ceremony', img: 'http://localhost:5000/uploads/naming_ceremony_pink_floral.jpg', desc: 'Elegant floral cradles, hanging swings & light backdrops', link: '/decorations?category=naming-ceremony-decorations' },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-lg overflow-hidden group border border-gold-400/10 bg-slate-950 aspect-[4/5] shadow-luxury"
            >
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url('${cat.img}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 text-center space-y-2 z-10">
                <h3 className="font-outfit text-white text-xl font-bold tracking-wider">{cat.name}</h3>
                <p className="text-zinc-400 text-xs font-light">{cat.desc}</p>
                <Link
                  to={cat.link}
                  className="inline-flex items-center text-xs text-gold-400 hover:text-white font-semibold pt-2 transition-colors uppercase tracking-widest"
                >
                  Explore Now
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Luxury Decoration Packages Showcase */}
      <section className="py-20 bg-slate-950/30 border-y border-gold-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
            <div className="text-center md:text-left space-y-2">
              <h2 className="font-playfair text-3xl sm:text-4xl text-white font-bold">Premium Stages</h2>
              <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Complete Turnkey Setup Services</p>
            </div>
            <Link
              to="/decorations"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-gold-400/50 text-gold-400 hover:bg-gold-400 hover:text-black font-semibold rounded text-sm tracking-wider transition-all font-outfit"
            >
              VIEW ALL PACKAGES
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-96 rounded bg-slate-900 animate-pulse border border-gold-400/5"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {decorations.map((decor) => (
                <motion.div
                  key={decor._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg overflow-hidden card-luxury group relative flex flex-col bg-slate-950"
                >
                  {/* Package Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={decor.images[0]}
                      alt={decor.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-gold-300 font-bold uppercase tracking-widest">
                        {decor.category?.name || 'Package'}
                      </p>
                      <h3 className="font-outfit text-white text-lg font-bold group-hover:text-gold-400 transition-colors line-clamp-1">
                        {decor.title}
                      </h3>
                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                        {decor.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gold-400/5">
                      <span className="text-[11px] text-zinc-500 italic">Theme: {decor.theme}</span>
                      <button
                        onClick={() => openWhatsApp('919392446108', `Hello, I'm interested in booking ${decor.title} (${decor.category?.name || 'Decoration'}). Please let me know the availability and booking details.`)}
                        className="inline-flex items-center text-xs text-gold-400 font-bold hover:text-white uppercase tracking-wider transition-colors"
                      >
                        BOOK NOW
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>



      {/* 5. Promotional Section */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-gold-400/10">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="font-playfair text-3xl sm:text-5xl text-white font-bold">Plan Your Celebration with Us</h2>
          <p className="text-zinc-400 font-light text-base max-w-xl mx-auto">
            Ready to design a premium, memorable event? Explore our rental catalogs or consult our designers for complete stage decorations today.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3 rounded-md text-xs font-semibold tracking-widest font-outfit btn-gold shadow-luxury"
            >
              GET FREE CONSULTATION
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
