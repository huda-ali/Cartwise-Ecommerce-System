import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Star,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../storefront/ProductCard';
import {
  Breadcrumbs,
  ProductCardSkeleton,
  EmptyState,
  Drawer,
  Button,
} from '../common/DesignSystem';
import { MOCK_CATEGORIES, MOCK_BRANDS } from '../../data/mockData';

export const ProductListing: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    setCurrentView,
  } = useStore();

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandFilter ? [brandFilter] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Extract all distinct attribute options across products
  const availableAttributes = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    products.forEach((p) => {
      p.attributeOptions.forEach((opt) => {
        if (!map[opt.name]) map[opt.name] = new Set();
        opt.values.forEach((v) => map[opt.name].add(v));
      });
    });
    const result: Record<string, string[]> = {};
    Object.keys(map).forEach((k) => {
      result[k] = Array.from(map[k]);
    });
    return result;
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Status filter
      if (p.status !== 'PUBLISHED') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchBrand && !matchDesc && !matchTags) return false;
      }

      // Category
      if (categoryFilter && p.category !== categoryFilter) {
        return false;
      }

      // Brand Filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }

      // Price Range
      const minVariantPrice = Math.min(...p.variants.map((v) => v.price));
      if (minVariantPrice < priceRange[0] || minVariantPrice > priceRange[1]) {
        return false;
      }

      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      // In-stock availability
      if (inStockOnly) {
        const hasStock = p.variants.some((v) => v.stock > 0);
        if (!hasStock) return false;
      }

      // Attribute filters (Color, Size, Switch Type, Wood Finish, etc.)
      for (const [attrName, selectedVals] of Object.entries(selectedAttributes)) {
        if (selectedVals.length > 0) {
          const productHasAttrVal = p.variants.some((v) => {
            const val = v.attributes[attrName];
            return val && selectedVals.includes(val);
          });
          if (!productHasAttrVal) return false;
        }
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    categoryFilter,
    selectedBrands,
    priceRange,
    minRating,
    inStockOnly,
    selectedAttributes,
  ]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.basePrice - b.basePrice);
      case 'price-desc':
        return list.sort((a, b) => b.basePrice - a.basePrice);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'discount':
        return list.sort((a, b) => {
          const discA = a.compareAtPrice ? a.compareAtPrice - a.basePrice : 0;
          const discB = b.compareAtPrice ? b.compareAtPrice - b.basePrice : 0;
          return discB - discA;
        });
      case 'popularity':
      default:
        return list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetAllFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 500]);
    setMinRating(0);
    setInStockOnly(false);
    setSelectedAttributes({});
    setCategoryFilter(null);
    setBrandFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBrandToggle = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
    setCurrentPage(1);
  };

  const handleAttributeToggle = (attrName: string, val: string) => {
    setSelectedAttributes((prev) => {
      const currentVals = prev[attrName] || [];
      const updated = currentVals.includes(val)
        ? currentVals.filter((v) => v !== val)
        : [...currentVals, val];
      return { ...prev, [attrName]: updated };
    });
    setCurrentPage(1);
  };

  // Breadcrumbs config
  const currentCategoryName = MOCK_CATEGORIES.find((c) => c.id === categoryFilter)?.name;

  const breadcrumbItems = [
    { label: 'Home', onClick: () => setCurrentView('home') },
    {
      label: currentCategoryName || 'All Products',
      active: true,
    },
  ];

  // Filter Sidebar UI
  const FilterContent = (
    <div className="space-y-6 text-xs text-slate-700">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 font-heading">Filters</h3>
        <button
          onClick={resetAllFilters}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          Category
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => {
              setCategoryFilter(null);
              setCurrentPage(1);
            }}
            className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
              categoryFilter === null ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <span>All Disciplines</span>
            <span className="text-slate-400 font-normal">({products.length})</span>
          </button>
          {MOCK_CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setCurrentPage(1);
                }}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                  categoryFilter === cat.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-slate-400 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          Design Studio
        </h4>
        <div className="space-y-1.5">
          {MOCK_BRANDS.map((brand) => {
            const isChecked = selectedBrands.includes(brand.id);
            return (
              <label
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={isChecked ? 'font-semibold text-slate-900' : ''}>
                  {brand.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          Stock Status
        </h4>
        <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-900">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setCurrentPage(1);
            }}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>In-Stock Ready to Ship</span>
        </label>
      </div>

      {/* Price Slider */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Price Cap
          </h4>
          <span className="font-mono font-bold text-slate-900">${priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="25"
          value={priceRange[1]}
          onChange={(e) => {
            setPriceRange([priceRange[0], Number(e.target.value)]);
            setCurrentPage(1);
          }}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>$50</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((r) => (
            <button
              key={r}
              onClick={() => {
                setMinRating(minRating === r ? 0 : r);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                minRating === r ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-100'
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(r) ? 'fill-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-600">&amp; up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Product Attributes (Color, Material, Switch Type, etc.) */}
      {Object.entries(availableAttributes).map(([attrName, values]) => (
        <div key={attrName} className="space-y-2 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            {attrName}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {values.map((v) => {
              const isSelected = (selectedAttributes[attrName] || []).includes(v);
              return (
                <button
                  key={v}
                  onClick={() => handleAttributeToggle(attrName, v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Breadcrumbs & Title */}
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-heading">
              {currentCategoryName || (searchQuery ? `Search results for "${searchQuery}"` : 'Studio Catalog')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredProducts.length} precision products designed for enduring workflows
            </p>
          </div>

          {/* Controls: Mobile Filter Button & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="relative flex items-center">
              <span className="text-xs text-slate-400 mr-2 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedBrands.length > 0 ||
        categoryFilter ||
        searchQuery ||
        inStockOnly ||
        minRating > 0 ||
        Object.values(selectedAttributes).some((v) => v.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium">Active:</span>

          {categoryFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-200">
              {currentCategoryName}
              <button onClick={() => setCategoryFilter(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-full font-medium border border-slate-200">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedBrands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-full font-medium border border-slate-200"
            >
              {b}
              <button onClick={() => handleBrandToggle(b)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
              In Stock
              <button onClick={() => setInStockOnly(false)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit sticky top-24">
          {FilterContent}
        </aside>

        {/* Mobile Filter Drawer */}
        <Drawer
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="Filter Catalog"
          position="left"
        >
          {FilterContent}
        </Drawer>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              title="No products matched your criteria"
              description="Try adjusting your price range, clearing brand selections, or searching for broader terms like 'audio' or 'walnut'."
              actionText="Reset Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                    {filteredProducts.length} results
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                            currentPage === pageNum
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
