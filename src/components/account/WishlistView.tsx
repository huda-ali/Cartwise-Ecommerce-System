import React from 'react';
import { Heart, ShoppingBag, Trash2, Share2, Bell, Check, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { EmptyState, Button } from '../common/DesignSystem';

export const WishlistView: React.FC = () => {
  const { wishlist, products, toggleWishlist, setCurrentView, navigateToProduct, showToast } = useStore();
  const { addToCart } = useCart();

  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is typeof products[0] => !!p);

  const handleMoveToCart = (product: any) => {
    const firstVariant = product.variants.find((v: any) => v.isAvailable && v.stock > 0) || product.variants[0];
    const res = addToCart(product, firstVariant, 1);
    if (res.success) {
      toggleWishlist(product.id);
      showToast(`Moved ${product.title} to your shopping cart!`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Wishlist link copied to clipboard!', 'success');
    } else {
      showToast('Sharing link prepared!', 'info');
    }
  };

  const handleSetPriceDropAlert = (productTitle: string) => {
    showToast(`Price drop notifications enabled for "${productTitle}"!`, 'success');
  };

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your studio wishlist is empty"
        description="Save your favorite acoustic headphones, monitor risers, and desk trays to track availability and price changes."
        actionText="Discover Studio Essentials"
        onAction={() => setCurrentView('catalog')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlist.length} item{wishlist.length === 1 ? '' : 's'} curated for future acquisition
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareWishlist}
          icon={Share2}
        >
          Share Curated List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProducts.map((product) => {
          const defaultVariant = product.variants[0];
          const hasStock = product.variants.some((v) => v.isAvailable && v.stock > 0);

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => navigateToProduct(product.id)}
                  className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {product.brand}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasStock
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {hasStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigateToProduct(product.id)}
                    className="font-bold text-sm text-slate-900 font-heading hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {product.title}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900 font-heading">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 pt-0 space-y-2 border-t border-slate-100 mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => handleMoveToCart(product)}
                  disabled={!hasStock}
                  icon={ShoppingBag}
                >
                  {hasStock ? 'Move to Cart' : 'Currently Unavailable'}
                </Button>

                <button
                  onClick={() => handleSetPriceDropAlert(product.title)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify on Price Drop</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
