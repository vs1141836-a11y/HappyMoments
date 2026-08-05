import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../services/api.js';

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [decorations, setDecorations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [theme, setTheme] = useState(searchParams.get('theme') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Trigger API calls when query params change
  useEffect(() => {
    const fetchDecorations = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchParams.get('search'),
          category: searchParams.get('category'),
          theme: searchParams.get('theme'),
          minPrice: searchParams.get('minPrice'),
          maxPrice: searchParams.get('maxPrice'),
          sort: searchParams.get('sort'),
        };
        const { data } = await api.getDecorations(params);
        if (data.success) {
          setDecorations(data.decorations);
        }
      } catch (err) {
        console.error('Error fetching decoration packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDecorations();
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.getCategories('decor');
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterSubmit = (e) => {
    e?.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (theme) newParams.theme = theme;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    if (sort) newParams.sort = sort;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setTheme('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  const themes = ['White & Gold', 'Black & Gold', 'Rose Gold', 'Pastel Pink', 'Lavender', 'Emerald Green', 'Royal Blue'];

  return (
    <div className="bg-[#000814] min-h-screen py-16 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-16">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white font-bold tracking-wider">Decoration Packages</h1>
          <p className="text-gold-400 font-sans tracking-[0.2em] text-xs uppercase">Complete Luxury Stage & Setup Services</p>
          <div className="h-[2px] w-20 bg-gold-400 mx-auto mt-2"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 glassmorphism p-6 rounded-lg border border-gold-400/20 shrink-0 space-y-6">
            <div className="flex justify-between items-center border-b border-gold-400/10 pb-4">
              <span className="font-outfit text-white font-bold tracking-wider flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-gold-400" />
                FILTER OPTIONS
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-gold-400 hover:text-white transition-colors"
              >
                Reset All
              </button>
            </div>

            <form onSubmit={handleFilterSubmit} className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white tracking-widest uppercase">Keyword Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search stage..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-gold-400"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white tracking-widest uppercase">Event Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-gold-400"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Themes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white tracking-widest uppercase">Colour Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-gold-400"
                >
                  <option value="">All Themes</option>
                  {themes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white tracking-widest uppercase">Budget (INR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-gold-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 bg-[#080f1e] border border-gold-400/20 rounded p-2 text-xs text-white text-center focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white tracking-widest uppercase">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-[#080f1e] border border-gold-400/20 rounded p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-gold-400"
                >
                  <option value="newest">Latest Added</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Popularity</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded text-xs font-semibold tracking-widest btn-gold shadow-luxury"
              >
                APPLY FILTER
              </button>
            </form>
          </aside>

          {/* List Area */}
          <div className="flex-grow w-full">
            {loading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-[420px] rounded-lg bg-slate-900 animate-pulse border border-gold-400/5"></div>
                ))}
              </div>
            ) : decorations.length === 0 ? (
              // Empty State
              <div className="text-center py-20 bg-slate-950/20 border border-gold-400/10 rounded-lg">
                <h3 className="font-playfair text-2xl text-white font-semibold mb-2">No Packages Found</h3>
                <p className="text-zinc-500 text-sm mb-6">We couldn't find any decoration packages matching your filter criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black rounded text-xs tracking-wider transition-colors font-outfit"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // Items Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {decorations.map((decor) => (
                  <motion.div
                    key={decor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg overflow-hidden card-luxury group relative flex flex-col bg-slate-950/50"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={api.getImageUrl(decor.images[0])}
                        alt={decor.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <p className="text-[9px] text-gold-400 font-bold uppercase tracking-widest">
                          {decor.category?.name}
                        </p>
                        <h3 className="font-outfit text-white text-base font-bold group-hover:text-gold-400 transition-colors line-clamp-1">
                          {decor.title}
                        </h3>
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                          {decor.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gold-400/5">
                        <span className="text-[10px] text-zinc-500 italic">Theme: {decor.theme}</span>
                        <Link
                          to={`/item/decor/${decor._id}`}
                          className="inline-flex items-center text-xs text-gold-400 font-bold hover:text-white uppercase tracking-wider transition-colors"
                        >
                          Details
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Packages;
