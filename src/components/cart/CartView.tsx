import React, { useState } from 'react';
import {
  Trash2,
  Bookmark,
  Heart,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Tag,
  X,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Button, EmptyState } from '../common/DesignSystem';

interface CartViewProps {
  onRequireAuth: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ onRequireAuth }) => {
  const {
    cartItems,
    savedForLater,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCartFromSaved,
    removeSavedForLater,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    clearCartItemWarnings,
  } = useCart();

  const { setCurrentView, navigateToProduct, toggleWishlist, showToast } = useStore();
  const { isGuest } = useAuth();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const success = applyCoupon(couponCodeInput);
    if (success) {
      showToast(`Coupon "${couponCodeInput.toUpperCase()}" applied!`, 'success');
      setCouponCodeInput('');
    }
  };

  const handleCheckoutClick = () => {
    if (isGuest) {
      showToast('Please sign in or create an account to proceed to checkout.', 'info');
      onRequireAuth();
      return;
    }
    setCurrentView('checkout');
  };

  if (cartItems.length === 0 && savedForLater.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your shopping cart is empty"
        description="Explore our acoustic audio hardware, solid walnut workspace risers, and custom keyboards to assemble your setup."
        actionText="Explore Studio Catalog"
        onAction={() => setCurrentView('catalog')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 font-heading">
          Review Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {cartItems.length} unique item{cartItems.length === 1 ? '' : 's'} in active session
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">No active items in cart.</p>
              <button
                onClick={() => setCurrentView('catalog')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Browse catalog &rarr;
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {cartItems.map((item) => {
                const isOutOfStock = !item.isAvailable || item.maxStock <= 0;
                const isLowStock = !isOutOfStock && item.maxStock <= 4;

                return (
                  <div key={item.id} className="p-5 sm:p-6 space-y-3 transition-colors">
                    {/* Item Warning Banners (Price Change, Low Stock, Unavailable) */}
                    {item.priceChangedNote && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>{item.priceChangedNote}</span>
                        </div>
                        <button
                          onClick={() => clearCartItemWarnings(item.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>This variant is now out of stock. Please remove to continue.</span>
                      </div>
                    )}

                    <div className="flex gap-4 sm:gap-6">
                      {/* Thumbnail */}
                      <div
                        onClick={() => navigateToProduct(item.productId)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                {item.brand}
                              </span>
                              <h3
                                onClick={() => navigateToProduct(item.productId)}
                                className="font-bold text-sm sm:text-base text-slate-900 font-heading hover:text-indigo-600 transition-colors cursor-pointer"
                              >
                                {item.productTitle}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Variant: <span className="font-semibold text-slate-700">{item.variantTitle}</span>
                              </p>
                            </div>

                            <span className="text-base font-extrabold text-slate-900 font-heading">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {isLowStock && (
                            <p className="text-[11px] text-amber-600 font-medium mt-1">
                              Only {item.maxStock} remaining in stock
                            </p>
                          )}
                        </div>

                        {/* Controls: Quantity + Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold disabled:opacity-30"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>

                          {/* Secondary actions: Save for later, Wishlist, Remove */}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <button
                              onClick={() => {
                                saveForLater(item.id);
                                showToast('Moved to Saved for Later', 'info');
                              }}
                              className="hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save for later</span>
                            </button>

                            <button
                              onClick={() => toggleWishlist(item.productId)}
                              className="hover:text-rose-600 flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Wishlist</span>
                            </button>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved for Later Section */}
          {savedForLater.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Saved for Later ({savedForLater.length})
              </h2>
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {savedForLater.map((sItem) => (
                  <div key={sItem.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={sItem.productImage}
                        alt={sItem.productTitle}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {sItem.productTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500">{sItem.variantTitle}</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          ${sItem.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToCartFromSaved(sItem.id)}
                      >
                        Move to Cart
                      </Button>
                      <button
                        onClick={() => removeSavedForLater(sItem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 font-heading pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Coupon Code Entry */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 uppercase"
                />
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </div>

              {couponError && (
                <p className="text-xs text-rose-600 font-medium">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">{appliedCoupon.code}</span>
                    <span>
                      (-{appliedCoupon.discountType === 'PERCENT' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`})
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>

            {/* Pricing Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 font-mono">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8.25%)</span>
                <span className="font-semibold text-slate-900 font-mono">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200 font-heading">
                <span>Grand Total</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={handleCheckoutClick}
                disabled={cartItems.length === 0}
                icon={ArrowRight}
                iconPosition="right"
              >
                {isGuest ? 'Sign in to Checkout' : 'Proceed to Checkout'}
              </Button>

              {isGuest && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200/60 text-center">
                  Guest checkout disabled in MVP. Your cart automatically merges upon login!
                </p>
              )}
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Bank-grade 256-bit encrypted transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
