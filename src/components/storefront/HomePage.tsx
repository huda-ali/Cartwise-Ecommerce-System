import React from 'react';
import { ArrowRight, Sparkles, Shield, Compass, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MOCK_CATEGORIES } from '../../data/mockData';
import { RecommendationRail } from './RecommendationRail';
import { Button } from '../common/DesignSystem';

export const HomePage: React.FC = () => {
  const { setCurrentView, navigateToCategory, navigateToProduct } = useStore();

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-radial-at-tr from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Studio Precision Collection 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] font-heading">
              Acoustic Mastery &amp; Ergonomic Workspace Tools.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Cartwise engineers a cohesive ecosystem of solid walnut desk architecture, custom gasket mechanical keyboards, and beryllium acoustic audio transducers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setCurrentView('catalog')}
                icon={ArrowRight}
                iconPosition="right"
              >
                Explore Catalog
              </Button>
              <button
                onClick={() => navigateToProduct('prod-aura-one')}
                className="px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-white text-sm font-semibold hover:bg-slate-900 transition-all cursor-pointer"
              >
                View Aura One ANC
              </button>
            </div>

            {/* Micro Stats */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="block text-2xl font-black text-white font-heading">40mm</span>
                <span className="text-xs text-slate-400">Beryllium Drivers</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-heading">100%</span>
                <span className="text-xs text-slate-400">American Walnut</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-heading">30-Day</span>
                <span className="text-xs text-slate-400">Studio Trial</span>
              </div>
            </div>
          </div>

          {/* Hero Featured Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md aspect-square rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group cursor-pointer"
                 onClick={() => navigateToProduct('prod-aura-one')}>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                alt="Aura One Wireless ANC Headphones"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Featured Release
                </span>
                <h3 className="text-lg font-bold text-white font-heading">
                  Aura One Wireless ANC
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">$349.00 &middot; 38h Battery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Browse by Discipline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Hand-picked categories tailored for deep focus and precision workflows
            </p>
          </div>
          <button
            onClick={() => setCurrentView('catalog')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            All Categories &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateToCategory(cat.id)}
              className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-400 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="text-sm font-bold font-heading">{cat.name}</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">{cat.count} studio items</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reusable Recommendation Rail: "Trending Now" */}
      <RecommendationRail
        type="trending"
        title="Trending Now"
        subtitle="The most coveted pieces moving fast across design agencies and home studios"
        limit={4}
      />

      {/* Reusable Recommendation Rail: "For You" */}
      <RecommendationRail
        type="for-you"
        title="Curated For You"
        subtitle="Rule-based algorithmic selections optimized for ergonomics and sound engineering"
        limit={4}
      />

      {/* Promotional Campaign Banner */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Limited Time Invitation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-heading leading-tight">
            Spring Workspace Upgrade: $25 Off With Code <span className="text-indigo-400 font-mono">CARTWISE25</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upgrade your daily workstation with solid American walnut shelves, CNC milled 75% mechanical keyboards, and glare-free monitor light bars. Applicable on orders above $150.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentView('catalog')}
            >
              Shop the Promo
            </Button>
            <span className="text-xs text-slate-400 font-mono">Expires April 2026</span>
          </div>
        </div>
      </section>

      {/* Recently Viewed Rail */}
      <RecommendationRail
        type="recently-viewed"
        title="Recently Explored"
        subtitle="Pick up right where you left off"
        limit={4}
      />
    </div>
  );
};
