import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already logged in, redirect away
    if (user) {
      const target = redirect ? (redirect.startsWith('/') ? redirect : `/${redirect}`) : '/';
      navigate(target);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all credentials.');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
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
            SECURE SIGN IN
          </span>
          <h2 className="font-playfair text-3xl font-bold text-white tracking-widest">HappyMoments</h2>
          <p className="text-zinc-500 text-xs font-light">Enter credentials to manage your decor bookings.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1 text-gold-400" /> Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. vijay@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1 text-gold-400" /> Password
              </label>
              <Link to="/forgot-password" className="text-[10px] text-gold-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Enter password..."
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
                VERIFYING...
              </>
            ) : (
              'SIGN IN TO SYSTEM'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2">
          Don't have an account?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-gold-400 hover:underline">
            Register Now
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
