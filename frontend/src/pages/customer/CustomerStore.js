import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  Check,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useCustomerCart } from '../../context/CustomerCartContext';
import TiltCard from '../../components/common/TiltCard';
import SoundFX from '../../utils/SoundFX';

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
    SoundFX.playDropChime();
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
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Cyber-Emerald Hero Banner */}
      <TiltCard
        maxTilt={7}
        className="rounded-3xl bg-gradient-to-r from-void-950 via-void-900 to-void-850 p-6 sm:p-10 text-white shadow-glass-lg border border-cyber-emerald/30 relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-glow-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Licensed Online Pharmacy Direct Dispensary</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Order Certified Medications <br className="hidden sm:inline" />
            <span className="text-cyber-emerald">Direct to Your Doorstep</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Purchase everyday Over-The-Counter (OTC) fever, pain, and health essentials directly with 0 paperwork, or select Schedule H drugs with your verified doctor's prescription.
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 p-2.5 rounded-xl backdrop-blur-md">
              <span className="text-cyber-emerald text-base">🟢</span>
              <div>
                <p className="font-bold text-white text-[11px]">Direct OTC Buy</p>
                <p className="text-[10px] text-slate-400">0 prescription needed</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 p-2.5 rounded-xl backdrop-blur-md">
              <span className="text-rose-400 text-base">🔴</span>
              <div>
                <p className="font-bold text-white text-[11px]">Schedule H (Rx)</p>
                <p className="text-[10px] text-slate-400">Doctor Rx verified</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 p-2.5 rounded-xl backdrop-blur-md">
              <span className="text-cyber-cyan text-base">⚡</span>
              <div>
                <p className="font-bold text-white text-[11px]">Cold Chain Delivery</p>
                <p className="text-[10px] text-slate-400">Safe temperature sync</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 p-2.5 rounded-xl backdrop-blur-md">
              <span className="text-amber-400 text-base">🏷️</span>
              <div>
                <p className="font-bold text-white text-[11px]">Auto Discount</p>
                <p className="text-[10px] text-slate-400">Applied at checkout</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-2 text-cyber-emerald/5 text-9xl font-black pointer-events-none select-none">
          Rx
        </div>
      </TiltCard>

      {/* Prescription Upload Callout */}
      <div className="cyber-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyber-cyan/30 bg-void-900/80">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center text-xl shrink-0 shadow-glow-cyan">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Have a Doctor's Prescription?</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
              Upload your handwritten or printed note for dynamic laser OCR scanning and licensed pharmacist validation. Once approved, all prescribed medicines are unlocked for checkout!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/customer/upload"
            onClick={() => SoundFX.playClick()}
            className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Laser Rx Scan</span>
          </Link>
          <Link
            to="/customer/prescriptions"
            onClick={() => SoundFX.playClick()}
            className="btn-secondary text-xs px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap"
          >
            My Prescriptions →
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card p-5 space-y-4">
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand name, generic formulation (e.g. Paracetamol, Amoxicillin), or therapeutic class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 text-xs sm:text-sm py-2.5 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-60">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm py-2.5 rounded-xl font-semibold"
            >
              <option value="name">Sort: Alphabetical (A-Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Availability (Highest Stock)</option>
            </select>
          </div>
        </div>

        {/* Drug Classification Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
            Drug Type:
          </span>

          <button
            onClick={() => {
              SoundFX.playClick();
              setSelectedType('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'all'
                ? 'bg-cyber-emerald text-void-950 shadow-glow-emerald font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Medicines ({medicines.length})
          </button>

          <button
            onClick={() => {
              SoundFX.playClick();
              setSelectedType('otc');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === 'otc'
                ? 'bg-cyber-emerald text-void-950 shadow-glow-emerald font-black'
                : 'bg-emerald-950/60 text-cyber-emerald border border-cyber-emerald/30 hover:bg-emerald-900/40'
            }`}
          >
            <span>🟢</span>
            <span>OTC Essentials (No Rx Needed)</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playClick();
              setSelectedType('rx');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === 'rx'
                ? 'bg-rose-600 text-white shadow-glow-crimson font-black'
                : 'bg-rose-950/60 text-rose-400 border border-rose-500/30 hover:bg-rose-900/40'
            }`}
          >
            <span>🔴</span>
            <span>Prescription Required (Schedule H)</span>
          </button>
        </div>

        {/* Dosage Form Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
            Form:
          </span>
          {['All', 'Tablet', 'Capsule', 'Syrup', 'Cream', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                SoundFX.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyber-cyan text-void-950 font-black shadow-glow-cyan'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Forms' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Cart Trigger */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-mono font-semibold text-slate-400">
          Certified Catalog: <strong className="text-white font-mono">{filteredMedicines.length}</strong> formulation{filteredMedicines.length === 1 ? '' : 's'}
        </p>

        {cartCount > 0 && (
          <button
            onClick={() => {
              SoundFX.playClick();
              openCart();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/40 text-cyber-emerald text-xs font-bold hover:bg-cyber-emerald/20 transition-all shadow-glow-emerald"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Bag ({cartCount})</span>
            <span className="text-slate-600">•</span>
            <span className="font-extrabold font-mono">₹{subtotal.toFixed(2)}</span>
          </button>
        )}
      </div>

      {/* Medicine 3D Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyber-emerald border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Querying certified dispensary node network...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="cyber-card p-12 text-center text-slate-400 space-y-3">
          <span className="text-5xl block">🔍</span>
          <h2 className="font-black text-white text-base">No Medications Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No active formulations matching "{searchQuery}". Try searching by generic active molecule.
          </p>
          <button
            onClick={() => {
              SoundFX.playClick();
              setSearchQuery('');
              setSelectedType('all');
              setSelectedCategory('All');
            }}
            className="btn-primary text-xs px-4 py-2 rounded-xl font-bold"
          >
            Reset Catalog Filters
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
              <TiltCard
                key={med._id}
                maxTilt={8}
                className="cyber-card p-5 flex flex-col justify-between hover:border-cyber-emerald/60 transition-all duration-200 relative group bg-void-900/90"
              >
                <div>
                  {/* Card Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {isRx ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40">
                        <span>🔴</span>
                        <span>Rx Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-950/80 text-cyber-emerald border border-cyber-emerald/40 shadow-glow-emerald">
                        <span>🟢</span>
                        <span>OTC Direct</span>
                      </span>
                    )}

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                      {formIcon} {med.category || med.dosageForm || 'Medicine'}
                    </span>
                  </div>

                  {/* Medicine Name */}
                  <h3 className="text-base font-black text-white leading-snug group-hover:text-cyber-emerald transition-colors">
                    {med.name}
                  </h3>

                  {/* Generic formula */}
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {med.genericName || 'Active Molecule Formula'}
                  </p>

                  {med.therapeuticClass && (
                    <span className="inline-block mt-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded-md border border-cyber-cyan/30">
                      {med.therapeuticClass}
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {med.description || med.dosageInstructions || 'Quality controlled pharmaceutical formulation.'}
                  </p>

                  {/* Schedule Note */}
                  {isRx && (
                    <div className="mt-3 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-semibold leading-tight">
                        Schedule H: Doctor prescription required.
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: Price, Stock & Cart */}
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black text-white font-mono">
                        ₹{med.sellingPrice?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">/ unit</span>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/30">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {med.quantity} left
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-cyber-emerald bg-emerald-950/80 px-2 py-0.5 rounded-full border border-cyber-emerald/30 shadow-glow-emerald">
                        In Stock ({med.quantity})
                      </span>
                    )}
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      >
                        Unavailable
                      </button>
                    ) : cartQty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(med, 1)}
                          className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-cyber-emerald/15 border border-cyber-emerald text-cyber-emerald hover:bg-cyber-emerald/25 transition-all flex items-center justify-center gap-1.5 shadow-glow-emerald"
                        >
                          <span>{isJustAdded ? '✓ Added!' : `In Cart (${cartQty}) +`}</span>
                        </button>
                        <button
                          onClick={() => {
                            SoundFX.playClick();
                            openCart();
                          }}
                          className="btn-primary py-2.5 px-3 rounded-xl font-bold text-xs"
                          title="Open Cart"
                        >
                          🛒
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(med, 1)}
                        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-emerald hover:scale-102 transition-all"
                      >
                        <span>🛒</span>
                        <span>{isJustAdded ? '✓ Added to Bag' : 'Add to Cart'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Floating Checkout Pill */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 right-6 z-40 animate-slide-up">
          <button
            onClick={() => {
              SoundFX.playClick();
              openCart();
            }}
            className="btn-primary px-5 py-3.5 rounded-2xl shadow-glass-lg shadow-cyber-emerald/30 flex items-center gap-3 border border-cyber-emerald/60 hover:scale-105 transition-transform"
          >
            <span className="text-xl">🛒</span>
            <div className="text-left">
              <p className="text-xs font-black leading-tight text-void-950">
                {cartCount} Item{cartCount === 1 ? '' : 's'} in Bag
              </p>
              <p className="text-[11px] text-void-950/80 font-mono font-bold leading-none">
                Total: ₹{subtotal.toFixed(2)}
              </p>
            </div>
            <span className="ml-2 text-xs font-black bg-void-950 text-cyber-emerald px-2.5 py-1 rounded-xl shadow-md">
              Checkout →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
