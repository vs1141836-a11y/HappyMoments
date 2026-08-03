import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../services/api.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [demoToken, setDemoToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDemoToken(null);
    setLoading(true);

    if (!email) {
      setError('Please provide email address.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.forgotPassword(email);
      setLoading(false);
      if (data.success) {
        setMessage('A password reset link has been generated.');
        if (data.resetToken) {
          // Store token in state to allow direct sandbox redirection!
          setDemoToken(data.resetToken);
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to request reset token.');
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
        <div className="text-center space-y-2">
          <span className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.25em] flex items-center justify-center">
            <KeyRound className="h-3.5 w-3.5 mr-1" />
            PASSWORD RECOVERY
          </span>
          <h2 className="font-playfair text-3xl font-bold text-white tracking-widest">Forgot Password?</h2>
          <p className="text-zinc-500 text-xs font-light">Recover access using your registered email address.</p>
        </div>

        {error && <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded text-center">{error}</div>}
        {message && <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs rounded text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2 shadow-luxury"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                PROCESSING REQUEST...
              </>
            ) : (
              'GENERATE RESET TOKEN'
            )}
          </button>
        </form>

        {/* Sandbox Helper Direct Shortcut */}
        {demoToken && (
          <div className="p-4 bg-gold-950/20 border border-gold-400/20 rounded text-xs space-y-3 text-center">
            <p className="text-gold-300 font-bold">🛠️ Sandbox Demo Mode detected!</p>
            <p className="text-zinc-400 text-[10.5px] leading-relaxed">
              Since local email SMTP is not configured, we intercepted the token. Click below to bypass email and reset password directly:
            </p>
            <button
              onClick={() => navigate(`/reset-password/${demoToken}`)}
              className="w-full py-2 bg-gold-400 text-black hover:bg-gold-500 text-xs font-bold rounded"
            >
              BYPASS TO RESET PAGE
            </button>
          </div>
        )}

        <div className="text-center text-xs text-zinc-500 pt-2">
          Back to{' '}
          <Link to="/login" className="text-gold-400 hover:underline">
            Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
