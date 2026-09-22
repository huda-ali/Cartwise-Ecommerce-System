import React, { useState } from 'react';
import {
  Check,
  CreditCard,
  Banknote,
  Truck,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Address, ShippingMethodOption, PaymentMethod, Order } from '../../types';
import { SHIPPING_METHODS } from '../../data/mockData';
import { Button, Badge } from '../common/DesignSystem';

type CheckoutStep =
  | 'review-cart'
  | 'shipping-address'
  | 'shipping-method'
  | 'payment-method'
  | 'review-order'
  | 'payment'
  | 'confirmation';

export const MultiStepCheckout: React.FC = () => {
  const { cartItems, subtotal, discount, appliedCoupon, clearCart } = useCart();
  const { createOrder, setCurrentView, navigateToOrderDetails } = useStore();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review-cart');

  // Checkout Form State
  const [selectedAddress, setSelectedAddress] = useState<Address>(() => {
    return (
      user?.addresses.find((a) => a.isDefaultShipping) ||
      user?.addresses[0] || {
        id: 'addr-new',
        fullName: user?.name || 'Alex Taylor',
        street: '450 Townsend St',
        apartment: 'Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
        phone: user?.phone || '+1 (415) 890-2341',
        isDefaultShipping: true,
      }
    );
  });

  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethodOption>(
    SHIPPING_METHODS[0]
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');

  // Credit Card Form (mock simulated processing, not stored)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('882');
  const [cardName, setCardName] = useState(user?.name || 'Alex Taylor');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Placed Order result
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Totals calculations based on selected shipping method
  const shippingCost = selectedShippingMethod.price;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.0825).toFixed(2));
  const grandTotal = Number((taxableAmount + shippingCost + tax).toFixed(2));

  // Stepper definition
  const STEPS: { id: CheckoutStep; label: string; number: number }[] = [
    { id: 'review-cart', label: 'Cart', number: 1 },
    { id: 'shipping-address', label: 'Address', number: 2 },
    { id: 'shipping-method', label: 'Shipping', number: 3 },
    { id: 'payment-method', label: 'Payment Method', number: 4 },
    { id: 'review-order', label: 'Review', number: 5 },
    { id: 'payment', label: 'Pay', number: 6 },
    { id: 'confirmation', label: 'Confirmation', number: 7 },
  ];

  const currentStepNumber = STEPS.find((s) => s.id === currentStep)?.number || 1;

  const handleExecutePayment = () => {
    if (!user) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const orderItems = cartItems.map((ci) => ({
        productId: ci.productId,
        variantId: ci.variantId,
        productTitle: ci.productTitle,
        variantTitle: ci.variantTitle,
        attributes: ci.attributes,
        productImage: ci.productImage,
        price: ci.price,
        quantity: ci.quantity,
      }));

      const newOrder = createOrder({
        items: orderItems,
        shippingAddress: selectedAddress,
        shippingMethod: selectedShippingMethod,
        paymentMethod: selectedPaymentMethod,
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        shippingCost,
        tax,
        total: grandTotal,
        customer: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

      setConfirmedOrder(newOrder);
      clearCart();
      setIsProcessingPayment(false);
      setCurrentStep('confirmation');
    }, 1200);
  };

  /* =========================================================================
     STEP 7: ORDER CONFIRMATION SUCCESS VIEW
     ========================================================================= */
  if (currentStep === 'confirmation' && confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Payment Verified &amp; Confirmed
          </span>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            Thank you for your order, {confirmedOrder.customer.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your order confirmation has been sent to{' '}
            <span className="font-semibold text-slate-700">{confirmedOrder.customer.email}</span>.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
            <div>
              <p className="text-xs text-slate-400">Order Number</p>
              <p className="text-lg font-mono font-bold text-slate-900">
                {confirmedOrder.orderNumber}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-slate-400">Estimated Delivery Date</p>
              <p className="text-sm font-bold text-indigo-600">
                {confirmedOrder.estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Purchased Items
            </h3>
            <div className="divide-y divide-slate-100">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.productTitle}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.variantTitle} &times; {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-700 block mb-1">Delivery Destination</span>
              <p className="text-slate-600">{confirmedOrder.shippingAddress.fullName}</p>
              <p className="text-slate-500">{confirmedOrder.shippingAddress.street}</p>
              <p className="text-slate-500">
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}{' '}
                {confirmedOrder.shippingAddress.postalCode}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-700 block mb-1">Payment &amp; Logistics</span>
              <p className="text-slate-600">
                Method:{' '}
                <span className="font-semibold">
                  {confirmedOrder.paymentMethod === 'CARD' ? 'Credit Card (Visa)' : 'Cash on Delivery'}
                </span>
              </p>
              <p className="text-slate-600">
                Tier: <span className="font-semibold">{confirmedOrder.shippingMethod.name}</span>
              </p>
              <p className="text-slate-900 font-bold font-mono mt-1">
                Total Paid: ${confirmedOrder.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              &larr; Continue Shopping
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigateToOrderDetails(confirmedOrder.id, true)}
              icon={Package}
            >
              Track Order Progress
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     MULTI-STEP CHECKOUT WIZARD
     ========================================================================= */
  return (
    <div className="space-y-8 pb-16">
      {/* Back button & Page title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Step {currentStepNumber} of 6
        </span>
      </div>

      {/* Modern Multi-Step Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto">
          {STEPS.slice(0, 6).map((s, idx) => {
            const isDone = currentStepNumber > s.number;
            const isCurrent = currentStepNumber === s.number;

            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                  </div>
                  <span
                    className={`text-xs font-medium hidden md:inline ${
                      isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 5 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 min-w-4 transition-colors ${
                      currentStepNumber > s.number ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Step Content + Live Sticky Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Step Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* STEP 1: REVIEW CART */}
          {currentStep === 'review-cart' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  1. Review Cart Items
                </h2>
                <p className="text-xs text-slate-500">
                  Verify selected variants and quantities before entering destination
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.productTitle}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.variantTitle} &middot; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep('shipping-address')}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Continue to Address
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {currentStep === 'shipping-address' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  2. Select Shipping Destination
                </h2>
                <p className="text-xs text-slate-500">
                  Where should we dispatch your precision workspace gear?
                </p>
              </div>

              {/* Saved Addresses List */}
              <div className="space-y-3">
                {user?.addresses.map((addr) => {
                  const isSelected = selectedAddress.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        {addr.isDefaultShipping && <Badge size="sm">Default</Badge>}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {addr.street} {addr.apartment && `, ${addr.apartment}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {addr.city}, {addr.state} {addr.postalCode} &middot; {addr.phone}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('review-cart')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep('shipping-method')}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Continue to Shipping Method
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SHIPPING METHOD */}
          {currentStep === 'shipping-method' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  3. Select Delivery Speed
                </h2>
                <p className="text-xs text-slate-500">
                  Choose dispatch priority and tracking tier
                </p>
              </div>

              <div className="space-y-3">
                {SHIPPING_METHODS.map((sm) => {
                  const isSelected = selectedShippingMethod.id === sm.id;
                  return (
                    <div
                      key={sm.id}
                      onClick={() => setSelectedShippingMethod(sm)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sm.name}</span>
                          <span className="text-[11px] font-semibold text-indigo-600">
                            ({sm.estimatedDays})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{sm.description}</p>
                      </div>

                      <span className="text-sm font-mono font-bold text-slate-900">
                        {sm.price === 0 ? 'FREE' : `$${sm.price.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('shipping-address')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep('payment-method')}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT METHOD */}
          {currentStep === 'payment-method' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  4. Select Payment Method
                </h2>
                <p className="text-xs text-slate-500">
                  All transactions are encrypted with bank-grade 256-bit SSL
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedPaymentMethod('CARD')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer text-center space-y-2 transition-all ${
                    selectedPaymentMethod === 'CARD'
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto text-indigo-600" />
                  <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                  <p className="text-[11px] text-slate-500">Visa, Mastercard, Amex</p>
                </div>

                <div
                  onClick={() => setSelectedPaymentMethod('COD')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer text-center space-y-2 transition-all ${
                    selectedPaymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-6 h-6 mx-auto text-slate-700" />
                  <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-[11px] text-slate-500">Pay courier upon delivery</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('shipping-method')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep('review-order')}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Review Order Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW ORDER */}
          {currentStep === 'review-order' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  5. Final Order Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Please confirm destination and options before initiating authorization
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Shipping Address</span>
                    <p className="text-slate-900 font-medium">{selectedAddress.fullName}</p>
                    <p className="text-slate-600">{selectedAddress.street}</p>
                    <p className="text-slate-500">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('shipping-address')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Delivery Tier</span>
                    <p className="text-slate-900 font-medium">{selectedShippingMethod.name}</p>
                    <p className="text-slate-500">{selectedShippingMethod.estimatedDays}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('shipping-method')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Payment Selection</span>
                    <p className="text-slate-900 font-medium">
                      {selectedPaymentMethod === 'CARD'
                        ? 'Credit Card Payment'
                        : 'Cash on Delivery (Pay upon arrival)'}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('payment-method')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('payment-method')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep('payment')}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: PAYMENT EXECUTION */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  6. Authorize Payment
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedPaymentMethod === 'CARD'
                    ? 'Enter card details to complete tokenized authorization'
                    : 'Confirm cash on delivery order dispatch'}
                </p>
              </div>

              {selectedPaymentMethod === 'CARD' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs p-3 pl-10 rounded-xl border border-slate-200 font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Cash on Delivery Notice</p>
                  <p>
                    Please ensure the exact amount of{' '}
                    <span className="font-mono font-bold">${grandTotal.toFixed(2)}</span> is available
                    at your doorstep upon courier arrival.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('review-order')}
                  disabled={isProcessingPayment}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleExecutePayment}
                  isLoading={isProcessingPayment}
                >
                  Authorize &middot; ${grandTotal.toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky Live Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 font-heading pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Micro items list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 max-w-[200px] truncate">
                    <span className="font-bold text-slate-800 truncate">{item.productTitle}</span>
                    <span className="text-slate-400">&times; {item.quantity}</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({selectedShippingMethod.name.split(' ')[0]})</span>
                <span className="font-mono">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.25%)</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200 font-heading">
                <span>Total</span>
                <span className="font-mono">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Certified 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
