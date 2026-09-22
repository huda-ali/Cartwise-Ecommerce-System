import React from 'react';
import { Truck, RotateCcw, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/DesignSystem';

export const ShippingPolicyPage: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <button
        onClick={() => setCurrentView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Storefront
      </button>

      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          Shipping &amp; Delivery Commitments
        </h1>
        <p className="text-xs text-slate-400">Effective Date: Spring 2026</p>
      </div>

      <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            1. Carbon-Neutral Ground Logistics
          </h2>
          <p>
            All Cartwise domestic orders exceed a $100 threshold receive complimentary Carbon-Neutral Ground Shipping via FedEx Priority. Shipments depart our Oakland fulfillment center within 24 hours of verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            2. Delivery Speeds &amp; Tiers
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Complimentary Ground:</strong> 3–5 business days ($0.00 on orders &gt; $100).</li>
            <li><strong>Express Courier:</strong> 2 business days ($18.00).</li>
            <li><strong>Overnight Priority:</strong> Next business day delivery ($35.00).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            3. Tracking &amp; Delivery Confirmation
          </h2>
          <p>
            As soon as your shipment is scanned into the courier depot, a verified tracking number is appended to your account order history and delivered via email.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ReturnPolicyPage: React.FC = () => {
  const { setCurrentView } = useStore();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <button
        onClick={() => setCurrentView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Storefront
      </button>

      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          30-Day Studio Trial &amp; Returns
        </h1>
        <p className="text-xs text-slate-400">Effective Date: Spring 2026</p>
      </div>

      <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            1. Hassle-Free 30-Day Audition
          </h2>
          <p>
            We want you to experience our acoustic headphones and solid walnut desk gear in your real workspace. If a product does not harmonize with your ergonomics, initiate a prepaid return within 30 days of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            2. Condition Guidelines
          </h2>
          <p>
            Items should be in original, undamaged cosmetic condition with all accessories, cables, and packaging intact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 font-heading">
            3. Instant Refunds
          </h2>
          <p>
            Once inspected by our workshop team, refunds are issued back to the original payment method within 2 business days.
          </p>
        </section>
      </div>
    </div>
  );
};
