import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Plus, Trash2, Tag } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Category states
  const [name, setName] = useState('');
  const [type, setType] = useState('decor');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.getCategories();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!name.trim()) {
      setError('Please specify category name.');
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await api.createCategoryAdmin({ name, type, description });
      if (data.success) {
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        const { data } = await api.deleteCategoryAdmin(id);
        if (data.success) {
          setCategories(prev => prev.filter(c => c._id !== id));
        }
      } catch (err) {
        alert('Failed to delete category.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#070b13]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#070b13] text-zinc-300 font-sans text-xs">
      
      {/* Create Category Form Panel */}
      <div className="lg:col-span-1 bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4 h-fit">
        <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2 flex items-center">
          <Tag className="h-4 w-4 text-gold-400 mr-2" />
          CREATE NEW CATEGORY
        </h3>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Neon Signs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Classification Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-zinc-300 focus:outline-none"
            >
              <option value="decor">Decorations Package (Service)</option>
              <option value="rental">Prop Rental (Item Hire)</option>
            </select>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 btn-gold font-semibold tracking-widest rounded"
          >
            {submitting ? 'CREATING...' : 'ADD CATEGORY'}
          </button>
        </form>
      </div>

      {/* Categories list table */}
      <div className="lg:col-span-2 bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg space-y-4">
        <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2">
          Categories Inventory ({categories.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-400">
            <thead>
              <tr className="border-b border-gold-400/10 text-white font-semibold">
                <th className="py-2.5">Category Name</th>
                <th className="py-2.5">Type slug</th>
                <th className="py-2.5">Category description</th>
                <th className="py-2.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/5">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 font-semibold text-white">{c.name}</td>
                  <td className="py-3 font-mono text-gold-400">{c.type}</td>
                  <td className="py-3 max-w-xs truncate text-zinc-500">{c.description || 'No description'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1.5 hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminCategories;
