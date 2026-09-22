import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Users,
  MessageSquare,
  History,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Shield,
  Truck,
  ArrowUpRight,
  Filter,
  DollarSign,
  ShoppingCart,
  Store,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  OrderStatus,
  ProductStatus,
  StockAdjustmentReason,
  Product,
  ProductVariant,
} from '../../types';
import { Button, Badge, Modal } from '../common/DesignSystem';

type AdminTab =
  | 'overview'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'users'
  | 'reviews'
  | 'audit';

interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  orderCount: number;
  avatar?: string;
}

const INITIAL_ADMIN_USERS: AdminManagedUser[] = [
  {
    id: 'usr-001',
    name: 'Sarah Chen (Admin)',
    email: 'admin@cartwise.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-11-12T10:00:00Z',
    orderCount: 14,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-002',
    name: 'Alex Rivera',
    email: 'customer@cartwise.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-01-15T14:30:00Z',
    orderCount: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-003',
    name: 'Elena Rostova',
    email: 'elena@studio.design',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-02-01T09:15:00Z',
    orderCount: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-004',
    name: 'Marcus Vance',
    email: 'marcus@soundlab.io',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-02-18T18:45:00Z',
    orderCount: 1,
  },
];

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    reviews,
    auditLogs,
    updateOrderStatus,
    updateOrderTracking,
    updateProduct,
    createProduct,
    recordStockAdjustment,
    moderateReview,
    setCurrentView,
    showToast,
  } = useStore();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // User management state
  const [managedUsers, setManagedUsers] = useState<AdminManagedUser[]>(INITIAL_ADMIN_USERS);

  // Search & Filter states across tabs
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<string>('ALL');

  const [inventorySearch, setInventorySearch] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT'>('ALL');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Stock adjustment modal state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockVariant, setSelectedStockVariant] = useState<{
    productId: string;
    productTitle: string;
    variant: ProductVariant;
  } | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<StockAdjustmentReason>('NEW_SHIPMENT');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  // Order Fulfillment Modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('PROCESSING');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newCarrier, setNewCarrier] = useState('');

  // Product Edit / Create Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  /* =========================================================================
     COMPUTED OVERVIEW METRICS & RECHARTS DATA
     ========================================================================= */
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => (o.orderStatus || o.status) !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => {
      const s = o.orderStatus || o.status;
      return s === 'PENDING' || s === 'PROCESSING';
    }).length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    let count = 0;
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock > 0 && v.stock <= (v.lowStockThreshold || 5)) count++;
      });
    });
    return count;
  }, [products]);

  // Chart data: Monthly simulated revenue trend
  const revenueChartData = [
    { name: 'Mon', revenue: 2400, orders: 12 },
    { name: 'Tue', revenue: 3800, orders: 19 },
    { name: 'Wed', revenue: 4200, orders: 21 },
    { name: 'Thu', revenue: 3100, orders: 15 },
    { name: 'Fri', revenue: 5900, orders: 28 },
    { name: 'Sat', revenue: 6800, orders: 32 },
    { name: 'Sun', revenue: 7400, orders: 36 },
  ];

  // Status breakdown data for pie chart
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      DELIVERED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      PENDING: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      const s = o.orderStatus || o.status || 'PENDING';
      counts[s] = (counts[s] || 0) + 1;
    });
    return [
      { name: 'Delivered', value: counts.DELIVERED, color: '#10b981' },
      { name: 'Processing', value: counts.PROCESSING, color: '#6366f1' },
      { name: 'Shipped', value: counts.SHIPPED, color: '#0ea5e9' },
      { name: 'Pending', value: counts.PENDING, color: '#f59e0b' },
      { name: 'Cancelled', value: counts.CANCELLED, color: '#f43f5e' },
    ];
  }, [orders]);

  /* =========================================================================
     INVENTORY HANDLERS
     ========================================================================= */
  const handleOpenStockAdjust = (product: Product, variant: ProductVariant) => {
    setSelectedStockVariant({
      productId: product.id,
      productTitle: product.title,
      variant,
    });
    setAdjustmentDelta(10);
    setAdjustmentReason('NEW_SHIPMENT');
    setAdjustmentNotes('');
    setStockModalOpen(true);
  };

  const handleExecuteStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockVariant) return;

    recordStockAdjustment(
      selectedStockVariant.variant.id,
      adjustmentDelta,
      `${adjustmentReason}: ${adjustmentNotes || 'Manual stock update'}`,
      user?.name || 'Admin'
    );

    setStockModalOpen(false);
    showToast(
      `Inventory updated for ${selectedStockVariant.variant.sku} (${adjustmentDelta > 0 ? `+${adjustmentDelta}` : adjustmentDelta})`,
      'success'
    );
  };

  /* =========================================================================
     ORDER FULFILLMENT HANDLERS
     ========================================================================= */
  const handleOpenOrderFulfill = (ord: any) => {
    setSelectedOrder(ord);
    setNewOrderStatus(ord.orderStatus || ord.status || 'PROCESSING');
    setNewTrackingNumber(ord.trackingNumber || '');
    setNewCarrier(ord.shippingMethod?.carrier || ord.trackingCarrier || 'FedEx Priority');
    setOrderModalOpen(true);
  };

  const handleExecuteOrderUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const ok = updateOrderStatus(
      selectedOrder.id,
      newOrderStatus,
      'Fulfillment status updated via Admin Operations'
    );

    if (newTrackingNumber) {
      updateOrderTracking(
        selectedOrder.id,
        newCarrier || 'FedEx Priority',
        newTrackingNumber
      );
    }

    setOrderModalOpen(false);
    showToast(ok ? 'Order fulfillment updated!' : 'Status transition not permitted.', ok ? 'success' : 'error');
  };

  /* =========================================================================
     PRODUCT CREATE / EDIT HANDLERS
     ========================================================================= */
  const handleOpenCreateProduct = () => {
    setEditingProduct({
      title: '',
      brand: 'Studio Lab',
      category: 'workspace',
      description: '',
      basePrice: 199,
      status: 'PUBLISHED',
      rating: 5.0,
      reviewCount: 1,
      ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1000&auto=format&fit=crop&q=80',
      ],
      tags: ['studio', 'ergonomic'],
      attributeOptions: [{ name: 'Finish', values: ['Solid Walnut', 'Matte Black'] }],
      variants: [
        {
          id: `var-${Date.now()}-1`,
          sku: 'STU-WAL-01',
          title: 'Solid Walnut',
          price: 199,
          stock: 25,
          lowStockThreshold: 5,
          isAvailable: true,
          attributes: { Finish: 'Solid Walnut' },
        },
      ],
      specifications: { Material: 'Solid American Walnut', Origin: 'Designed in California' },
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
    setProductModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.title) return;

    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      createProduct({
        ...editingProduct,
        slug: editingProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      } as any);
    }

    setProductModalOpen(false);
    showToast(`Product "${editingProduct.title}" saved!`, 'success');
  };

  const updateUserRole = (userId: string, newRole: 'CUSTOMER' | 'ADMIN') => {
    setManagedUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const toggleUserStatus = (userId: string) => {
    setManagedUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u
      )
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Operations Top Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded border border-indigo-400/30">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">Cartwise Back Office v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Store Management Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fulfillment status, inventory telemetry, customer catalog controls, and audit trails
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('home')}
            icon={Store}
          >
            Switch to Storefront
          </Button>
        </div>
      </div>

      {/* Main Admin Navigation Pills */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex gap-1.5 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'inventory', label: `Inventory & Stock`, icon: Boxes },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ClipboardList },
          { id: 'users', label: `Users (${managedUsers.length})`, icon: Users },
          { id: 'reviews', label: `Review Moderation (${reviews.length})`, icon: MessageSquare },
          { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.8% vs previous period</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Orders</span>
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {activeOrdersCount}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Pending fulfillment in warehouse</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 font-heading">
                {lowStockCount}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Under minimum safety buffer</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Catalog SKUs</span>
                <Boxes className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {products.reduce((acc, p) => acc + p.variants.length, 0)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Across {products.length} published products</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Trend Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Weekly Revenue &amp; Order Velocity
                  </h3>
                  <p className="text-xs text-slate-400">Daily gross performance across all channels</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Past 7 Days
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: any) => [`$${val}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Order Status Distribution
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Overview Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Recent Orders Queue
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View all orders &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => {
                    const st = o.orderStatus || o.status || 'PENDING';
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{o.customer.name}</td>
                        <td className="py-3 px-4">{o.items.length} units</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">${o.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            size="sm"
                            variant={
                              st === 'DELIVERED'
                                ? 'success'
                                : st === 'SHIPPED'
                                ? 'info'
                                : st === 'CANCELLED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {st}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOpenOrderFulfill(o)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 text-xs cursor-pointer"
                          >
                            Fulfill
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Catalog &amp; Product Management
              </h2>
              <p className="text-xs text-slate-500">
                Manage product details, pricing, variants, and publication visibility
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateProduct}
              icon={Plus}
            >
              Add New Product
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search products by title or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) => {
                    const matchQ =
                      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.brand.toLowerCase().includes(productSearch.toLowerCase());
                    const matchStat =
                      productStatusFilter === 'ALL' || p.status === productStatusFilter;
                    return matchQ && matchStat;
                  })
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.title}</p>
                            <p className="text-[11px] text-slate-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{p.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${p.basePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {p.variants.length} variant{p.variants.length === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          size="sm"
                          variant={
                            p.status === 'PUBLISHED'
                              ? 'success'
                              : p.status === 'DRAFT'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const nextStatus =
                                p.status === 'PUBLISHED'
                                  ? 'ARCHIVED'
                                  : p.status === 'ARCHIVED'
                                  ? 'DRAFT'
                                  : 'PUBLISHED';
                              updateProduct(p.id, { status: nextStatus as ProductStatus });
                              showToast(`Product set to ${nextStatus}`, 'info');
                            }}
                            className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Inventory Stock &amp; SKU Control
              </h2>
              <p className="text-xs text-slate-500">
                Track SKU units, update inventory levels with mandatory audit reasons
              </p>
            </div>
          </div>

          {/* Search & Stock Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by SKU or variant title..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Stock Filter:</span>
              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value as any)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock (&gt; 5)</option>
                <option value="LOW">Low Stock (&le; 5)</option>
                <option value="OUT">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">SKU</th>
                  <th className="py-3 px-4">Product &amp; Variant</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">On Hand Stock</th>
                  <th className="py-3 px-4">Safety Buffer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.flatMap((prod) =>
                  prod.variants
                    .filter((v) => {
                      const matchQ =
                        v.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        v.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        prod.title.toLowerCase().includes(inventorySearch.toLowerCase());

                      if (!matchQ) return false;

                      if (stockLevelFilter === 'IN_STOCK') return v.stock > (v.lowStockThreshold || 5);
                      if (stockLevelFilter === 'LOW') return v.stock > 0 && v.stock <= (v.lowStockThreshold || 5);
                      if (stockLevelFilter === 'OUT') return v.stock <= 0;
                      return true;
                    })
                    .map((variant) => {
                      const isLow = variant.stock > 0 && variant.stock <= (variant.lowStockThreshold || 5);
                      const isOut = variant.stock <= 0;

                      return (
                        <tr key={variant.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {variant.sku}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{prod.title}</p>
                            <p className="text-[11px] text-slate-500">{variant.title}</p>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            ${variant.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900">
                            {variant.stock} units
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">
                            {variant.lowStockThreshold || 5} min
                          </td>
                          <td className="py-3 px-4">
                            {isOut ? (
                              <Badge size="sm" variant="danger">
                                Out of Stock
                              </Badge>
                            ) : isLow ? (
                              <Badge size="sm" variant="warning">
                                Low Stock ({variant.stock})
                              </Badge>
                            ) : (
                              <Badge size="sm" variant="success">
                                Healthy
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStockAdjust(prod, variant)}
                            >
                              Adjust Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Order Fulfillment Queue
              </h2>
              <p className="text-xs text-slate-500">
                Process shipments, assign tracking numbers, update customer logistics
              </p>
            </div>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by order # or customer..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tracking</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter((ord) => {
                    const st = ord.orderStatus || ord.status || 'PENDING';
                    const matchQ =
                      ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      ord.customer.name.toLowerCase().includes(orderSearch.toLowerCase());
                    const matchStat =
                      orderStatusFilter === 'ALL' || st === orderStatusFilter;
                    return matchQ && matchStat;
                  })
                  .map((ord) => {
                    const st = ord.orderStatus || ord.status || 'PENDING';
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{ord.customer.name}</p>
                          <p className="text-[11px] text-slate-400">{ord.customer.email}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">
                          {ord.trackingNumber || 'Pending'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            size="sm"
                            variant={
                              st === 'DELIVERED'
                                ? 'success'
                                : st === 'SHIPPED'
                                ? 'info'
                                : st === 'CANCELLED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {st}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenOrderFulfill(ord)}
                          >
                            Update Status
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">User Directory</h2>
              <p className="text-xs text-slate-500">
                Manage roles, account permissions, and customer purchase histories
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge size="sm" variant={u.role === 'ADMIN' ? 'info' : 'neutral'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          const nextRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
                          updateUserRole(u.id, nextRole);
                          showToast(`User ${u.name} role changed to ${nextRole}`, 'info');
                        }}
                        className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        Switch to {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
                      </button>
                      <button
                        onClick={() => {
                          toggleUserStatus(u.id);
                          showToast(`User ${u.name} status updated`, 'info');
                        }}
                        className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Customer Review Moderation
              </h2>
              <p className="text-xs text-slate-500">
                Inspect submitted reviews before publication to prevent spam and abuse
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Product</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{rev.productTitle}</td>
                    <td className="py-3 px-4">{rev.userName}</td>
                    <td className="py-3 px-4 font-bold text-amber-500">{rev.rating} / 5</td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <span className="font-bold text-slate-800">{rev.title}</span> — {rev.comment}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={
                          rev.status === 'APPROVED'
                            ? 'success'
                            : rev.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {rev.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {rev.status !== 'APPROVED' && (
                        <button
                          onClick={() => {
                            moderateReview(rev.id, 'APPROVED');
                            showToast('Review approved and published!', 'success');
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {rev.status !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            moderateReview(rev.id, 'REJECTED');
                            showToast('Review rejected.', 'info');
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Operational Audit Logs
            </h2>
            <p className="text-xs text-slate-500">
              Immutable chronological record of inventory adjustments, order updates, and role alterations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4 rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4 text-indigo-600">{log.resourceId || log.entityId}</td>
                    <td className="py-3 px-4 text-slate-700">{log.actor}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Record Stock Adjustment"
        description="Every inventory alteration requires a tracked operational reason for accounting audit compliance."
      >
        <form onSubmit={handleExecuteStockAdjustment} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">{selectedStockVariant?.productTitle}</p>
            <p className="text-slate-500">
              SKU: <span className="font-mono text-slate-800">{selectedStockVariant?.variant.sku}</span> &middot; Current Stock: {selectedStockVariant?.variant.stock} units
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Quantity Adjustment (positive to add, negative to deduct)
            </label>
            <input
              type="number"
              required
              value={adjustmentDelta}
              onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment</label>
            <select
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value as StockAdjustmentReason)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            >
              <option value="NEW_SHIPMENT">New Shipment Received</option>
              <option value="DAMAGED">Damaged / Defective Stock</option>
              <option value="RETURN">Customer Return Restocked</option>
              <option value="MANUAL_CORRECTION">Manual Cycle Count Correction</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Po Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Inbound PO #4092 from factory"
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Commit Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ORDER FULFILLMENT MODAL */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Fulfill Order ${selectedOrder?.orderNumber}`}
        description="Update fulfillment status, assign courier partner, and log tracking number."
      >
        <form onSubmit={handleExecuteOrderUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Order Status</label>
            <select
              value={newOrderStatus}
              onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Carrier</label>
            <input
              type="text"
              value={newCarrier}
              onChange={(e) => setNewCarrier(e.target.value)}
              placeholder="e.g. FedEx Priority Ground"
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Carrier Tracking Number</label>
            <input
              type="text"
              value={newTrackingNumber}
              onChange={(e) => setNewTrackingNumber(e.target.value)}
              placeholder="e.g. FX-9842109283"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOrderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Fulfillment
            </Button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT CREATE / EDIT MODAL */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct?.id ? 'Edit Product Specifications' : 'Create New Studio Product'}
        description="Configure product metadata, pricing, and initial variant configurations."
      >
        <form onSubmit={handleSaveProductForm} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={editingProduct?.title || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                required
                value={editingProduct?.brand || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={editingProduct?.category || 'workspace'}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                <option value="audio">Audio</option>
                <option value="workspace">Workspace</option>
                <option value="electronics">Electronics</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={editingProduct?.description || ''}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, description: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Price ($)</label>
              <input
                type="number"
                required
                value={editingProduct?.basePrice || 0}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Publication Status</label>
              <select
                value={editingProduct?.status || 'PUBLISHED'}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Image URL</label>
            <input
              type="url"
              required
              value={editingProduct?.images?.[0] || ''}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, images: [e.target.value] })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
