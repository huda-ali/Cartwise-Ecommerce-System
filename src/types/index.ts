export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export type PaymentMethod = 'CARD' | 'COD';

export type ProductStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
export type StockAdjustmentReason =
  | 'NEW_SHIPMENT'
  | 'DAMAGED'
  | 'RETURN'
  | 'MANUAL_CORRECTION';

export interface ProductVariantAttribute {
  name: string; // e.g. "Color", "Storage", "Size", "Material", "Weight"
  value: string; // e.g. "Space Black", "256GB", "L", "Leather"
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string; // e.g. "Space Black / 256GB"
  attributes: Record<string, string>; // { Color: "Space Black", Storage: "256GB" }
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  image?: string;
  isAvailable: boolean;
}

export interface ProductAttributeOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  subCategory?: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  ratingDistribution: { [star: number]: number }; // 1: 5, 2: 8, 3: 20, 4: 80, 5: 150
  tags: string[];
  attributeOptions: ProductAttributeOption[];
  variants: ProductVariant[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  featured?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // cart item unique id
  productId: string;
  productTitle: string;
  productImage: string;
  brand: string;
  variantId: string;
  variantTitle: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxStock: number;
  isAvailable: boolean;
  priceChangedNote?: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  description: string;
  expiresAt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
  description: string;
  carrier?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  attributes: Record<string, string>;
  productImage: string;
  price: number;
  quantity: number;
  reviewed?: boolean;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  shippingMethod: ShippingMethodOption;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  timeline: OrderTimelineEvent[];
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  internalNotes?: string[];
  cancelReason?: string;
  returnReason?: string;
  estimatedDelivery: string;
}

export interface UserReview {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  verifiedPurchase: boolean;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpfulCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'FLAGGED';
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface NotificationItem {
  id: string;
  category: 'Orders' | 'Account' | 'Stock' | 'Promotions';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  entityId?: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  emailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  notificationPreferences: {
    orderUpdatesEmail: boolean;
    orderUpdatesSms: boolean;
    promotionsEmail: boolean;
    stockAlertsEmail: boolean;
    securityAlertsEmail: boolean;
  };
  privacyPreferences: {
    shareAnalyticsData: boolean;
    personalizedRecommendations: boolean;
    twoFactorAuth: boolean;
  };
}

export interface InventoryMovement {
  id: string;
  timestamp: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  type: 'RECEIPT' | 'ADJUSTMENT' | 'ORDER_RESERVATION' | 'ORDER_FULFILLMENT' | 'RETURN';
  quantityDelta: number;
  quantityAfter: number;
  reason: string;
  performedBy: string;
}
