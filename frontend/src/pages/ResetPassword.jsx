import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../services/api.js';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.resetPassword(token, password);
      setLoading(false);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
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
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            CREATE NEW PASSWORD
          </span>
          <h2 className="font-playfair text-3xl font-bold text-white tracking-widest">Reset Password</h2>
          <p className="text-zinc-500 text-xs font-light">Choose a secure password for your account.</p>
        </div>

        {error && <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded text-center">{error}</div>}
        
        {success ? (
          <div className="text-center py-6 text-emerald-400 space-y-2">
            <CheckCircle2 className="h-10 w-10 mx-auto" />
            <p className="text-sm font-bold">Password Reset Successful!</p>
            <p className="text-xs text-zinc-500">Redirecting you to the sign in page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1 text-gold-400" /> New Password
              </label>
              <input
                type="password"
                placeholder="Min 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1 text-gold-400" /> Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  REWRITING PASSWORD...
                </>
              ) : (
                'SAVE NEW PASSWORD'
              )}
            </button>
          </form>
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

export default ResetPassword;
