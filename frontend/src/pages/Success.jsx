import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, Calendar, MapPin, LayoutDashboard, ExternalLink, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { openWhatsApp } from '../utils/whatsapp.js';
import * as api from '../services/api.js';

const Success = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleOpenWhatsApp = () => {
    if (!booking) return;

    const itemsList = (booking.items || []).map((item) => {
      const colorStr = item.color ? ` (Color: ${item.color})` : '';
      const sizeStr = item.size ? ` (Size: ${item.size})` : '';
      const specStr = `${colorStr}${sizeStr}`;
      return `• ${item.title || item.itemId} x ${item.quantity}${specStr}`;
    }).join('\n');

    const messageText = `Hello HappyMoments, I want to book event decoration services. Here are my requirements:

*Booking ID:* ${booking.bookingId}
*Customer Name:* ${booking.user?.name || 'Customer'}

*Event Date:* ${booking.eventDate}
*Setup Slot:* ${booking.eventTime}
*Setup Location:* ${booking.eventLocation}

*Selected Items:*
${itemsList}

Please confirm availability and discuss pricing. Thank you!`;

    openWhatsApp('919392446108', messageText);
  };

  useEffect(() => {
    // Fire celebration confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FAF9F6', '#D4AF37', '#b89228', '#ffd700']
    });

    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.getBookingDetails(bookingId);
        if (data.success) {
          setBooking(data.booking);
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000814] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300 flex items-center justify-center">
      <div className="max-w-xl w-full px-4 text-center space-y-8">
        
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex justify-center"
        >
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-full text-emerald-400">
            <CheckCircle2 className="h-16 w-16" />
          </div>
        </motion.div>

        {/* Success Header */}
        <div className="space-y-2">
          <h1 className="font-playfair text-3xl sm:text-4xl text-white font-bold tracking-widest uppercase">Booking Confirmed!</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Your Happy Moments Are Registered</p>
        </div>

        {booking ? (
          // Booking Details Card
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-slate-950/50 border border-gold-400/20 rounded-lg text-left space-y-4 shadow-luxury"
          >
            <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 text-xs">
              <span className="text-zinc-500">BOOKING ID:</span>
              <span className="font-mono font-bold text-white tracking-wider">{booking.bookingId}</span>
            </div>

            <div className="space-y-3 text-xs font-light">
              <div className="flex items-center text-zinc-400">
                <Calendar className="h-4 w-4 mr-3 text-gold-400 shrink-0" />
                <span>Event Scheduled: <strong>{booking.eventDate}</strong> ({booking.eventTime})</span>
              </div>
              <div className="flex items-start text-zinc-400">
                <MapPin className="h-4 w-4 mr-3 text-gold-400 mt-0.5 shrink-0" />
                <span>Venue Address: {booking.eventLocation}</span>
              </div>
            </div>

            <div className="border-t border-gold-400/10 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <p className="text-[10px] text-zinc-500">Order Booking Status</p>
                <p className="font-outfit text-emerald-400 font-bold text-base uppercase">{booking.bookingStatus || 'PENDING'}</p>
              </div>

              {/* Invoice Download */}
              <a
                href={api.downloadInvoiceUrl(booking._id)}
                download
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-gold-400 hover:text-white rounded border border-gold-400/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all font-outfit tracking-wider"
              >
                <FileText className="h-4 w-4" />
                DOWNLOAD PDF INVOICE
              </a>
            </div>
          </motion.div>
        ) : (
          <p className="text-zinc-500 text-xs italic">A confirmation email was dispatched. You can track booking timeline on your dashboard.</p>
        )}

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-4 btn-gold rounded text-xs font-bold tracking-widest font-outfit flex items-center justify-center gap-2 shadow-luxury text-black"
            >
              <MessageSquare className="h-4.5 w-4.5" />
              CONFIRM & CHAT ON WHATSAPP
            </button>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-2.5 btn-gold rounded text-xs font-semibold tracking-widest font-outfit flex items-center gap-1.5 shadow-luxury"
          >
            <LayoutDashboard className="h-4 w-4" />
            TRACK ON DASHBOARD
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 border border-gold-400 text-gold-400 hover:bg-gold-400/10 rounded text-xs font-semibold tracking-widest font-outfit transition-colors"
          >
            RETURN HOME
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Success;
