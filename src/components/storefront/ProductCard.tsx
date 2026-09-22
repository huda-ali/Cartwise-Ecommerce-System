import React from 'react';
import { Heart, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from '../common/DesignSystem';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate?: () => void;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, featured }) => {
  const { toggleWishlist, isInWishlist, navigateToProduct, showToast } = useStore();
  const { addToCart } = useCart();

  const isWishlisted = isInWishlist(product.id);

  // Compute stock across variants
  const defaultVariant = product.variants[0] || null;
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 6;

  // Calculate discount percentage
  const currentPrice = defaultVariant ? defaultVariant.price : product.basePrice;
  const comparePrice = defaultVariant?.compareAtPrice || product.compareAtPrice;
  const discountPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!defaultVariant || isOutOfStock) return;
    const res = addToCart(product, defaultVariant, 1);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      navigateToProduct(product.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-200 hover:shadow-lg flex flex-col overflow-hidden cursor-pointer ${
        featured ? 'ring-1 ring-indigo-500/20' : ''
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs">
              Save {discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm">
              Only {totalStock} Left
            </Badge>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-150 z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on hover for desktop */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Quick Add ({defaultVariant?.title ? defaultVariant.title.split('/')[0].trim() : 'Default'})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-indigo-600">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors font-heading mb-2">
            {product.title}
          </h3>

          {product.variants.length > 1 && (
            <div className="text-[11px] text-slate-500 mb-2 font-medium">
              {product.variants.length} option{product.variants.length > 1 ? 's' : ''} available
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
              ${currentPrice.toFixed(2)}
            </span>
            {comparePrice && comparePrice > currentPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          <span className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
