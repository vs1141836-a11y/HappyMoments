import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import * as api from '../services/api.js';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  Heart, 
  User as UserIcon, 
  Lock, 
  Phone, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  Hammer, 
  PartyPopper,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { toggleWishlist } = useContext(WishlistContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [wishlistDecor, setWishlistDecor] = useState([]);
  const [wishlistRent, setWishlistRent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded booking for timeline tracking
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contact || '');
  const [password, setPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // { itemType, itemId, title }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bookings
      const bookRes = await api.getBookingHistory();
      if (bookRes.data.success) {
        setBookings(bookRes.data.bookings);
      }

      // 2. Fetch Wishlist Items via User Profile Populate
      const meRes = await api.getProfile();
      if (meRes.data.success) {
        setWishlistDecor(meRes.data.wishlistDecorations || []);
        setWishlistRent(meRes.data.wishlistRentals || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setProfileMessage(null);
    setProfileError(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    const res = await updateProfile({ name, contact, password });
    if (res.success) {
      setProfileMessage('Profile updated successfully.');
      setPassword('');
    } else {
      setProfileError(res.message);
    }
  };

  const openReviewModal = (itemType, itemId, title) => {
    setReviewTarget({ itemType, itemId, title });
    setRating(5);
    setComment('');
    setReviewError(null);
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    if (!comment.trim()) {
      setReviewError('Please write some review feedback.');
      return;
    }

    try {
      const payload = {
        itemType: reviewTarget.itemType,
        itemId: reviewTarget.itemId,
        rating,
        comment,
      };

      const { data } = await api.submitReview(payload);
      if (data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
        }, 1500);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  // Status mapping to timeline steps
  const getTimelineSteps = (status) => {
    const steps = [
      { key: 'confirmed', label: 'Confirmed', icon: CalendarCheck, desc: 'Booking confirmed & date blocked.' },
      { key: 'processing', label: 'Prepared', icon: Truck, desc: 'Decor preparation & transport scheduled.' },
      { key: 'setup', label: 'Setup In Progress', icon: Hammer, desc: 'Manual styling active at venue.' },
      { key: 'completed', label: 'Completed', icon: PartyPopper, desc: 'Event successfully concluded.' }
    ];

    // Determine current index
    const statusKeys = ['confirmed', 'processing', 'setup', 'completed'];
    const currentIdx = statusKeys.indexOf(status);

    return steps.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentIdx,
      isActive: idx === currentIdx,
    }));
  };

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gold-400/10 pb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full border-2 border-gold-400 bg-slate-900 flex items-center justify-center text-gold-400 font-bold uppercase text-2xl">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl text-white font-bold tracking-wider">{user?.name}</h1>
              <p className="text-zinc-500 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-[#080f1e] p-1 rounded-lg border border-gold-400/10 shrink-0">
            {['bookings', 'wishlist', 'profile'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 font-outfit text-xs font-semibold tracking-wider rounded uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-gold-400 text-black shadow-luxury'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Views */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
          </div>
        ) : (
          <div>
            
            {/* 1. Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950/20 border border-gold-400/10 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                    <h3 className="font-playfair text-xl text-white font-semibold">No Bookings Found</h3>
                    <p className="text-zinc-500 text-xs mt-1 mb-6">You have not scheduled any events or bookings yet.</p>
                    <Link to="/decorations" className="px-6 py-2 btn-gold text-xs font-semibold rounded font-outfit tracking-wider">
                      Browse Decor Packages
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {bookings.map((booking) => {
                      const isExpanded = expandedBooking === booking._id;
                      return (
                        <div
                          key={booking._id}
                          className="bg-slate-950/40 border border-gold-400/15 rounded-lg overflow-hidden transition-all duration-300"
                        >
                          {/* Brief Top Header */}
                          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Booking Ref: {booking.bookingId}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="flex items-center text-zinc-400">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-gold-400 shrink-0" />
                                  {booking.eventDate}
                                </span>
                                <span className="flex items-center text-zinc-400">
                                  <Clock className="h-3.5 w-3.5 mr-1 text-gold-400 shrink-0" />
                                  {booking.eventTime}
                                </span>
                                <span className="text-gold-400 font-bold">
                                  ₹{booking.totalAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                                booking.paymentStatus === 'paid'
                                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                              }`}>
                                {booking.paymentStatus}
                              </span>
                              
                              <button
                                onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                                className="text-xs text-gold-400 hover:text-white font-semibold transition-colors"
                              >
                                {isExpanded ? 'Hide Tracker' : 'Track Booking'}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Tracker Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-gold-400/10 bg-[#040810] p-6 space-y-6"
                              >
                                {/* Address and timeline logs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gold-400/5 pb-6">
                                  <div className="md:col-span-1 space-y-2 text-xs">
                                    <h4 className="font-bold text-white uppercase tracking-wider">Setup Logistics</h4>
                                    <p className="flex items-start text-zinc-400">
                                      <MapPin className="h-4 w-4 mr-2 text-gold-400 mt-0.5 shrink-0" />
                                      <span>{booking.eventLocation}</span>
                                    </p>
                                    <div className="pt-4">
                                      <a
                                        href={api.downloadInvoiceUrl(booking._id)}
                                        download
                                        className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-gold-400 hover:text-white rounded border border-gold-400/20 text-xs font-semibold transition-all font-outfit"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        DOWNLOAD PDF INVOICE
                                      </a>
                                    </div>
                                  </div>

                                  {/* Items list with review triggers */}
                                  <div className="md:col-span-2 space-y-2 text-xs">
                                    <h4 className="font-bold text-white uppercase tracking-wider">Ordered Stages & Props</h4>
                                    <div className="divide-y divide-gold-400/5">
                                      {booking.items.map((item, idx) => (
                                        <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                                          <div>
                                            <p className="font-bold text-white">{item.title}</p>
                                            <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                                              {item.itemType === 'Decoration' ? 'Complete Stage' : 'Prop Rental'}
                                              {item.color ? ` | Color: ${item.color}` : ''} {item.size ? ` | Size: ${item.size}` : ''}
                                              {` | Qty: ${item.quantity}`}
                                            </p>
                                          </div>
                                          {booking.paymentStatus === 'paid' && (
                                            <button
                                              onClick={() => openReviewModal(item.itemType, item.itemType === 'Decoration' ? item.decorItem : item.rentalItem, item.title)}
                                              className="px-3 py-1 bg-transparent hover:bg-gold-400 hover:text-black border border-gold-400/30 text-gold-400 text-[10px] font-bold rounded transition-all"
                                            >
                                              Leave Review
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Status Timeline Progress tracker */}
                                <div className="space-y-4">
                                  <h4 className="font-bold text-white uppercase tracking-wider text-xs text-center md:text-left">Booking Tracking Timeline</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
                                    {getTimelineSteps(booking.bookingStatus).map((step, idx) => {
                                      const Icon = step.icon;
                                      return (
                                        <div key={idx} className="flex flex-col items-center text-center space-y-3 relative z-10">
                                          {/* Step circle */}
                                          <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all ${
                                            step.isActive 
                                              ? 'border-gold-400 bg-gold-400 text-black shadow-luxury'
                                              : step.isCompleted
                                                ? 'border-gold-400 bg-[#080f1e] text-gold-400'
                                                : 'border-gold-400/20 bg-slate-950 text-zinc-600'
                                          }`}>
                                            <Icon className="h-5 w-5" />
                                          </div>
                                          {/* Label & Details */}
                                          <div>
                                            <p className={`font-outfit text-xs font-bold ${
                                              step.isCompleted ? 'text-white' : 'text-zinc-500'
                                            }`}>{step.label}</p>
                                            <p className="text-[9px] text-zinc-500 font-light mt-1 max-w-[150px] mx-auto">{step.desc}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-8">
                {/* 2a. Decoration Packages wishlist */}
                <div>
                  <h3 className="font-playfair text-xl text-white font-bold mb-6 border-b border-gold-400/10 pb-2">Starred Stage Packages</h3>
                  {wishlistDecor.length === 0 ? (
                    <p className="text-zinc-500 text-xs italic">No stage packages have been added to your wishlist.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {wishlistDecor.map((item) => (
                        <div key={item._id} className="rounded-lg overflow-hidden border border-gold-400/10 bg-slate-950 flex flex-col justify-between group">
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => toggleWishlist('Decoration', item._id)}
                              className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-rose-500 border border-rose-500/20"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                          <div className="p-4 space-y-3">
                            <h4 className="font-outfit text-sm text-white font-bold truncate">{item.title}</h4>
                            <div className="flex justify-between items-center text-xs pt-2 border-t border-gold-400/5">
                              <span className="text-gold-400 font-bold">₹{item.price.toLocaleString()}</span>
                              <Link to={`/item/decor/${item._id}`} className="text-zinc-400 hover:text-white uppercase font-semibold flex items-center">
                                Book Stage
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2b. Rental Props wishlist */}
                <div className="pt-6">
                  <h3 className="font-playfair text-xl text-white font-bold mb-6 border-b border-gold-400/10 pb-2">Starred Rental Props</h3>
                  {wishlistRent.length === 0 ? (
                    <p className="text-zinc-500 text-xs italic">No individual prop items have been added to your wishlist.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {wishlistRent.map((item) => (
                        <div key={item._id} className="rounded-lg overflow-hidden border border-gold-400/10 bg-slate-950 flex flex-col justify-between group">
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => toggleWishlist('DecorationRental', item._id)}
                              className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-rose-500 border border-rose-500/20"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                          <div className="p-4 space-y-3">
                            <h4 className="font-outfit text-sm text-white font-bold truncate">{item.title}</h4>
                            <div className="flex justify-between items-center text-xs pt-2 border-t border-gold-400/5">
                              <span className="text-gold-400 font-bold">₹{item.rentalPrice.toLocaleString()} / d</span>
                              <Link to={`/item/rental/${item._id}`} className="text-zinc-400 hover:text-white uppercase font-semibold">
                                Rent Prop
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-xl mx-auto bg-slate-950/40 border border-gold-400/15 p-8 rounded-lg">
                <h3 className="font-outfit text-white tracking-widest text-sm font-bold border-b border-gold-400/10 pb-2 mb-6 text-center uppercase">
                  Update Account Profile
                </h3>

                {profileMessage && <p className="text-xs text-emerald-400 text-center mb-4">{profileMessage}</p>}
                {profileError && <p className="text-xs text-rose-500 text-center mb-4">{profileError}</p>}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                      <UserIcon className="h-3.5 w-3.5 mr-1 text-gold-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1 text-gold-400" /> Contact Phone
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase flex items-center">
                      <Lock className="h-3.5 w-3.5 mr-1 text-gold-400" /> Change Password
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 btn-gold text-xs font-semibold tracking-widest rounded shadow-luxury"
                  >
                    SAVE PROFILE DETAILS
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Review Dialog Modal */}
      <AnimatePresence>
        {showReviewModal && reviewTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-gold-400/30 rounded-lg max-w-md w-full overflow-hidden shadow-luxury-lg"
            >
              <div className="p-6 border-b border-gold-400/10">
                <h3 className="font-outfit text-white text-base font-bold tracking-wider truncate">
                  Write Feedback Review
                </h3>
                <p className="text-[10px] text-gold-400 uppercase tracking-widest mt-1 line-clamp-1">{reviewTarget.title}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                {reviewSuccess ? (
                  <div className="text-center py-6 text-emerald-400 space-y-2">
                    <CheckCircle2 className="h-10 w-10 mx-auto" />
                    <p className="text-sm font-bold">Review Published!</p>
                    <p className="text-xs text-zinc-500">Thank you for sharing your experience.</p>
                  </div>
                ) : (
                  <>
                    {reviewError && <p className="text-xs text-rose-500">{reviewError}</p>}
                    
                    {/* Star selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">Rate Experience</label>
                      <div className="flex gap-2 justify-center py-2 text-gold-400">
                        {[1,2,3,4,5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star className={`h-6 w-6 ${num <= rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">Your Comments</label>
                      <textarea
                        rows="3"
                        placeholder="Share details of your experience with the setup, style, or coordinator support..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="flex-1 py-2.5 border border-gold-400/20 text-zinc-400 text-xs font-semibold rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 btn-gold text-xs font-semibold rounded shadow-luxury"
                      >
                        Publish Review
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
