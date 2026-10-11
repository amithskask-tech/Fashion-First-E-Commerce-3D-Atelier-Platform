import React from 'react';
import { CartItem } from '../../types';
import { formatCurrency } from '../pricing/pricingEngine';
import {
  X,
  ShoppingBag,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const totalPaise = cartItems.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0
  );

  const hasCustomItems = cartItems.some((item) => item.isCustom);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-slate-100">
                Shopping Bag ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">Your shopping bag is empty.</p>
                <p className="text-xs text-slate-400">
                  Explore our authentic Indian catalog or start a bespoke 3D design.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.isCustom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                            <Sparkles className="w-3 h-3" /> Made-To-Measure
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            Ready-to-Wear (Size: {item.sizeCode || 'M'})
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 font-serif">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Fabric: {item.fabricName}
                      </p>
                      {item.isCustom && item.customSummary && (
                        <p className="text-[11px] text-amber-400/90 leading-tight">
                          {item.customSummary}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">
                      Qty: <strong className="text-slate-200">{item.quantity}</strong>
                    </span>
                    <span className="font-bold text-slate-100 font-serif text-sm">
                      {formatCurrency(item.unitPricePaise * item.quantity, 'INR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-slate-950/80 border-t border-slate-800 space-y-4">
              {/* Dispatch Timeline Info */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {hasCustomItems
                    ? 'Bespoke items hand-tailored in 7–10 business days.'
                    : 'Ready-to-wear items dispatched within 24–48 hours.'}
                </span>
              </div>

              {/* Order Total */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPaise, 'INR')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Standard Insured Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800 font-serif">
                  <span>Grand Total</span>
                  <span className="text-amber-400 text-lg">
                    {formatCurrency(totalPaise, 'INR')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={onCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-risk tailoring guarantee with free measurement adjustments</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
