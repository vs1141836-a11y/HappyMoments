import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Search, Plus, Trash2, Edit2, Upload, Loader2, Sparkles } from 'lucide-react';

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [availableColors, setAvailableColors] = useState('');
  const [availableSizes, setAvailableSizes] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('1');
  const [imageUrl, setImageUrl] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchRentalsAndCategories = async () => {
    try {
      const rentRes = await api.getRentals();
      const catRes = await api.getCategories('rental');
      if (rentRes.data.success) setRentals(rentRes.data.rentals);
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0) setCategory(catRes.data.categories[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalsAndCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.uploadImage(formData);
      if (data.success) {
        setImageUrl(data.url);
      }
    } catch (err) {
      setError('Image upload failed. Ensure server is active.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditClick = (rental) => {
    setEditingId(rental._id);
    setTitle(rental.title);
    setDescription(rental.description);
    setCategory(rental.category?._id || rental.category);
    setRentalPrice(rental.rentalPrice);
    setAvailableColors(rental.availableColors.join(', '));
    setAvailableSizes(rental.availableSizes.join(', '));
    setQuantityAvailable(rental.quantityAvailable.toString());
    setImageUrl(rental.images[0] || '');
    setShowForm(true);
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    if (categories.length > 0) setCategory(categories[0]._id);
    setRentalPrice('');
    setAvailableColors('Warm White, White, Pink, Gold');
    setAvailableSizes('Standard Size');
    setQuantityAvailable('5');
    setImageUrl('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!title || !description || !category || !rentalPrice || !imageUrl) {
      setError('Please fill in title, description, category, price, and upload an image.');
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      category,
      rentalPrice: Number(rentalPrice),
      availableColors,
      availableSizes,
      quantityAvailable: Number(quantityAvailable),
      images: [imageUrl],
    };

    try {
      if (editingId) {
        // Update Prop
        const { data } = await api.updateRentalProp(editingId, payload);
        if (data.success) {
          setShowForm(false);
          fetchRentalsAndCategories();
        }
      } else {
        // Create Prop
        const { data } = await api.createRentalProp(payload);
        if (data.success) {
          setShowForm(false);
          fetchRentalsAndCategories();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Delete this rental prop item?')) {
      try {
        const { data } = await api.deleteRentalProp(id);
        if (data.success) {
          setRentals(prev => prev.filter(r => r._id !== id));
        }
      } catch (err) {
        alert('Failed to delete prop.');
      }
    }
  };

  const filtered = rentals.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase())
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
      
      {/* List Header */}
      <div className="flex justify-between items-center bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search rentals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 pl-9 text-xs text-white focus:outline-none"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
        </div>

        <button
          onClick={handleOpenCreateForm}
          className="px-4 py-2.5 btn-gold text-xs font-semibold tracking-wider font-outfit rounded flex items-center gap-1.5 shadow-luxury"
        >
          <Plus className="h-4 w-4" />
          CREATE RENTAL PROP
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(rental => (
          <div key={rental._id} className="bg-[#0a1120] border border-gold-400/10 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg">
            <div className="relative aspect-[4/3] bg-slate-900">
              <img src={rental.images[0]} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-gold-400 border border-gold-400/20">
                ₹{rental.rentalPrice.toLocaleString()} / d
              </div>
            </div>
            
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] text-gold-400 font-bold uppercase tracking-wider">{rental.category?.name || 'Prop'}</span>
                <h4 className="font-outfit text-white text-base font-bold truncate">{rental.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">{rental.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-gold-400/5 pt-3 text-xs">
                <span className="text-[10px] text-zinc-500">Qty: {rental.quantityAvailable} in stock</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(rental)}
                    className="p-1.5 bg-slate-900 border border-gold-400/10 hover:border-gold-400 text-gold-400 rounded transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(rental._id)}
                    className="p-1.5 bg-slate-900 border border-gold-400/10 hover:border-rose-500 text-zinc-400 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Form Modal Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-gold-400/30 rounded-lg max-w-lg w-full overflow-hidden shadow-luxury-lg my-8">
            <div className="p-6 border-b border-gold-400/10">
              <h3 className="font-outfit text-white text-base font-bold tracking-wider flex items-center">
                <Sparkles className="h-4 w-4 text-gold-400 mr-2" />
                {editingId ? 'Edit Rental Prop' : 'Create Rental Prop'}
              </h3>
            </div>

            {error && <div className="p-3 bg-rose-950/20 text-rose-400 text-xs text-center border-b border-gold-400/5">{error}</div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Prop Title</label>
                <input
                  type="text"
                  placeholder="e.g. Neon Light Board 'Happy Birthday'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-zinc-300 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Quantity Stock</label>
                  <input
                    type="number"
                    value={quantityAvailable}
                    onChange={(e) => setQuantityAvailable(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Rental Price / Day (INR)</label>
                  <input
                    type="number"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Prop Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Upload file or enter URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                    />
                    <label className="p-2.5 bg-slate-900 border border-gold-400/20 text-gold-400 rounded cursor-pointer hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0">
                      {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Available Colors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Warm White, Pink, Gold"
                    value={availableColors}
                    onChange={(e) => setAvailableColors(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Available Sizes (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4ft, 3ft, Standard"
                    value={availableSizes}
                    onChange={(e) => setAvailableSizes(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gold-400/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gold-400/20 text-zinc-400 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-2.5 btn-gold font-semibold rounded"
                >
                  {submitting ? 'SUBMITTING...' : editingId ? 'UPDATE PROP' : 'CREATE PROP'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRentals;
