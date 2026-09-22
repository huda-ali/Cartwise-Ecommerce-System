import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  BellRing,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductVariant, UserReview } from '../../types';
import { Badge, Button, Breadcrumbs, Modal } from '../common/DesignSystem';
import { RecommendationRail } from '../storefront/RecommendationRail';

export const ProductDetails: React.FC = () => {
  const {
    selectedProductId,
    products,
    reviews,
    addReview,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    navigateToCategory,
    showToast,
  } = useStore();

  const { addToCart } = useCart();
  const { user } = useAuth();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Active Main Image
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Selected Attributes for Variant Combination
  // Initialize with the first variant's attributes
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    return product.variants[0]?.attributes || {};
  });

  const [quantity, setQuantity] = useState(1);
  const [backInStockModalOpen, setBackInStockModalOpen] = useState(false);
  const [backInStockEmail, setBackInStockEmail] = useState(user?.email || '');

  // Review Form Modal
  const [writeReviewModalOpen, setWriteReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Reset selected variant & images when product changes
  useEffect(() => {
    if (product) {
      setSelectedAttributes(product.variants[0]?.attributes || {});
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product.id]);

  // Find matching variant based on currently selected attributes
  const currentVariant: ProductVariant | undefined = useMemo(() => {
    return product.variants.find((v) => {
      return Object.entries(selectedAttributes).every(
        ([key, value]) => v.attributes[key] === value
      );
    });
  }, [product, selectedAttributes]);

  // Check if an attribute option value is valid/available with other currently selected attributes
  const isOptionAvailable = (attributeName: string, optionValue: string): boolean => {
    const testAttributes = { ...selectedAttributes, [attributeName]: optionValue };
    const match = product.variants.find((v) => {
      return Object.entries(testAttributes).every(
        ([key, val]) => v.attributes[key] === val
      );
    });
    // Available if variant exists AND has stock > 0
    return Boolean(match && match.isAvailable && match.stock > 0);
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeName]: value }));
  };

  const isWishlisted = isInWishlist(product.id);

  // Stock status logic
  const isOutOfStock = !currentVariant || currentVariant.stock <= 0 || !currentVariant.isAvailable;
  const isLowStock = !isOutOfStock && currentVariant.stock <= (currentVariant.lowStockThreshold || 5);

  const price = currentVariant ? currentVariant.price : product.basePrice;
  const compareAtPrice = currentVariant?.compareAtPrice || product.compareAtPrice;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;
    const res = addToCart(product, currentVariant, quantity);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleNotifyBackInStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backInStockEmail) return;
    setBackInStockModalOpen(false);
    showToast(`We will alert you at ${backInStockEmail} when this variant is restocked!`, 'success');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    addReview({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      userId: user?.id || 'guest',
      userName: user?.name || 'Verified Buyer',
      userAvatar: user?.avatar,
      verifiedPurchase: true,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });

    setWriteReviewModalOpen(false);
    setReviewTitle('');
    setReviewComment('');
  };

  // Product reviews
  const productReviews = reviews.filter(
    (r) => r.productId === product.id && (r.status === 'APPROVED' || r.userId === user?.id)
  );

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', onClick: () => setCurrentView('home') },
    { label: 'Catalog', onClick: () => setCurrentView('catalog') },
    {
      label: product.brand,
      onClick: () => {
        navigateToCategory(product.category);
      },
    },
    { label: product.title, active: true },
  ];

  return (
    <div className="space-y-12 pb-16">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Main Product Stage: 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Interactive Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {discountPercent && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-lg shadow-sm">
                Save {discountPercent}%
              </span>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} view ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Value Props Strip */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Free Carbon-Neutral Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>30-Day Studio Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>2-Year Manufacturer Warranty</span>
            </div>
          </div>
        </div>

        {/* Right: Product Purchase Configurator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.brand}
              </span>
              <span className="text-xs font-mono text-slate-400">
                SKU: {currentVariant?.sku || 'SKU-PENDING'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 font-heading">
              {product.title}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400'
                        : i < product.rating
                        ? 'fill-amber-200'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Pricing & Stock Indicator */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-heading">
                ${price.toFixed(2)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-base text-slate-400 line-through">
                  ${compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Variant Currently Sold Out</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Low Stock: Only {currentVariant?.stock} units remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <Check className="w-4 h-4" />
                  <span>In Stock — Dispatches within 24 hours</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Variant Selectors (Attributes like Color, Size, Storage, Switch Type) */}
          <div className="space-y-4 pt-2">
            {product.attributeOptions.map((opt) => (
              <div key={opt.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{opt.name}</span>
                  <span className="text-slate-500 font-medium">
                    Selected: {selectedAttributes[opt.name]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selectedAttributes[opt.name] === val;
                    const available = isOptionAvailable(opt.name, val);

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAttributeChange(opt.name, val)}
                        disabled={!available}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900 ring-offset-1'
                            : available
                            ? 'bg-white border border-slate-200 text-slate-800 hover:border-slate-400'
                            : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed line-through opacity-60'
                        }`}
                        title={!available ? 'Combination unavailable or out of stock' : val}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quantity and Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40 font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(currentVariant?.stock || 1, q + 1))
                  }
                  disabled={isOutOfStock || quantity >= (currentVariant?.stock || 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40 font-bold"
                >
                  +
                </button>
              </div>

              {isOutOfStock ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 text-xs"
                  onClick={() => setBackInStockModalOpen(true)}
                  icon={BellRing}
                >
                  Notify When Available
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 text-sm font-bold"
                  onClick={handleAddToCart}
                  icon={ShoppingBag}
                >
                  Add to Cart &middot; ${(price * quantity).toFixed(2)}
                </Button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Taxes calculated at checkout. Need help? Ask the AI Assistant below.
            </p>
          </div>
        </div>
      </div>

      {/* Specifications & Technical Details */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
          Technical Specifications &amp; Build Quality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(product.specifications).map(([key, val]) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-baseline justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100"
            >
              <span className="text-xs font-bold text-slate-700">{key}</span>
              <span className="text-xs text-slate-500 font-medium sm:text-right">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews & Rating Histogram */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Verified Owner Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real feedback from acoustic engineers, developers, and workspace curators
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWriteReviewModalOpen(true)}
          >
            Write a Review
          </Button>
        </div>

        {/* Rating Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center md:text-left space-y-2">
            <span className="text-5xl font-black text-slate-900 font-heading">
              {product.rating.toFixed(1)}
            </span>
            <div className="flex justify-center md:justify-start text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">Based on {product.reviewCount} customer reviews</p>
          </div>

          {/* Histogram Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = product.ratingDistribution[star] || 0;
              const percent = Math.round((count / product.reviewCount) * 100);
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-600 font-medium">{star} stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          {productReviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No reviews for this product yet.</p>
          ) : (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommendation Rails */}
      <RecommendationRail
        type="frequently-bought-together"
        referenceProductId={product.id}
        title="Frequently Bought Together"
        subtitle="Designed to harmoniously dock and integrate on your workstation"
        limit={3}
      />

      <RecommendationRail
        type="because-you-viewed"
        referenceProductId={product.id}
        title="Because You Viewed This"
        subtitle="Alternative setups sharing similar finish and acoustic pedigree"
        limit={4}
      />

      <RecommendationRail
        type="recently-viewed"
        title="Recently Explored"
        limit={4}
      />

      {/* Back in Stock Modal */}
      <Modal
        isOpen={backInStockModalOpen}
        onClose={() => setBackInStockModalOpen(false)}
        title="Restock Alert Notification"
        description="Receive an instant email when this specific variant becomes available."
      >
        <form onSubmit={handleNotifyBackInStock} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900">{product.title}</span>
            <p className="text-slate-500 mt-0.5">Variant: {currentVariant?.title}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={backInStockEmail}
              onChange={(e) => setBackInStockEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBackInStockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Notification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={writeReviewModalOpen}
        onClose={() => setWriteReviewModalOpen(false)}
        title="Write a Customer Review"
        description="Share your ergonomic or acoustic experience with the community."
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Exceptional sound separation and build"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Review</label>
            <textarea
              rows={4}
              required
              placeholder="Describe build materials, comfort, acoustic profile or desk ergonomics..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            Reviews undergo automated community guidelines inspection before appearing publicly.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWriteReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
