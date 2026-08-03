import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, ShoppingBag, Heart, Star, Sparkles, CheckCircle2, ShieldAlert, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { openWhatsApp } from '../utils/whatsapp.js';
import * as api from '../services/api.js';

const ItemDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Form Logistics states
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('Morning (8:00 AM - 1:00 PM)');
  const [eventLocation, setEventLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [guestCount, setGuestCount] = useState(100);

  // Availability statuses
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // 'available' or 'blocked'

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        if (type === 'decor') {
          const { data } = await api.getDecorationDetails(id);
          if (data.success) {
            setItem(data.decoration);
            setSimilarItems(data.similar || []);
          }
        } else {
          const { data } = await api.getRentalDetails(id);
          if (data.success) {
            setItem(data.rental);
            setSimilarItems(data.related || []);
            // Set default color and size for rental
            if (data.rental.availableColors?.length > 0) setColor(data.rental.availableColors[0]);
            if (data.rental.availableSizes?.length > 0) setSize(data.rental.availableSizes[0]);
          }
        }

        // Fetch reviews
        const revType = type === 'decor' ? 'Decoration' : 'DecorationRental';
        const { data: revData } = await api.fetchItemReviews(revType, id);
        if (revData.success) {
          setReviews(revData.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
        setActiveImage(0);
        setAvailabilityMessage(null);
        setAvailabilityStatus(null);
      }
    };

    fetchItemDetails();
  }, [type, id]);

  // Check Availability when date changes
  useEffect(() => {
    if (!eventDate || !item) return;

    const checkDate = async () => {
      setCheckingAvailability(true);
      setAvailabilityMessage(null);
      try {
        const itemCheck = {
          itemType: type === 'decor' ? 'Decoration' : 'DecorationRental',
          itemId: item._id,
          quantity: type === 'decor' ? 1 : quantity,
          title: item.title,
        };

        const { data } = await api.checkAvailability([itemCheck], eventDate);
        if (data.success && data.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('Date & slot is available for booking!');
        } else {
          setAvailabilityStatus('blocked');
          setAvailabilityMessage(data.conflicts[0]?.message || 'This item is fully booked on the selected date.');
        }
      } catch (err) {
        setAvailabilityStatus('error');
        setAvailabilityMessage('Failed to check availability.');
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkDate();
  }, [eventDate, quantity]);

  const handleAction = async (actionType) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    if (actionType === 'cart') {
      if (!user) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }

      if (!eventDate) {
        setSubmitError('Please select a valid event date.');
        return;
      }
      if (!eventLocation.trim()) {
        setSubmitError('Please specify the event setup address.');
        return;
      }
      if (availabilityStatus === 'blocked') {
        setSubmitError('This item is unavailable on your selected event date.');
        return;
      }

      setSubmitting(true);
      
      const cartData = {
        itemType: type === 'decor' ? 'Decoration' : 'DecorationRental',
        itemId: item._id,
        eventDate,
        eventTime,
        eventLocation,
        quantity: type === 'decor' ? 1 : quantity,
        color: type === 'decor' ? undefined : color,
        size: type === 'decor' ? undefined : size,
      };

      const res = await addToCart(cartData);
      setSubmitting(false);

      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(res.message);
      }
    } else if (actionType === 'buy') {
      // Direct booking to WhatsApp Click-to-Chat immediately!
      const categoryName = item.category?.name || (type === 'decor' ? 'Decoration' : 'Prop Rental');
      
      let messageText = '';
      if (eventDate) {
        messageText = `Hello, I'm interested in booking ${item.title} for ${categoryName} on ${eventDate} for approximately ${guestCount} guests. Please let me know the availability and booking details.${user?.name ? ` - Thanks, ${user.name}` : ''}`;
      } else {
        messageText = `Hello, I'm interested in booking ${item.title} (${categoryName}). Please let me know the availability and booking details.${user?.name ? ` - Thanks, ${user.name}` : ''}`;
      }

      openWhatsApp('919392446108', messageText);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000814] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#000814] text-center py-20">
        <h3 className="font-playfair text-2xl text-white">Item Not Found</h3>
        <p className="text-zinc-500 mt-2">The decoration package or rental prop you requested could not be located.</p>
        <Link to="/" className="inline-block mt-6 text-gold-400 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  const isFav = isInWishlist(type === 'decor' ? 'Decoration' : 'DecorationRental', item._id);

  return (
    <div className="bg-[#000814] min-h-screen py-12 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-zinc-500 mb-8 tracking-wider">
          <Link to="/" className="hover:text-gold-400">HOME</Link> /{' '}
          <Link to={type === 'decor' ? '/decorations' : '/rentals'} className="hover:text-gold-400">
            {type === 'decor' ? 'DECORATIONS' : 'RENTALS'}
          </Link>{' '}
          / <span className="text-gold-400 uppercase">{item.title}</span>
        </div>

        {/* Content Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gold-400/20 bg-slate-950">
              <img
                src={item.images[activeImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(type === 'decor' ? 'Decoration' : 'DecorationRental', item._id)}
                className={`absolute top-4 right-4 p-3 rounded-full border bg-black/60 backdrop-blur-sm transition-colors ${
                  isFav ? 'border-rose-600 text-rose-500' : 'border-gold-400/20 text-zinc-300 hover:text-rose-500'
                }`}
              >
                <Heart className="h-5 w-5" fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Thumbnail previews */}
            <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 aspect-[4/3] shrink-0 rounded overflow-hidden border transition-all ${
                    activeImage === i ? 'border-gold-400 scale-95' : 'border-gold-400/10 hover:border-gold-400/40'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Form Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.25em] flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                {item.category?.name}
              </span>
              <h1 className="font-playfair text-3xl sm:text-4xl text-white font-bold tracking-wide">
                {item.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-1.5 text-sm text-gold-400 font-bold">
                <Star className="h-4 w-4 fill-current" />
                <span>{item.averageRating || '4.8'}</span>
                <span className="text-zinc-500 font-light">({reviews.length} reviews)</span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed font-sans">{item.description}</p>
            </div>

            {type === 'decor' && item.includedItems && (
              <div className="space-y-3 bg-slate-950/40 border border-gold-400/10 p-5 rounded-lg">
                <h3 className="text-sm font-bold text-white tracking-widest uppercase">What is Included:</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                  {item.includedItems.map((inc, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-gold-400 mr-2">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Logistics Input Form */}
            <div className="glassmorphism p-6 rounded-lg border border-gold-400/20 space-y-6">
              <h3 className="font-outfit text-white tracking-wider text-sm font-bold border-b border-gold-400/10 pb-2">
                EVENT BOOKING PARTICULARS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Event Date */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gold-400" /> Event Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>

                {/* Time Slot */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gold-400" /> Setup Time Slot
                  </label>
                  <select
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-400"
                  >
                    <option>Morning (8:00 AM - 1:00 PM)</option>
                    <option>Afternoon (1:00 PM - 5:00 PM)</option>
                    <option>Evening (5:00 PM - 10:00 PM)</option>
                  </select>
                </div>

                {/* Guest Count */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center">
                    <Users className="h-3 w-3 mr-1 text-gold-400" /> Expected Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Event Location */}
              <div className="space-y-1">
                <label className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gold-400" /> Event Venue Address
                </label>
                <textarea
                  placeholder="Enter complete address / function hall name..."
                  rows="2"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white focus:outline-none focus:border-gold-400"
                ></textarea>
              </div>

              {/* Rental Options: Color, Size, Qty */}
              {type === 'rental' && (
                <div className="grid grid-cols-3 gap-3 border-t border-gold-400/10 pt-4">
                  {/* Colors */}
                  {item.availableColors?.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Colour</label>
                      <select
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-1.5 text-xs text-zinc-300 focus:outline-none"
                      >
                        {item.availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Sizes */}
                  {item.availableSizes?.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Size</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-1.5 text-xs text-zinc-300 focus:outline-none"
                      >
                        {item.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Qty</label>
                    <input
                      type="number"
                      min="1"
                      max={item.quantityAvailable}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-1.5 text-xs text-white text-center focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Real-time date availability checker alerts */}
              {eventDate && (
                <div className="pt-2">
                  {checkingAvailability ? (
                    <p className="text-xs text-zinc-500 animate-pulse">Verifying date availability conflict...</p>
                  ) : availabilityStatus === 'available' ? (
                    <div className="flex items-center text-emerald-400 text-xs gap-1.5 bg-emerald-950/20 p-2.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{availabilityMessage}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-rose-400 text-xs gap-1.5 bg-rose-950/20 p-2.5 rounded border border-rose-500/20">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{availabilityMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error/Success messages */}
              {submitError && <p className="text-xs text-rose-500 text-center">{submitError}</p>}
              
              {/* Submission actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleAction('cart')}
                  disabled={submitting || checkingAvailability}
                  className="flex-1 py-3 border border-gold-400/50 hover:bg-gold-400/10 text-gold-400 text-xs font-semibold tracking-widest rounded transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  ADD TO CART
                </button>
                <button
                  onClick={() => handleAction('buy')}
                  disabled={submitting || checkingAvailability}
                  className="flex-1 py-3 btn-gold text-xs font-semibold tracking-widest rounded flex items-center justify-center gap-2"
                >
                  {type === 'decor' ? 'BOOK NOW' : 'RENT NOW'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Success Alert popup */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50 bg-[#0a1120] border border-emerald-500/30 shadow-luxury-lg px-6 py-4 rounded-lg flex items-center gap-3 text-emerald-400"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Added to Cart!</p>
                <p className="text-xs text-zinc-400">The item was added to your unified cart.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. Review list section */}
        <section className="mt-24 border-t border-gold-400/10 pt-16">
          <h2 className="font-playfair text-2xl text-white font-bold mb-8">Customer Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No reviews have been left for this item yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-6 bg-slate-950/40 border border-gold-400/10 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{rev.user?.name}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center text-gold-400 gap-1 text-xs">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. Similar Items Suggestions */}
        {similarItems.length > 0 && (
          <section className="mt-24 border-t border-gold-400/10 pt-16">
            <h2 className="font-playfair text-2xl text-white font-bold mb-8">
              {type === 'decor' ? 'Similar Decoration Packages' : 'Related Rental Items'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarItems.map((item) => (
                <div key={item._id} className="rounded-lg overflow-hidden border border-gold-400/10 bg-slate-950 hover:border-gold-400/30 transition-all flex flex-col justify-between">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-outfit text-sm text-white font-bold truncate">{item.title}</h3>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gold-400 font-bold">
                        ₹{type === 'decor' ? item.price.toLocaleString() : item.rentalPrice.toLocaleString()}
                      </span>
                      <Link to={`/item/${type}/${item._id}`} className="text-zinc-500 hover:text-gold-400 font-semibold uppercase">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ItemDetails;
