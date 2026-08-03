import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Search, Edit, FileText, CheckCircle2, Truck, Hammer, PartyPopper } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Update status popup state
  const [updatingId, setUpdatingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await api.fetchAdminBookings();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenStatusModal = (booking) => {
    setUpdatingId(booking._id);
    setNewStatus(booking.bookingStatus);
    setTimelineTitle('');
    setTimelineDesc('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        status: newStatus,
        title: timelineTitle || undefined,
        description: timelineDesc || undefined
      };
      
      const { data } = await api.updateAdminBookingStatus(updatingId, payload);
      if (data.success) {
        setBookings(prev => prev.map(b => b._id === updatingId ? { ...b, bookingStatus: newStatus } : b));
        setUpdatingId(null);
        fetchBookings(); // reload details
      }
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
    (b.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#070b13]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#070b13] text-zinc-300">
      
      {/* Search Header */}
      <div className="flex justify-between items-center bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Booking Ref or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 pl-9 text-xs text-white focus:outline-none"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-[#0a1120] border border-gold-400/10 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead>
              <tr className="border-b border-gold-400/10 bg-[#0f1b32] text-white font-semibold">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Event Date / slot</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Tracking Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/5">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-zinc-300">{b.bookingId}</td>
                  <td className="p-4 space-y-0.5">
                    <p className="font-semibold text-white">{b.user?.name || 'Guest'}</p>
                    <p className="text-[10px] text-zinc-500">{b.user?.contact || 'No phone'}</p>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <p className="text-white font-medium">{b.eventDate}</p>
                    <p className="text-[10px] text-zinc-500">{b.eventTime}</p>
                  </td>
                  <td className="p-4 font-semibold text-white">₹{b.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      b.paymentStatus === 'paid' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900 border border-gold-400/25 text-gold-400">
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenStatusModal(b)}
                      className="p-1.5 bg-[#0f1b32] hover:bg-gold-400 hover:text-black rounded border border-gold-400/10 text-gold-400 transition-all inline-flex items-center"
                      title="Update Tracking Timeline"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={api.downloadInvoiceUrl(b._id)}
                      download
                      className="p-1.5 bg-[#0f1b32] hover:bg-slate-800 hover:text-white rounded border border-gold-400/10 text-zinc-400 transition-all inline-flex items-center"
                      title="Invoice Receipt"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Tracking Modal dialog */}
      {updatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-slate-950 border border-gold-400/30 rounded-lg max-w-md w-full overflow-hidden shadow-luxury-lg">
            <div className="p-6 border-b border-gold-400/10">
              <h3 className="font-outfit text-white text-base font-bold tracking-wider">
                Advance Booking Tracking Status
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">Specify timeline updates to notify the client.</p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4 font-sans text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Booking status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-zinc-300 focus:outline-none"
                >
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="confirmed">Confirmed (Paid)</option>
                  <option value="processing">Prepared (Decor Ready & Dispatched)</option>
                  <option value="setup">Setup In Progress (Manual styling active)</option>
                  <option value="completed">Completed (Event Finished)</option>
                  <option value="cancelled">Cancelled (Declined/Refunded)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Timeline Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stage styling completed"
                  value={timelineTitle}
                  onChange={(e) => setTimelineTitle(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Timeline Event Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional details..."
                  value={timelineDesc}
                  onChange={(e) => setTimelineDesc(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingId(null)}
                  className="flex-1 py-2.5 border border-gold-400/20 text-zinc-400 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 btn-gold font-semibold rounded"
                >
                  Update Timeline
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBookings;
