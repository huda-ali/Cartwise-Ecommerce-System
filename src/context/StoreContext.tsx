import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  UserReview,
  NotificationItem,
  AuditLogEntry,
  InventoryMovement,
  OrderStatus,
  Address,
  ShippingMethodOption,
  PaymentMethod,
} from '../types';
import {
  MOCK_PRODUCTS,
  INITIAL_ORDERS,
  MOCK_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INVENTORY_MOVEMENTS,
} from '../data/mockData';

export type AppView =
  | 'home'
  | 'catalog'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'wishlist'
  | 'account'
  | 'order-details'
  | 'shipping-policy'
  | 'return-policy'
  | 'admin';

export type AccountTab =
  | 'overview'
  | 'profile'
  | 'addresses'
  | 'payments'
  | 'orders'
  | 'order-details'
  | 'order-tracking'
  | 'wishlist'
  | 'saved'
  | 'reviews'
  | 'notifications'
  | 'security'
  | 'privacy';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'brands'
  | 'inventory'
  | 'orders'
  | 'users'
  | 'coupons'
  | 'reviews'
  | 'analytics'
  | 'audit-logs'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  // Navigation & Routing State
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  accountActiveTab: AccountTab;
  setAccountActiveTab: (tab: AccountTab) => void;
  adminActiveSection: AdminSection;
  setAdminActiveSection: (section: AdminSection) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  brandFilter: string | null;
  setBrandFilter: (brand: string | null) => void;

  // Catalog
  products: Product[];
  createProduct: (prod: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  duplicateProduct: (id: string) => void;
  togglePublishProduct: (id: string) => void;

  // Orders
  orders: Order[];
  latestConfirmedOrder: Order | null;
  createOrder: (orderData: {
    items: Order['items'];
    shippingAddress: Address;
    shippingMethod: ShippingMethodOption;
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    couponCode?: string;
    shippingCost: number;
    tax: number;
    total: number;
    customer: Order['customer'];
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => boolean;
  updateOrderTracking: (orderId: string, carrier: string, trackingNumber: string) => void;
  cancelOrder: (orderId: string, reason: string) => boolean;
  refundOrder: (orderId: string, reason: string) => boolean;
  addOrderInternalNote: (orderId: string, note: string) => void;

  // Reviews
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'helpfulCount' | 'status'>) => void;
  moderateReview: (reviewId: string, status: UserReview['status']) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;

  // Inventory & Auditing
  inventoryMovements: InventoryMovement[];
  auditLogs: AuditLogEntry[];
  recordStockAdjustment: (variantId: string, delta: number, reason: string, performedBy: string) => void;

  // Recently Viewed
  recentlyViewedIds: string[];
  recordProductView: (productId: string) => void;

  // AI Assistant Widget
  isAiWidgetOpen: boolean;
  setIsAiWidgetOpen: (open: boolean) => void;
  isAiFeatureEnabled: boolean;
  setIsAiFeatureEnabled: (enabled: boolean) => void;

  // Feedback Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Helper flow navigation
  navigateToProduct: (productId: string) => void;
  navigateToOrderDetails: (orderId: string, trackingMode?: boolean) => void;
  navigateToCategory: (categoryId: string) => void;
  navigateToBrand: (brandId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod-aura-one');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [accountActiveTab, setAccountActiveTab] = useState<AccountTab>('overview');
  const [adminActiveSection, setAdminActiveSection] = useState<AdminSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);

  // Entities
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cartwise_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cartwise_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [latestConfirmedOrder, setLatestConfirmedOrder] = useState<Order | null>(() => {
    return orders.length > 0 ? orders[0] : null;
  });

  const [reviews, setReviews] = useState<UserReview[]>(() => {
    const saved = localStorage.getItem('cartwise_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('cartwise_wishlist');
    return saved ? JSON.parse(saved) : ['prod-kanso-key'];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(INITIAL_INVENTORY_MOVEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cartwise_recent');
    return saved ? JSON.parse(saved) : ['prod-aura-one', 'prod-kanso-key'];
  });

  const [isAiWidgetOpen, setIsAiWidgetOpen] = useState(false);
  const [isAiFeatureEnabled, setIsAiFeatureEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync products and orders
  useEffect(() => {
    localStorage.setItem('cartwise_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cartwise_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cartwise_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('cartwise_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('cartwise_recent', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const recordProductView = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed item from your wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Helper log generator
  const logAudit = (
    actor: string,
    action: string,
    resource: string,
    resourceId: string,
    result: 'SUCCESS' | 'FAILURE' | 'WARNING',
    details?: string
  ) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actor,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      result,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Product CRUD
  const createProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    logAudit('admin@cartwise.com', 'PRODUCT_CREATE', 'Product', newProd.id, 'SUCCESS', `Created ${newProd.title}`);
    showToast(`Product "${newProd.title}" created successfully.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAudit('admin@cartwise.com', 'PRODUCT_UPDATE', 'Product', id, 'SUCCESS', `Updated fields: ${Object.keys(updates).join(', ')}`);
    showToast('Product updated successfully.');
  };

  const duplicateProduct = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      variants: original.variants.map((v) => ({
        ...v,
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sku: `${v.sku}-CPY`,
      })),
    };
    setProducts((prev) => [duplicated, ...prev]);
    logAudit('admin@cartwise.com', 'PRODUCT_DUPLICATE', 'Product', duplicated.id, 'SUCCESS', `Duplicated from ${original.title}`);
    showToast(`Created duplicate: "${duplicated.title}"`);
  };

  const togglePublishProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const nextStatus = prod.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateProduct(id, { status: nextStatus });
    showToast(`Product ${prod.title} set to ${nextStatus}.`);
  };

  // Orders
  const createOrder = (orderData: {
    items: Order['items'];
    shippingAddress: Address;
    shippingMethod: ShippingMethodOption;
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    couponCode?: string;
    shippingCost: number;
    tax: number;
    total: number;
    customer: Order['customer'];
  }): Order => {
    const orderNumber = `CW-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(now.getDate() + 4);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now.toISOString(),
      estimatedDelivery: estDeliveryDate.toISOString().split('T')[0],
      customer: orderData.customer,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      couponCode: orderData.couponCode,
      shippingCost: orderData.shippingCost,
      tax: orderData.tax,
      total: orderData.total,
      timeline: [
        {
          status: 'PENDING',
          timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
          title: 'Order Placed',
          description: `Authorized payment via ${orderData.paymentMethod === 'CARD' ? 'Credit Card' : 'Cash on Delivery'}`,
          completed: true,
        },
        {
          status: 'CONFIRMED',
          timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
          title: 'Order Confirmed',
          description: 'Payment authorized and fulfillment queue assigned.',
          completed: true,
          current: true,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestConfirmedOrder(newOrder);

    // Deduct stock and record inventory movement
    orderData.items.forEach((item) => {
      recordStockAdjustment(
        item.variantId,
        -item.quantity,
        `Auto-reservation for new order ${orderNumber}`,
        'System Fulfillment'
      );
    });

    // In-app notification
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      category: 'Orders',
      title: `Order ${orderNumber} Confirmed`,
      message: `Your order of ${orderData.items.length} items has been received and confirmed.`,
      timestamp: 'Just now',
      read: false,
      linkAction: 'orders',
    };
    setNotifications((prev) => [newNotification, ...prev]);

    logAudit(
      orderData.customer.email,
      'ORDER_CREATE',
      'Order',
      newOrder.id,
      'SUCCESS',
      `Order ${orderNumber} placed for $${orderData.total.toFixed(2)}`
    );

    return newOrder;
  };

  // Valid status transitions check
  const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED', 'FAILED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED', 'REFUNDED'],
    CANCELLED: [],
    FAILED: [],
    RETURNED: ['REFUNDED'],
    REFUNDED: [],
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    // Check valid transitions
    const validTargets = ALLOWED_TRANSITIONS[order.orderStatus] || [];
    if (!validTargets.includes(status)) {
      showToast(`Cannot transition directly from ${order.orderStatus} to ${status}.`, 'error');
      return false;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedTimeline = [...order.timeline];
    updatedTimeline.forEach((t) => (t.current = false));
    updatedTimeline.push({
      status,
      timestamp: nowStr,
      title: `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      description: note || `Status updated to ${status} by fulfillment system`,
      completed: true,
      current: true,
    });

    const updatedOrder: Order = {
      ...order,
      orderStatus: status,
      timeline: updatedTimeline,
      paymentStatus: status === 'REFUNDED' ? 'REFUNDED' : order.paymentStatus,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    logAudit('admin@cartwise.com', 'ORDER_STATUS_UPDATE', 'Order', order.orderNumber, 'SUCCESS', `Transitioned to ${status}. ${note || ''}`);
    showToast(`Order ${order.orderNumber} transitioned to ${status}`);
    return true;
  };

  const updateOrderTracking = (orderId: string, carrier: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            trackingCarrier: carrier,
            trackingNumber,
            trackingUrl: carrier.toLowerCase().includes('fedex')
              ? 'https://www.fedex.com'
              : carrier.toLowerCase().includes('ups')
              ? 'https://www.ups.com'
              : 'https://tools.usps.com',
          };
        }
        return o;
      })
    );
    showToast('Tracking details updated.');
    logAudit('admin@cartwise.com', 'ORDER_TRACKING_SET', 'Order', orderId, 'SUCCESS', `${carrier} #${trackingNumber}`);
  };

  const cancelOrder = (orderId: string, reason: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (['SHIPPED', 'DELIVERED', 'REFUNDED'].includes(order.orderStatus)) {
      showToast(`Order is already ${order.orderStatus.toLowerCase()} and cannot be cancelled directly.`, 'error');
      return false;
    }

    const updated = updateOrderStatus(orderId, 'CANCELLED', `Cancelled: ${reason}`);
    if (updated) {
      // Restock inventory
      order.items.forEach((item) => {
        recordStockAdjustment(
          item.variantId,
          item.quantity,
          `Restock from cancelled order ${order.orderNumber}`,
          'Fulfillment Restock'
        );
      });
      showToast('Order has been cancelled.', 'info');
      return true;
    }
    return false;
  };

  const refundOrder = (orderId: string, reason: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const updated = updateOrderStatus(orderId, 'REFUNDED', `Refund initiated: ${reason}`);
    if (updated) {
      showToast(`Order ${order.orderNumber} marked as refunded.`, 'info');
      return true;
    }
    return false;
  };

  const addOrderInternalNote = (orderId: string, note: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, internalNotes: [...(o.internalNotes || []), note] };
        }
        return o;
      })
    );
    showToast('Internal note saved.');
  };

  // Reviews
  const addReview = (reviewData: Omit<UserReview, 'id' | 'date' | 'helpfulCount' | 'status'>) => {
    const newReview: UserReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      status: 'PENDING', // Submits to admin moderation queue!
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast('Thank you! Your review has been submitted for moderation.', 'success');
    logAudit(reviewData.userName, 'REVIEW_SUBMIT', 'UserReview', newReview.id, 'SUCCESS', `Review for ${reviewData.productTitle}`);
  };

  const moderateReview = (reviewId: string, status: UserReview['status']) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
    logAudit('admin@cartwise.com', 'REVIEW_MODERATION', 'UserReview', reviewId, 'SUCCESS', `Set status to ${status}`);
    showToast(`Review marked as ${status}.`);
  };

  // Stock Adjustment (Mandatory Reason enforced!)
  const recordStockAdjustment = (variantId: string, delta: number, reason: string, performedBy: string) => {
    let updatedSku = '';
    let prodTitle = '';
    let varTitle = '';
    let finalStock = 0;

    setProducts((prev) =>
      prev.map((prod) => {
        const hasVariant = prod.variants.some((v) => v.id === variantId);
        if (!hasVariant) return prod;

        return {
          ...prod,
          variants: prod.variants.map((v) => {
            if (v.id === variantId) {
              updatedSku = v.sku;
              prodTitle = prod.title;
              varTitle = v.title;
              finalStock = Math.max(0, v.stock + delta);
              return {
                ...v,
                stock: finalStock,
                isAvailable: finalStock > 0,
              };
            }
            return v;
          }),
        };
      })
    );

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sku: updatedSku || variantId,
      productTitle: prodTitle || 'Product',
      variantTitle: varTitle || 'Standard Variant',
      type: delta > 0 ? 'ADJUSTMENT' : 'ORDER_RESERVATION',
      quantityDelta: delta,
      quantityAfter: finalStock,
      reason: reason || 'Manual stock update',
      performedBy,
    };

    setInventoryMovements((prev) => [movement, ...prev]);
    logAudit(
      performedBy,
      'INVENTORY_ADJUSTMENT',
      'ProductVariant',
      variantId,
      'SUCCESS',
      `Delta: ${delta > 0 ? '+' : ''}${delta}. Reason: ${reason}`
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Helpers
  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    recordProductView(productId);
    setCurrentView('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderDetails = (orderId: string, trackingMode = false) => {
    setSelectedOrderId(orderId);
    setAccountActiveTab(trackingMode ? 'order-tracking' : 'order-details');
    setCurrentView('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (catId: string) => {
    setCategoryFilter(catId);
    setBrandFilter(null);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBrand = (brandName: string) => {
    setBrandFilter(brandName);
    setCategoryFilter(null);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        accountActiveTab,
        setAccountActiveTab,
        adminActiveSection,
        setAdminActiveSection,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        brandFilter,
        setBrandFilter,

        products,
        createProduct,
        updateProduct,
        duplicateProduct,
        togglePublishProduct,

        orders,
        latestConfirmedOrder,
        createOrder,
        updateOrderStatus,
        updateOrderTracking,
        cancelOrder,
        refundOrder,
        addOrderInternalNote,

        reviews,
        addReview,
        moderateReview,

        wishlist,
        toggleWishlist,
        isInWishlist,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,

        inventoryMovements,
        auditLogs,
        recordStockAdjustment,

        recentlyViewedIds,
        recordProductView,

        isAiWidgetOpen,
        setIsAiWidgetOpen,
        isAiFeatureEnabled,
        setIsAiFeatureEnabled,

        toasts,
        showToast,
        dismissToast,

        navigateToProduct,
        navigateToOrderDetails,
        navigateToCategory,
        navigateToBrand,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
