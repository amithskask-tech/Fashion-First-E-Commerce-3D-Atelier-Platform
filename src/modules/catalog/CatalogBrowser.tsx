import React, { useState, useMemo } from 'react';
import {
  Product,
  StandardSizeCode
} from '../../types';
import { formatCurrency } from '../pricing/pricingEngine';
import {
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  Search,
  Check,
  MapPin,
  Tag,
  ArrowRight
} from 'lucide-react';

interface CatalogBrowserProps {
  products: Product[];
  onAddToCart: (product: Product, sizeCode: StandardSizeCode) => void;
  onCustomize3D: (product: Product) => void;
}

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
  products,
  onAddToCart,
  onCustomize3D
}) => {
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, StandardSizeCode>>({});
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);

  // Extract unique regions
  const regions = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.region).filter(Boolean))) as string[];
    return ['all', ...list];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedOccasion !== 'all' && p.occasion !== selectedOccasion) return false;
      if (selectedRegion !== 'all' && p.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesFabric = p.fabricName.toLowerCase().includes(q);
        const matchesRegion = p.region?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesFabric && !matchesRegion) return false;
      }
      return true;
    });
  }, [products, selectedGender, selectedCategory, selectedOccasion, selectedRegion, searchQuery]);

  const handleSelectSize = (productId: string, size: StandardSizeCode) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product) => {
    const defaultSize = (product.variants[0]?.sizeCode as StandardSizeCode) || 'M';
    const chosenSize = selectedSizes[product.id] || defaultSize;
    onAddToCart(product, chosenSize);

    // Trigger brief micro-animation
    setAddedAnimation(product.id);
    setTimeout(() => setAddedAnimation(null), 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner with Heritage Aesthetics */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/80 border border-amber-500/20 shadow-2xl p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INDIAN HAUTE COUTURE &amp; BESPOKE TAILORING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
            Artisanal Heritage, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              Tailored to Your Measure.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Discover authentic Kerala Kasavu handlooms, royal Chanderi raw silks, and Lucknowi Chikankari embroidery. Shop ready-made off-the-rack or customize in 3D made-to-measure.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        {/* Search & Main Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kurtas, Nehru Jackets, Kasavu, Silk..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition"
            />
          </div>

          {/* Gender Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 self-stretch md:self-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Wear' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGender(g.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedGender === g.id
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Category, Occasion, and Region Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            <option value="kurtas">Kurtas &amp; Sets</option>
            <option value="nehru_jackets">Nehru Jackets</option>
            <option value="dhotis_mundu">Dhotis &amp; Mundu</option>
            <option value="western">Western Shirts</option>
          </select>

          {/* Occasion Filter */}
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Occasions</option>
            <option value="festive">Festive &amp; Celebrations</option>
            <option value="wedding">Weddings &amp; Royal</option>
            <option value="ceremony">Ceremony &amp; Rituals</option>
            <option value="office">Everyday &amp; Office</option>
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Regions of India</option>
            {regions.filter((r) => r !== 'all').map((r) => (
              <option key={r} value={r}>
                {r} Heritage
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedRegion !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedOccasion('all');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 underline ml-auto text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const selectedSize = selectedSizes[product.id] || (product.variants[0]?.sizeCode as StandardSizeCode) || 'M';
          const isJustAdded = addedAnimation === product.id;

          return (
            <div
              key={product.id}
              className="group bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition flex flex-col justify-between"
            >
              {/* Product Top Visual Header */}
              <div className="p-6 space-y-4">
                {/* Region & Occasion Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium tracking-wide">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {product.region || 'Indian Heritage'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] capitalize">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {product.occasion}
                  </span>
                </div>

                {/* Garment Swatch & Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-inner"
                      style={{ backgroundColor: product.colorHex }}
                      title={product.colorName}
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      {product.fabricName}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-100 font-serif">
                    {formatCurrency(product.pricePaise, 'INR')}
                  </span>
                  <span className="text-xs text-slate-400">
                    (inclusive of GST)
                  </span>
                </div>

                {/* Size Selection (Ready-Made) */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Select Ready-to-Wear Size:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.variants.map((v) => {
                      const isSelected = selectedSize === v.sizeCode;
                      const isOutOfStock = v.stockQuantity <= 0;
                      return (
                        <button
                          key={v.id}
                          disabled={isOutOfStock}
                          onClick={() => handleSelectSize(product.id, v.sizeCode as StandardSizeCode)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                              : isOutOfStock
                              ? 'bg-slate-950 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {v.sizeCode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                {/* 1. Quick Add to Cart (Ready-Made) */}
                <button
                  onClick={() => handleQuickAdd(product)}
                  className={`flex-1 w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Ready-Made ({selectedSize})</span>
                    </>
                  )}
                </button>

                {/* 2. Customize in 3D (Made-to-Measure) */}
                {product.isCustomizable && (
                  <button
                    onClick={() => onCustomize3D(product)}
                    className="flex-1 w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition group/btn"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>3D Customizer</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950 transition group-hover/btn:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm">
            No Indian garments match your selected filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedGender('all');
              setSelectedCategory('all');
              setSelectedOccasion('all');
              setSelectedRegion('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-xl text-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
