/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Shield, ArrowUp, ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreProvider, useStore } from './context/StoreContext';

// Storefront components
import { Header } from './components/storefront/Header';
import { Footer } from './components/storefront/Footer';
import { HomePage } from './components/storefront/HomePage';
import { ShippingPolicyPage, ReturnPolicyPage } from './components/storefront/PolicyPages';

// Feature views
import { ProductListing } from './components/catalog/ProductListing';
import { ProductDetails } from './components/catalog/ProductDetails';
import { CartView } from './components/cart/CartView';
import { MultiStepCheckout } from './components/checkout/MultiStepCheckout';
import { OrderDetailsView } from './components/orders/OrderDetailsView';
import { AccountDashboard } from './components/account/AccountDashboard';
import { WishlistView } from './components/account/WishlistView';
import { AuthModal } from './components/auth/AuthModal';
import { AiShoppingAssistant } from './components/ai/AiShoppingAssistant';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/DesignSystem';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isAiWidgetOpen, setIsAiWidgetOpen, isAiFeatureEnabled, toasts, dismissToast } =
    useStore();
  const { user, loginAsAdmin } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Provider */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* ADMIN BACK OFFICE VIEW */}
      {currentView === 'admin' ? (
        <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AdminDashboard />
          </div>
        </div>
      ) : (
        /* CUSTOMER STOREFRONT VIEW */
        <>
          <Header onOpenAuth={handleOpenAuth} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {currentView === 'home' && <HomePage />}
            {currentView === 'catalog' && <ProductListing />}
            {currentView === 'product-details' && <ProductDetails />}
            {currentView === 'cart' && <CartView onRequireAuth={() => handleOpenAuth('login')} />}
            {currentView === 'checkout' && <MultiStepCheckout />}
            {currentView === 'order-details' && <OrderDetailsView />}
            {currentView === 'account' && <AccountDashboard />}
            {currentView === 'wishlist' && <WishlistView />}
            {currentView === 'shipping-policy' && <ShippingPolicyPage />}
            {currentView === 'return-policy' && <ReturnPolicyPage />}
          </main>

          <Footer />

          {/* AI Shopping Assistant Widget & Floating Launcher */}
          {isAiFeatureEnabled && (
            <>
              {!isAiWidgetOpen && (
                <button
                  onClick={() => setIsAiWidgetOpen(true)}
                  className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-indigo-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl hover:shadow-2xl flex items-center gap-2.5 transition-all duration-200 cursor-pointer group ring-4 ring-white"
                  title="Open AI Shopping Assistant"
                >
                  <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-bold hidden sm:inline">Ask Studio AI</span>
                </button>
              )}
              <AiShoppingAssistant />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </CartProvider>
    </AuthProvider>
  );
}
