import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Shield,
  Bell,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CATEGORIES } from '../../data/mockData';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    wishlist,
    unreadNotificationCount,
    setAccountActiveTab,
    isAiWidgetOpen,
    setIsAiWidgetOpen,
    isAiFeatureEnabled,
  } = useStore();

  const { cartCount } = useCart();
  const { user, isGuest, logout, loginAsAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentView('catalog');
  };

  const handleCategoryClick = (catId: string | null) => {
    setCategoryFilter(catId);
    setCurrentView('catalog');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Banner: Switch to Admin or Announcement */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] px-2 py-0.5 rounded border border-indigo-400/30">
              SPRING 2026
            </span>
            <span className="hidden sm:inline text-slate-300">
              Complimentary carbon-neutral ground shipping on all orders over $100
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Admin Back Office Switcher */}
            <button
              onClick={() => {
                if (!user || user.role !== 'ADMIN') {
                  loginAsAdmin();
                }
                setCurrentView('admin');
              }}
              className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white font-medium transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer"
              title="Open Admin Back Office"
            >
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>Admin Back Office</span>
            </button>

            {isAiFeatureEnabled && (
              <button
                onClick={() => setIsAiWidgetOpen(!isAiWidgetOpen)}
                className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white font-medium transition-colors bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">AI Shopping Assistant</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => {
                setCategoryFilter(null);
                setSearchQuery('');
                setCurrentView('home');
              }}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 bg-slate-900 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter transition-colors shadow-xs">
                C
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                  Cartwise
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Studio Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search precision headphones, mechanical keyboards, desk shelves..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Actions: Notifications, Wishlist, Cart, Account */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCurrentView('cart')}
              className="relative p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications (Authenticated) */}
            {user && (
              <button
                onClick={() => {
                  setAccountActiveTab('notifications');
                  setCurrentView('account');
                }}
                className="relative p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                )}
              </button>
            )}

            {/* Account Menu */}
            <div className="relative">
              {isGuest ? (
                <div className="flex items-center gap-2 pl-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {user?.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-800 hidden lg:inline max-w-[100px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setAccountActiveTab('overview');
                            setCurrentView('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Account Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setAccountActiveTab('orders');
                            setCurrentView('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          My Orders
                        </button>
                        <button
                          onClick={() => {
                            setAccountActiveTab('security');
                            setCurrentView('account');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                          Security & Devices
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 md:hidden rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav className="hidden md:flex items-center gap-8 py-2.5 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap pb-1 ${
              categoryFilter === null && currentView === 'catalog'
                ? 'text-slate-900 font-bold border-b-2 border-slate-900'
                : ''
            }`}
          >
            All Products
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap pb-1 ${
                categoryFilter === cat.id && currentView === 'catalog'
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search gear..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 text-sm pl-10 pr-4 py-2 rounded-xl"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Browse Categories
            </p>
            <button
              onClick={() => handleCategoryClick(null)}
              className="w-full text-left px-2 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
            >
              All Products
            </button>
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full text-left px-2 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                loginAsAdmin();
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              Switch to Admin Back Office
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
