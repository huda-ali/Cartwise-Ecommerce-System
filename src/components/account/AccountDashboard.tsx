import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Lock,
  Smartphone,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { Address } from '../../types';
import { Button, Badge, Modal } from '../common/DesignSystem';

interface AccountDashboardProps {
  initialTab?: 'overview' | 'orders' | 'addresses' | 'payments' | 'security' | 'notifications';
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({ initialTab = 'overview' }) => {
  const { user, updateProfile, addAddress, deleteAddress, logout } = useAuth();
  const { orders, navigateToOrderDetails, accountActiveTab, setAccountActiveTab, showToast } = useStore();
  const { addToCart } = useCart();

  const activeTab = accountActiveTab || initialTab;

  // Edit profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  // Add address modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id'>>({
    fullName: user?.name || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: user?.phone || '',
    isDefaultShipping: false,
  });

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Active simulated sessions
  const [deviceSessions, setDeviceSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16" (Sonoma)',
      browser: 'Chrome 124.0',
      location: 'San Francisco, CA',
      isCurrent: true,
      lastActive: 'Active now',
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro Max',
      browser: 'Mobile Safari',
      location: 'San Francisco, CA',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
  ]);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    shippingAlerts: true,
    promotions: false,
    restockAlerts: true,
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: profileName, phone: profilePhone });
    showToast('Profile information updated successfully!', 'success');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.postalCode) return;

    addAddress(newAddr);
    setAddressModalOpen(false);
    showToast('New shipping address saved!', 'success');
    setNewAddr({
      fullName: user?.name || '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: user?.phone || '',
      isDefaultShipping: false,
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Device session revoked.', 'info');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    showToast('Password updated successfully across all devices!', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  // Filter user orders
  const userOrders = orders.filter((o) => o.customer.id === user?.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Account Header Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-2xl flex items-center justify-center font-heading">
              {user?.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {user?.name}
              </h1>
              <Badge variant={user?.role === 'ADMIN' ? 'info' : 'neutral'} size="sm">
                {user?.role === 'ADMIN' ? 'Studio Admin' : 'Verified Member'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer w-fit"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Main Account Grid: Sidebar Navigation + Content Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs (3 cols) */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs space-y-1">
            <button
              onClick={() => setAccountActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Profile Overview
            </button>

            <button
              onClick={() => setAccountActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              Orders &amp; Receipts ({userOrders.length})
            </button>

            <button
              onClick={() => setAccountActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Saved Addresses
            </button>

            <button
              onClick={() => setAccountActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment Methods
            </button>

            <button
              onClick={() => setAccountActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              Security &amp; Sessions
            </button>

            <button
              onClick={() => setAccountActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </aside>

        {/* Content Area (9 cols) */}
        <main className="lg:col-span-9">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update your contact details and default dispatch preferences
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400">
                    Email address cannot be modified directly for security reasons.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">Order History</h2>
                <p className="text-xs text-slate-500">
                  Track real-time shipment status, review invoices, or request reorders
                </p>
              </div>

              {userOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">No historical orders found.</p>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/60 gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {ord.orderNumber}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} &middot;{' '}
                            {ord.items.length} item{ord.items.length === 1 ? '' : 's'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black font-mono text-slate-900">
                            ${ord.total.toFixed(2)}
                          </span>
                          <Badge
                            variant={
                              ord.status === 'DELIVERED'
                                ? 'success'
                                : ord.status === 'SHIPPED'
                                ? 'info'
                                : ord.status === 'CANCELLED'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {ord.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Items previews */}
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 shrink-0">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                            <span className="text-xs text-slate-700 font-medium max-w-[140px] truncate">
                              {item.productTitle}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          Target: {ord.estimatedDelivery}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToOrderDetails(ord.id, true)}
                          icon={ChevronRight}
                          iconPosition="right"
                        >
                          View Tracking
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">
                    Saved Addresses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage studio dispatch locations and billing addresses
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddressModalOpen(true)}
                  icon={Plus}
                >
                  Add Address
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                      {addr.isDefaultShipping && <Badge size="sm">Default</Badge>}
                    </div>
                    <p className="text-xs text-slate-600">
                      {addr.street} {addr.apartment && `, ${addr.apartment}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-xs text-slate-500">{addr.phone}</p>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">Payment Cards</h2>
                <p className="text-xs text-slate-500">
                  PCI-DSS compliant encrypted payment tokens. Card numbers are never stored in raw plaintext.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-800 text-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs tracking-wider uppercase text-slate-300">
                      Cartwise Member Card
                    </span>
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="font-mono text-base tracking-widest text-white">
                    •••• •••• •••• 4242
                  </p>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{user?.name}</span>
                    <span>12/28</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">
                    Password &amp; Authentication
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your account credentials to safeguard order histories
                  </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    Update Password
                  </Button>
                </form>
              </div>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Active Device Sessions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Devices currently authorized to access your Cartwise account
                  </p>
                </div>

                <div className="space-y-3">
                  {deviceSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-bold text-slate-900">
                            {s.device} {s.isCurrent && '(This Browser)'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {s.browser} &middot; {s.location} &middot; {s.lastActive}
                          </p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Notification Channels
                </h2>
                <p className="text-xs text-slate-500">
                  Configure alerts for order fulfillment milestones and curated product drops
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Order Status Updates</span>
                    <span className="text-slate-500 text-[11px]">
                      Instant email alerts for order dispatch, courier handover, and delivery
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.orderUpdates}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, orderUpdates: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Restock Notifications</span>
                    <span className="text-slate-500 text-[11px]">
                      Alerts when favorited items or waitlisted variants return to stock
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.restockAlerts}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, restockAlerts: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Promotions &amp; Studio Releases</span>
                    <span className="text-slate-500 text-[11px]">
                      Occasional invitations for seasonal discounts and member-only events
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.promotions}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, promotions: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Shipping Address"
        description="Ensure courier accuracy for carbon-neutral delivery."
      >
        <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newAddr.fullName}
              onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
