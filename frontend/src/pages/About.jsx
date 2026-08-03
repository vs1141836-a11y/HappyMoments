import React from 'react';
import { Sparkles, Trophy, CalendarClock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">About HappyMoments</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Curating Premium Event Decor Since 2018</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="font-playfair text-2xl sm:text-3xl text-white font-bold tracking-wider">Our Styling Philosophy</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans">
              At HappyMoments, we believe that every event is a canvas waiting for a masterpiece. We design premium setups inspired by royal aesthetics, modern trends, and the unique personalities of our clients. 
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans">
              Our team consists of senior floral designers, master balloon artists, and structured carpenters who work collectively to transform simple halls and banquets into luxury spaces. Whether it is a grand wedding stage backdrop or a bespoke balloon theme for a milestone birthday, we handle every detail from design to on-site alignment and dismantling.
            </p>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden border border-gold-400/20 shadow-luxury relative group">
            <img 
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80" 
              alt="About Us Decor" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-slate-950/20"></div>
          </div>
        </div>

        {/* Metrics/USPs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-gold-400/10 pt-16">
          {[
            { icon: Sparkles, val: '500+', title: 'Events Curated', desc: 'From royal weddings to intimate garden anniversaries.' },
            { icon: Trophy, val: 'Premium', title: 'Top-tier Materials', desc: 'Imported silks, fresh cut roses & high-gloss acrylic plinths.' },
            { icon: CalendarClock, val: '24h', title: 'Setup Schedules', desc: 'Timely on-site assembly, adjustments & teardown services.' },
            { icon: ShieldCheck, val: 'Verified', title: 'Razorpay Secure', desc: 'Convenient 100% online deposit checking & confirmation.' },
          ].map((usp, idx) => {
            const Icon = usp.icon;
            return (
              <div key={idx} className="p-6 bg-slate-950/40 border border-gold-400/10 rounded-lg text-center space-y-3">
                <div className="inline-flex p-3 bg-gold-400 text-black rounded-full mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-outfit text-white text-lg font-bold">{usp.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed font-sans">{usp.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default About;
