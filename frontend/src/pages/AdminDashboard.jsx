import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, ShoppingBag, Users, Star, ArrowUpRight, TrendingUp } from 'lucide-react';
import * as api from '../services/api.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.fetchAdminDashboard();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#070b13] text-zinc-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  if (!stats) return <p className="text-zinc-500 text-sm">Failed to retrieve analytics.</p>;

  // Data for cards
  const metrics = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: ShoppingBag, color: 'text-gold-400' },
    { label: 'Registered Clients', value: stats.totalUsers, icon: Users, color: 'text-cyan-400' },
    { label: 'Reviews Logs', value: stats.totalReviews, icon: Star, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 bg-[#070b13] text-zinc-300 font-sans">
      
      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{card.label}</p>
                <p className="font-outfit text-white text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`p-3 bg-[#0f1b32] border border-gold-400/5 rounded-lg ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue growth Chart */}
        <div className="lg:col-span-2 bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-outfit text-white text-base font-bold tracking-wider">Revenue Growth Trend</h3>
              <p className="text-[10px] text-zinc-500">Monthly gross collection summaries</p>
            </div>
            <TrendingUp className="h-5 w-5 text-gold-400" />
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip contentStyle={{ backgroundColor: '#0a1120', border: '1px solid rgba(212,175,55,0.2)', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings distributions */}
        <div className="bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-white text-base font-bold tracking-wider">Bookings Volume</h3>
          <p className="text-[10px] text-zinc-500">Monthly booking count</p>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip contentStyle={{ backgroundColor: '#0a1120', border: '1px solid rgba(212,175,55,0.2)', color: '#fff' }} />
                <Bar dataKey="bookings" fill="#b89228">
                  {stats.monthlyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d4af37' : '#b89228'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Popular Items and Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Popular stages and props list */}
        <div className="lg:col-span-1 bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2">Popular Items</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-2">Stage Packages</p>
              {stats.popularDecorations.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No stages booked yet.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.popularDecorations.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 truncate max-w-[150px]">{item.title}</span>
                      <span className="text-zinc-500">{item.count} bookings</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-2 border-t border-gold-400/5">
              <p className="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-2">Rental Props</p>
              {stats.popularRentals.length === 0 ? (
                <p className="text-zinc-500 text-xs italic">No props hired yet.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.popularRentals.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 truncate max-w-[150px]">{item.title}</span>
                      <span className="text-zinc-500">{item.count} hired</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings table */}
        <div className="lg:col-span-2 bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2">Recent Bookings Log</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-gold-400/10 text-white font-semibold">
                  <th className="py-2.5">Booking Ref</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Event Date</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/5">
                {stats.recentOrders.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-zinc-300">{booking.bookingId}</td>
                    <td className="py-3">{booking.user?.name || 'Guest'}</td>
                    <td className="py-3">{booking.eventDate}</td>
                    <td className="py-3 font-semibold text-white">₹{booking.totalAmount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                        booking.bookingStatus === 'confirmed'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
