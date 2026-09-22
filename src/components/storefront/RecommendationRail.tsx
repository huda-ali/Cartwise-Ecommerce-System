import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Compass, ShoppingBag, Eye, Layers } from 'lucide-react';
import { Product } from '../../types';
import { recommendationEngine } from '../../services/recommendationEngine';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/DesignSystem';

export type RecommendationType =
  | 'for-you'
  | 'trending'
  | 'because-you-viewed'
  | 'frequently-bought-together'
  | 'similar'
  | 'recently-viewed';

interface RecommendationRailProps {
  type: RecommendationType;
  referenceProductId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  type,
  referenceProductId,
  title,
  subtitle,
  limit = 4,
  className = '',
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration map for titles and icons
  const config = {
    'for-you': {
      defaultTitle: 'For You',
      defaultSubtitle: 'Curated based on your browsing taste and top-rated studio picks',
      icon: Sparkles,
      iconColor: 'text-indigo-600',
    },
    trending: {
      defaultTitle: 'Trending Now',
      defaultSubtitle: 'Most coveted gear moving fast this week',
      icon: TrendingUp,
      iconColor: 'text-rose-600',
    },
    'because-you-viewed': {
      defaultTitle: 'Because You Viewed This',
      defaultSubtitle: 'Complementary workspace essentials in matching finishes',
      icon: Compass,
      iconColor: 'text-sky-600',
    },
    'frequently-bought-together': {
      defaultTitle: 'Frequently Bought Together',
      defaultSubtitle: 'Commonly paired together by workspace connoisseurs',
      icon: ShoppingBag,
      iconColor: 'text-emerald-600',
    },
    similar: {
      defaultTitle: 'Similar Products',
      defaultSubtitle: 'Alternative designs with comparable craftsmanship and specs',
      icon: Layers,
      iconColor: 'text-amber-600',
    },
    'recently-viewed': {
      defaultTitle: 'Recently Viewed',
      defaultSubtitle: 'Quick access to items you explored in this session',
      icon: Eye,
      iconColor: 'text-slate-600',
    },
  }[type];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadRecommendations = async () => {
      let results: Product[] = [];
      try {
        switch (type) {
          case 'for-you':
            results = await recommendationEngine.getForYou(undefined, limit);
            break;
          case 'trending':
            results = await recommendationEngine.getTrending(limit);
            break;
          case 'because-you-viewed':
            results = await recommendationEngine.getBecauseYouViewed(referenceProductId || 'prod-aura-one', limit);
            break;
          case 'frequently-bought-together':
            results = await recommendationEngine.getFrequentlyBoughtTogether(referenceProductId || 'prod-aura-one', limit);
            break;
          case 'similar':
            results = await recommendationEngine.getSimilarProducts(referenceProductId || 'prod-aura-one', limit);
            break;
          case 'recently-viewed':
            const recentRaw = localStorage.getItem('cartwise_recent');
            const recentIds = recentRaw ? JSON.parse(recentRaw) : [];
            results = await recommendationEngine.getRecentlyViewed(recentIds);
            break;
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        if (isMounted) {
          setProducts(results);
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, [type, referenceProductId, limit]);

  if (!isLoading && products.length === 0) {
    return null;
  }

  const Icon = config.icon;

  return (
    <section className={`py-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              {title || config.defaultTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            {subtitle || config.defaultSubtitle}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
