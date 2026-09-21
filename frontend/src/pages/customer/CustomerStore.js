import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useCustomerCart } from '../../context/CustomerCartContext';

const DOSAGE_FORM_ICONS = {
  Tablet: '💊',
  Capsule: '💊',
  Syrup: '🧪',
  Cream: '🧴',
  Ointment: '🧴',
  Soap: '🧼',
  Other: '📦',
};

export default function CustomerStore() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'otc', 'rx'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [addedItemNotice, setAddedItemNotice] = useState(null);

  const { addToCart, cartItems, openCart, cartCount, subtotal } = useCustomerCart();

  useEffect(() => {
    fetchMedicines();
  }, [selectedType, selectedCategory, sortBy]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/customer/catalog', { params });
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error('Error loading medicine catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filtering
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return medicines;
    const q = searchQuery.toLowerCase().trim();
    return medicines.filter((m) => {
      const name = m.name?.toLowerCase() || '';
      const generic = m.genericName?.toLowerCase() || '';
      const therapeutic = m.therapeuticClass?.toLowerCase() || '';
      const desc = m.description?.toLowerCase() || '';
      return (
        name.includes(q) ||
        generic.includes(q) ||
        therapeutic.includes(q) ||
        desc.includes(q)
      );
    });
  }, [medicines, searchQuery]);

  const handleAddToCart = (med, qty = 1) => {
    addToCart(med, qty);
    setAddedItemNotice(med._id);
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 1800);
  };

  const getCartQuantity = (medId) => {
    const item = cartItems.find((i) => i._id === medId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* High-Class Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-teal-800/30">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span>🛡️</span>
            <span>Licensed Online Pharmacy Store</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Order Genuine Medicines <br className="hidden sm:inline" />
            <span className="text-teal-400">Direct to Your Doorstep</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Purchase everyday Over-The-Counter (OTC) health essentials directly with zero paperwork, or
            order Schedule H prescription medications backed by our verified pharmacist review system.
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-xs">
              <span className="text-emerald-400 text-base">🟢</span>
              <div>
                <p className="font-bold text-white text-[11px]">Direct OTC Buy</p>
                <p className="text-[10px] text-slate-400">No prescription needed</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-xs">
              <span className="text-rose-400 text-base">🔴</span>
              <div>
                <p className="font-bold text-white text-[11px]">Schedule H (Rx)</p>
                <p className="text-[10px] text-slate-400">Doctor Rx verification</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-xs">
              <span className="text-teal-400 text-base">⚡</span>
              <div>
                <p className="font-bold text-white text-[11px]">Free Fast Delivery</p>
                <p className="text-[10px] text-slate-400">Orders over ₹99</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-xs">
              <span className="text-amber-400 text-base">🏷️</span>
              <div>
                <p className="font-bold text-white text-[11px]">5% Online Off</p>
                <p className="text-[10px] text-slate-400">Auto discount on cart</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-4 bottom-2 text-slate-700/20 text-9xl font-black pointer-events-none select-none">
          Rx
        </div>
      </div>

      {/* Prescription Upload Callout Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            📄
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Have a Doctor's Prescription?</h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
              Upload your doctor's handwritten or printed prescription for instant AI reading and licensed pharmacist validation. Once approved, all prescribed medicines are unlocked for purchase!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/customer/upload"
            className="btn-primary text-xs px-4 py-2 rounded-xl font-bold whitespace-nowrap shadow-xs"
          >
            Upload Prescription 📤
          </Link>
          <Link
            to="/customer/prescriptions"
            className="text-xs font-bold px-3 py-2 rounded-xl border border-teal-300 text-teal-800 bg-white hover:bg-teal-50 whitespace-nowrap transition-colors"
          >
            My Prescriptions →
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 sm:p-5 space-y-4 shadow-sm border border-slate-200">
        {/* Top search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by brand name, generic formula (e.g. Paracetamol, Amoxicillin), or therapeutic class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 text-xs sm:text-sm py-2.5 rounded-xl border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm py-2.5 rounded-xl border-slate-300 font-semibold"
            >
              <option value="name">Sort: Alphabetical (A-Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Availability (Highest Stock)</option>
            </select>
          </div>
        </div>

        {/* Drug Classification Selector (OTC vs Prescription Required) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Drug Type:
          </span>

          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Medicines ({medicines.length})
          </button>

          <button
            onClick={() => setSelectedType('otc')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === 'otc'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🟢</span>
            <span>OTC Essentials (No Rx Needed)</span>
          </button>

          <button
            onClick={() => setSelectedType('rx')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === 'rx'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🔴</span>
            <span>Prescription Required (Schedule H)</span>
          </button>
        </div>

        {/* Dosage Form Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Form:
          </span>
          {['All', 'Tablet', 'Capsule', 'Syrup', 'Cream', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'All' ? 'All Forms' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Cart Trigger */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-800">{filteredMedicines.length}</strong> certified medicine{filteredMedicines.length === 1 ? '' : 's'}
        </p>

        {cartCount > 0 && (
          <button
            onClick={openCart}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors"
          >
            <span>🛒 View Cart ({cartCount})</span>
            <span className="text-slate-400">•</span>
            <span className="font-extrabold">₹{subtotal.toFixed(2)}</span>
          </button>
        )}
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-semibold">Loading verified pharmacy inventory...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 space-y-3">
          <span className="text-5xl block">🔍</span>
          <h2 className="font-bold text-slate-700 text-base">No Medicines Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn't find any medications matching "{searchQuery}". Try searching by generic name or changing the category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedCategory('All');
            }}
            className="btn-primary text-xs px-4 py-2 rounded-xl font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMedicines.map((med) => {
            const isRx =
              med.requiresPrescription === true ||
              ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(med.scheduleType);

            const cartQty = getCartQuantity(med._id);
            const isJustAdded = addedItemNotice === med._id;
            const isOutOfStock = med.quantity <= 0;
            const isLowStock = med.quantity > 0 && med.quantity <= 10;
            const formIcon = DOSAGE_FORM_ICONS[med.category] || DOSAGE_FORM_ICONS[med.dosageForm] || '💊';

            return (
              <div
                key={med._id}
                className="card p-5 flex flex-col justify-between hover:shadow-lg hover:border-teal-300 transition-all duration-200 relative group bg-white"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {/* Prescription classification badge */}
                    {isRx ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <span>🔴</span>
                        <span>Rx Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span>🟢</span>
                        <span>OTC Direct</span>
                      </span>
                    )}

                    {/* Dosage form badge */}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80">
                      {formIcon} {med.category || med.dosageForm || 'Medicine'}
                    </span>
                  </div>

                  {/* Medicine Name & Strength */}
                  <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                    {med.name}
                  </h3>

                  {/* Generic composition & therapeutic class */}
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {med.genericName || 'Active Pharmaceutical Formula'}
                  </p>

                  {med.therapeuticClass && (
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {med.therapeuticClass}
                    </span>
                  )}

                  {/* Description / Instructions */}
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {med.description || med.dosageInstructions || 'Quality controlled pharmaceutical formulation.'}
                  </p>

                  {/* Schedule note for Rx items */}
                  {isRx && (
                    <div className="mt-3 p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span className="font-semibold leading-tight">
                        Schedule H: Doctor prescription required for dispensing.
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Stock, Price & Cart Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-slate-900">
                        ₹{med.sellingPrice?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-1">/ unit</span>
                    </div>

                    {/* Stock indicator */}
                    {isOutOfStock ? (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Only {med.quantity} left
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        In Stock ({med.quantity})
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        Currently Unavailable
                      </button>
                    ) : cartQty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(med, 1)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>{isJustAdded ? '✓ Added!' : `In Cart (${cartQty}) +`}</span>
                        </button>
                        <button
                          onClick={openCart}
                          className="btn-primary py-2.5 px-3 rounded-xl font-bold text-xs"
                          title="Open Cart"
                        >
                          🛒
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(med, 1)}
                        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-md transition-all"
                      >
                        <span>🛒</span>
                        <span>{isJustAdded ? '✓ Added to Bag' : 'Add to Cart'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (visible when items are in cart) */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 right-5 z-40 animate-bounce-subtle">
          <button
            onClick={openCart}
            className="btn-primary px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-teal-400/50 hover:scale-105 transition-transform"
          >
            <span className="text-xl">🛒</span>
            <div className="text-left">
              <p className="text-xs font-black leading-tight">{cartCount} Item{cartCount === 1 ? '' : 's'} in Cart</p>
              <p className="text-[11px] text-teal-100 leading-none">Total: ₹{subtotal.toFixed(2)}</p>
            </div>
            <span className="ml-2 text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl">
              Checkout →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
