import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Mail, Lock, User, Phone, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const target = redirect ? (redirect.startsWith('/') ? redirect : `/${redirect}`) : '/';
      navigate(target);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !email || !password || !contact) {
      setError('Please fill in all registration fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const res = await register(name, email, password, contact);
    setLoading(false);

    if (res.success) {
      const target = redirect ? (redirect.startsWith('/') ? redirect : `/${redirect}`) : '/';
      navigate(target);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="bg-[#000814] min-h-screen py-16 flex items-center justify-center text-zinc-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 bg-slate-950/40 border border-gold-400/15 p-8 rounded-lg shadow-luxury space-y-6"
      >
        {/* Brand */}
        <div className="text-center space-y-2">
          <span className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.25em] flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            CREATE ACCOUNT
          </span>
          <h2 className="font-playfair text-3xl font-bold text-white tracking-widest">HappyMoments</h2>
          <p className="text-zinc-500 text-xs font-light">Register to start booking premium event decoration.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
              <User className="h-3.5 w-3.5 mr-1 text-gold-400" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vijay Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1 text-gold-400" /> Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1 text-gold-400" /> Mobile Number
            </label>
            <input
              type="text"
              placeholder="e.g. +91 9998887776"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
              <Lock className="h-3.5 w-3.5 mr-1 text-gold-400" /> Password
            </label>
            <input
              type="password"
              placeholder="Min 6 characters..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2 shadow-luxury"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                CREATING ACCOUNT...
              </>
            ) : (
              'REGISTER ACCOUNT'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2">
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-gold-400 hover:underline">
            Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
