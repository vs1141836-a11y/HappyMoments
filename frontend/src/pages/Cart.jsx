import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { Trash2, Calendar, MapPin, Clock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../services/api.js';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getTax, 
    getShippingFee, 
    getGrandTotal 
  } = useContext(CartContext);
  
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState(null);
  
  // Local edit states
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleEditClick = (item) => {
    setEditingItem(item._id);
    setEditDate(item.eventDate);
    setEditTime(item.eventTime);
    setEditLocation(item.eventLocation);
  };

  const handleSaveClick = async (itemId) => {
    await updateQuantity(itemId, undefined, {
      eventDate: editDate,
      eventTime: editTime,
      eventLocation: editLocation
    });
    setEditingItem(null);
  };

  const handleCheckout = () => {
    if (!user) {
      // Guide user to login first, carrying a return state
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">Your Booking Cart</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Review Your Selected Stages & Rental Props</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-24 bg-slate-950/20 border border-gold-400/10 rounded-lg">
            <h3 className="font-playfair text-2xl text-white font-semibold mb-2">Your Cart is Empty</h3>
            <p className="text-zinc-500 text-sm mb-8">You have not selected any decoration packages or prop rentals yet.</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/decorations"
                className="px-6 py-2.5 btn-gold rounded text-xs font-semibold tracking-wider font-outfit"
              >
                Browse Packages
              </Link>
              <Link
                to="/rentals"
                className="px-6 py-2.5 border border-gold-400 text-gold-400 hover:bg-gold-400/10 rounded text-xs tracking-wider transition-colors font-outfit"
              >
                Browse Props
              </Link>
            </div>
          </div>
        ) : (
          // Cart layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                const isDecor = item.itemType === 'Decoration';
                const detail = isDecor ? item.decorItem : item.rentalItem;
                const price = isDecor ? detail?.price : detail?.rentalPrice;

                if (!detail) return null;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 bg-slate-950/40 border border-gold-400/15 rounded-lg flex flex-col md:flex-row gap-6 justify-between items-start"
                  >
                    
                    {/* Item Image */}
                    <div className="w-full md:w-32 aspect-[4/3] rounded overflow-hidden bg-slate-900 shrink-0 border border-gold-400/10">
                      <img src={getImageUrl(detail.images[0])} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <span className="text-[9px] text-gold-400 font-bold uppercase tracking-widest">
                          {isDecor ? 'Complete Stage Service' : 'Individual Rental Prop'}
                        </span>
                        <h3 className="font-outfit text-white text-base font-bold line-clamp-1">{detail.title}</h3>
                        {item.color || item.size ? (
                          <p className="text-[10px] text-zinc-500 italic mt-0.5">
                            {item.color && `Color: ${item.color}`} {item.size && `| Size: ${item.size}`}
                          </p>
                        ) : null}
                      </div>

                      {/* Logistic metadata cards */}
                      {editingItem === item._id ? (
                        // Edit Mode
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#080f1e] p-4 rounded border border-gold-400/10">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Date</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full bg-slate-900 border border-gold-400/20 rounded p-1 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Time Slot</label>
                            <select
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="w-full bg-slate-900 border border-gold-400/20 rounded p-1 text-xs text-zinc-300"
                            >
                              <option>Morning (8:00 AM - 1:00 PM)</option>
                              <option>Afternoon (1:00 PM - 5:00 PM)</option>
                              <option>Evening (5:00 PM - 10:00 PM)</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">Setup Location Address</label>
                            <textarea
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              rows="1"
                              className="w-full bg-slate-900 border border-gold-400/20 rounded p-1 text-xs text-white"
                            ></textarea>
                          </div>
                          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-1 bg-transparent hover:bg-slate-800 text-zinc-400 rounded text-xs transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveClick(item._id)}
                              className="px-3 py-1 btn-gold rounded text-xs font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="space-y-1.5 text-xs text-zinc-400 font-light">
                          <p className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-2 text-gold-400 shrink-0" />
                            <span>Date: <strong>{item.eventDate}</strong></span>
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-2 text-gold-400 shrink-0" />
                            <span>Setup slot: {item.eventTime}</span>
                          </p>
                          <p className="flex items-start">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-gold-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">Address: {item.eventLocation}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex md:flex-col justify-between items-end md:h-28 md:pl-6 border-t md:border-t-0 md:border-l border-gold-400/10 pt-4 md:pt-0 w-full md:w-auto shrink-0 gap-4">
                      
                      <div className="text-right">
                        <span className="text-xs text-zinc-400">Selected Item</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Edit logistics button */}
                        {editingItem !== item._id && (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-xs text-gold-400 hover:text-white transition-colors"
                          >
                            Edit Setup
                          </button>
                        )}

                        {/* Quantity change for rentals */}
                        {!isDecor && editingItem !== item._id && (
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                            className="bg-[#080f1e] border border-gold-400/20 text-xs rounded p-1 text-white focus:outline-none"
                          >
                            {[...Array(detail.quantityAvailable || 10).keys()].map(x => (
                              <option key={x + 1} value={x + 1}>{x + 1}</option>
                            ))}
                          </select>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-zinc-500 hover:text-rose-500 transition-colors p-2"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* Booking Summary Card */}
            <aside className="glassmorphism p-6 rounded-lg border border-gold-400/20 space-y-6">
              <h3 className="font-outfit text-white tracking-wider text-sm font-bold border-b border-gold-400/10 pb-2">
                BOOKING DETAIL SUMMARY
              </h3>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Event Date:</span>
                  <span className="text-white font-semibold">{cartItems[0]?.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Setup Slot:</span>
                  <span className="text-white font-semibold">{cartItems[0]?.eventTime}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 block">Setup Venue Address:</span>
                  <span className="text-white font-medium block leading-relaxed line-clamp-2">{cartItems[0]?.eventLocation}</span>
                </div>
              </div>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 py-1 bg-slate-950/40 rounded border border-gold-400/5">
                <ShieldCheck className="h-4 w-4 text-gold-400" />
                <span>Instant availability verification via WhatsApp</span>
              </div>

              {/* Action */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2 shadow-luxury"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-[10px] text-zinc-500 leading-relaxed text-center">
                * Note: Bookings are finalized offline. Completing checkout registers your booking in our database and redirects you to WhatsApp for immediate confirmation.
              </p>
            </aside>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
