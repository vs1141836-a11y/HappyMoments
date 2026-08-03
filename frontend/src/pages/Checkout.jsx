import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { MessageSquare, ChevronRight, HelpCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { openWhatsApp } from '../utils/whatsapp.js';
import * as api from '../services/api.js';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, getSubtotal, getTax, getShippingFee, getGrandTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activePendingBooking, setActivePendingBooking] = useState(null);

  // Address double check validation
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.contact || '');
  const [shippingAddress, setShippingAddress] = useState(
    cartItems.length > 0 ? cartItems[0].eventLocation : ''
  );

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !activePendingBooking) {
      navigate('/cart');
    }
  }, [cartItems, activePendingBooking]);

  const handlePayment = async () => {
    setError(null);
    setLoading(true);

    if (!contactName.trim() || !contactPhone.trim() || !shippingAddress.trim()) {
      setError('Please fill in name, contact phone, and event address fields.');
      setLoading(false);
      return;
    }

    try {
      // 1. Prepare booking details payload
      const payload = {
        eventDate: cartItems[0].eventDate,
        eventTime: cartItems[0].eventTime,
        eventLocation: shippingAddress,
        items: cartItems.map(item => ({
          itemType: item.itemType,
          itemId: item.itemType === 'Decoration' ? item.decorItem._id : item.rentalItem._id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          title: item.itemType === 'Decoration' ? item.decorItem.title : item.rentalItem.title,
        }))
      };

      // 2. Register pending booking order in Express backend
      const { data } = await api.createBookingOrder(payload);
      
      if (!data.success) {
        setError(data.message || 'Order registration failed.');
        setLoading(false);
        return;
      }

      const booking = data.booking;
      setActivePendingBooking(booking);

      // 3. Format WhatsApp booking text
      const itemsList = cartItems.map((item) => {
        const isDecor = item.itemType === 'Decoration';
        const detail = isDecor ? item.decorItem : item.rentalItem;
        const colorStr = item.color ? ` (Color: ${item.color})` : '';
        const sizeStr = item.size ? ` (Size: ${item.size})` : '';
        const specStr = `${colorStr}${sizeStr}`;
        return `• ${detail.title} x ${item.quantity}${specStr}`;
      }).join('\n');

      const messageText = `Hello HappyMoments, I want to book event decoration services. Here are my requirements:

*Booking ID:* ${booking.bookingId}
*Customer Name:* ${contactName}
*Contact Phone:* ${contactPhone}

*Event Date:* ${booking.eventDate}
*Setup Slot:* ${booking.eventTime}
*Setup Address:* ${booking.eventLocation}

*Selected Items:*
${itemsList}

Please confirm availability and discuss pricing. Thank you!`;

      // 4. Open WhatsApp Web or App
      openWhatsApp('919392446108', messageText);

      // 5. Clear cart state and navigate to success page (delayed to let browser open the tab/app)
      setTimeout(() => {
        clearCart();
        navigate(`/success?bookingId=${booking._id}`);
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || 'Checkout order generation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">Confirm Booking</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">100% Secure Checkout Gateway</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-center font-sans">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Logistics Address form column */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="glassmorphism p-6 rounded-lg border border-gold-400/20 space-y-6">
              <h3 className="font-outfit text-white tracking-wider text-sm font-bold border-b border-gold-400/10 pb-2">
                1. CONTACT & DELIVERY PARTICULARS
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Contact Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Contact Mobile No</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9998887776"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Setup Venue Address</label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Booked Items Summary */}
            <div className="glassmorphism p-6 rounded-lg border border-gold-400/20 space-y-4">
              <h3 className="font-outfit text-white tracking-wider text-sm font-bold border-b border-gold-400/10 pb-2">
                2. REVIEW ITEMS LIST
              </h3>

              <div className="divide-y divide-gold-400/10">
                {cartItems.map((item, idx) => {
                  const isDecor = item.itemType === 'Decoration';
                  const detail = isDecor ? item.decorItem : item.rentalItem;
                  if (!detail) return null;

                  return (
                    <div key={idx} className="py-4 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{detail.title}</p>
                        <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                          {item.eventDate} | {item.eventTime}
                          {item.color ? ` | Color: ${item.color}` : ''} {item.size ? ` | Size: ${item.size}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Booking total breakdown column */}
          <aside className="glassmorphism p-6 rounded-lg border border-gold-400/20 space-y-6">
            <h3 className="font-outfit text-white tracking-wider text-sm font-bold border-b border-gold-400/10 pb-2">
              BOOKING SUMMARY
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Event Date:</span>
                <span className="text-white font-semibold">{cartItems[0]?.eventDate}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Setup Slot:</span>
                <span className="text-white font-semibold">{cartItems[0]?.eventTime}</span>
              </div>
              <div className="space-y-1 text-zinc-400">
                <span>Setup Venue Address:</span>
                <span className="text-white font-medium block leading-relaxed line-clamp-3">{shippingAddress || 'Not specified'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gold-950/20 border border-gold-400/10 text-[9px] text-gold-300 rounded leading-relaxed">
              <Info className="h-4 w-4 shrink-0" />
              <span>Confirming this order will direct you to WhatsApp to coordinate the event booking with our manager.</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2 shadow-luxury"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  PROCESSING ORDER...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  CONFIRM & BOOK VIA WHATSAPP
                </>
              )}
            </button>
          </aside>

        </div>

      </div>

      {/* WhatsApp redirect indicator */}

    </div>
  );
};

export default Checkout;
