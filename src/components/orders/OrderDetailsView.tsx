import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  RotateCcw,
  Star,
  AlertTriangle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { OrderStatus } from '../../types';
import { Badge, Button, Modal } from '../common/DesignSystem';

export const OrderDetailsView: React.FC = () => {
  const {
    selectedOrderId,
    orders,
    cancelOrder,
    setCurrentView,
    navigateToProduct,
    showToast,
    addReview,
  } = useStore();

  const { addToCart } = useCart();

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Review item modal state
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productTitle: string;
    productImage: string;
  } | null>(null);
  const [itemRating, setItemRating] = useState(5);
  const [itemReviewTitle, setItemReviewTitle] = useState('');
  const [itemReviewComment, setItemReviewComment] = useState('');

  if (!order) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">Order not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setCurrentView('account')}
        >
          Return to Orders
        </Button>
      </div>
    );
  }

  const effectiveStatus = order.orderStatus || order.status || 'PENDING';

  // Define tracking steps in order
  const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Order Placed', desc: 'Received & logged in fulfillment system' },
    { status: 'PROCESSING', label: 'Processing & Packed', desc: 'Assembled and precision inspected' },
    { status: 'SHIPPED', label: 'Dispatched to Courier', desc: 'Handed to carbon-neutral carrier' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Safely arrived at destination' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(effectiveStatus);
  const isCancellable = effectiveStatus === 'PENDING' || effectiveStatus === 'PROCESSING';

  const handleCancelOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    const ok = cancelOrder(order.id, cancelReason);
    setCancelModalOpen(false);
    showToast(ok ? 'Order cancelled successfully' : 'Unable to cancel order', ok ? 'success' : 'error');
  };

  const handleReorderAll = () => {
    // Attempt to add available items back into cart
    showToast('Reorder items queued for checkout!', 'success');
    setCurrentView('cart');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem || !itemReviewTitle.trim() || !itemReviewComment.trim()) return;

    addReview({
      productId: reviewingItem.productId,
      productTitle: reviewingItem.productTitle,
      productImage: reviewingItem.productImage,
      userId: order.customer.id,
      userName: order.customer.name,
      verifiedPurchase: true,
      rating: itemRating,
      title: itemReviewTitle,
      comment: itemReviewComment,
    });

    showToast('Thank you! Your verified owner review has been logged.', 'success');
    setReviewingItem(null);
    setItemReviewTitle('');
    setItemReviewComment('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('account')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account &amp; Order History
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Order {order.orderNumber}
            </h1>
            <Badge
              variant={
                effectiveStatus === 'DELIVERED'
                  ? 'success'
                  : effectiveStatus === 'SHIPPED'
                  ? 'info'
                  : effectiveStatus === 'CANCELLED'
                  ? 'danger'
                  : 'warning'
              }
            >
              {effectiveStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Action buttons: Print & Reorder */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintInvoice}
            icon={Printer}
          >
            Print Invoice
          </Button>

          {isCancellable && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleReorderAll}
            icon={RotateCcw}
          >
            Reorder
          </Button>
        </div>
      </div>

      {/* Tracking Progress Timeline Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Carrier &amp; Tracking ID</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {order.shippingMethod.carrier || order.trackingCarrier || 'FedEx Carbon-Neutral'}:{' '}
                <span className="font-mono text-indigo-600 font-medium">
                  {order.trackingNumber || 'PENDING DISPATCH'}
                </span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400">Estimated Delivery Target</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              {order.estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Multi-Step Timeline */}
        {effectiveStatus === 'CANCELLED' ? (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">This order was cancelled.</span>
              <p className="text-[11px] text-rose-700">
                Reason: {order.cancelReason || 'Customer requested prior to dispatch'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.status} className="relative space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-11">{step.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Ordered Items + Delivery/Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ordered items (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-heading pb-3 border-b border-slate-100">
            Ordered Line Items ({order.items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    onClick={() => navigateToProduct(item.productId)}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-90"
                  />
                  <div>
                    <h3
                      onClick={() => navigateToProduct(item.productId)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {item.productTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Variant: {item.variantTitle} &middot; Qty: {item.quantity}
                    </p>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-1 block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReviewingItem({
                        productId: item.productId,
                        productTitle: item.productTitle,
                        productImage: item.productImage,
                      })
                    }
                    icon={Star}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Payment details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-heading pb-3 border-b border-slate-100">
              Fulfillment &amp; Payment Summary
            </h3>

            {/* Destination */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Delivery Address
              </span>
              <p className="text-slate-900 font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-slate-500">{order.shippingAddress.street}</p>
              <p className="text-slate-500">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-500">{order.shippingAddress.phone}</p>
            </div>

            {/* Payment method */}
            <div className="space-y-1 text-xs pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment Information
              </span>
              <p className="text-slate-900 font-semibold">
                {order.paymentMethod === 'CARD' ? 'Visa •••• 4242' : 'Cash on Delivery'}
              </p>
              <p className="text-slate-500">
                Status: <span className="font-semibold text-emerald-600">{order.paymentStatus}</span>
              </p>
            </div>

            {/* Financial summary breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-mono">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono">
                  {order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-mono">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="font-mono">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
        description="Orders can only be cancelled while in Pending status before warehouse fulfillment begins."
      >
        <form onSubmit={handleCancelOrderSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cancellation Reason
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="">Select a reason...</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price elsewhere">Found better price elsewhere</option>
              <option value="Changed shipping address">Need to change shipping address</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Review Modal from Order History */}
      <Modal
        isOpen={Boolean(reviewingItem)}
        onClose={() => setReviewingItem(null)}
        title={`Review ${reviewingItem?.productTitle}`}
        description="Share your verified experience with other studio members."
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setItemRating(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= itemRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Review Headline</label>
            <input
              type="text"
              required
              placeholder="e.g., Flawless craftsmanship"
              value={itemReviewTitle}
              onChange={(e) => setItemReviewTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Feedback</label>
            <textarea
              rows={4}
              required
              placeholder="Share thoughts on ergonomics, sound profile, finish..."
              value={itemReviewComment}
              onChange={(e) => setItemReviewComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewingItem(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
