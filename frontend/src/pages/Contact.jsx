import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Decoration Packages Query');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !email || !message) {
      setError('Please fill in name, email, and message.');
      setLoading(false);
      return;
    }

    // Simulate contact submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">Contact Us</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Connect with Our Creative Styling Coordinators</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Info Column */}
          <div className="space-y-8">
            <h2 className="font-playfair text-2xl sm:text-3xl text-white font-bold tracking-wider">Let's Design Your Dream Event</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans">
              Have special configuration requests or customized sizing specifications? Connect with us using the form. Our events team will reach back within 24 business hours to share custom pricing quotes and floral styling advice.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-3 bg-slate-900 border border-gold-400/20 text-gold-400 rounded-full mr-4 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-outfit text-white text-sm font-bold tracking-wider">OFFICE VENUE</h4>
                  <p className="text-zinc-500 text-xs mt-1">102, Gold Palace Mansion, Jubilee Hills, Hyderabad, India</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-slate-900 border border-gold-400/20 text-gold-400 rounded-full mr-4 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-outfit text-white text-sm font-bold tracking-wider">PHONE DETAILS</h4>
                  <p className="text-zinc-500 text-xs mt-1">+91 98765 43210 (Hours: 9 AM - 6 PM)</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-3 bg-slate-900 border border-gold-400/20 text-gold-400 rounded-full mr-4 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-outfit text-white text-sm font-bold tracking-wider">EMAIL CORRESPONDENCE</h4>
                  <p className="text-zinc-500 text-xs mt-1">support@happymoments.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="glassmorphism p-8 rounded-lg border border-gold-400/20 space-y-6">
            <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2 flex items-center">
              <Sparkles className="h-4 w-4 text-gold-400 mr-2" /> SEND ENQUIRY MESSAGE
            </h3>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vijay Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Enquiry Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option>Decoration Packages Query</option>
                  <option>Individual Prop Rental enquiry</option>
                  <option>Bespoke / Custom Stage designing</option>
                  <option>Feedback or General Questions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Enquiry Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your event date, theme preferences, budget limits, or prop sizing requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2 shadow-luxury"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    SENDING ENQUIRY...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    DISPATCH ENQUIRY
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Success alert pop */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0a1120] border border-emerald-500/30 shadow-luxury-lg px-6 py-4 rounded-lg flex items-center gap-3 text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Enquiry Received!</p>
              <p className="text-xs text-zinc-400">Our styling coordinators will review and email you shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Contact;
