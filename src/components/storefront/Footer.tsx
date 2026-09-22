import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export const Footer: React.FC = () => {
  const { setCurrentView, navigateToCategory } = useStore();
  const { loginAsAdmin } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-xs">
      {/* Value props bar */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                <Truck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Carbon-Neutral Delivery</p>
                <p className="text-[11px] text-slate-500">Free shipping on orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">30-Day Studio Trial</p>
                <p className="text-[11px] text-slate-500">Hassle-free return policy & exchange</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">256-Bit Encrypted</p>
                <p className="text-[11px] text-slate-500">Certified secure PCI-DSS checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">2-Year Studio Warranty</p>
                <p className="text-[11px] text-slate-500">Official manufacturer warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg">
                C
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 font-heading">
                Cartwise
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Cartwise is an architectural commerce application engineered for design-conscious creators, engineers, and workspace purists. Designed with high-performance components and pluggable recommendation engines.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  loginAsAdmin();
                  setCurrentView('admin');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Access Admin Back Office &rarr;
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Catalog
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateToCategory('audio')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Audio & Sound
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('workspace')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Workspace & Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('electronics')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Personal Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('lifestyle')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Lifestyle & Bags
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('shipping-policy')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('return-policy')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Return & Exchange
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Track an Order
                </button>
              </li>
              <li>
                <span className="text-slate-400">support@cartwise.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Architecture
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Cartwise is built with modular feature slices, optimistic updates, and clean API contracts.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-slate-700">Production Ready</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>&copy; 2026 Cartwise Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('shipping-policy')} className="hover:text-slate-600">
              Shipping & Deliveries
            </button>
            <button onClick={() => setCurrentView('return-policy')} className="hover:text-slate-600">
              Privacy & Cookies
            </button>
            <button onClick={() => setCurrentView('return-policy')} className="hover:text-slate-600">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
