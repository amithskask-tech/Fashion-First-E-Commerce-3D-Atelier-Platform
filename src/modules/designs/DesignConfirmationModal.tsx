import React, { useState } from 'react';
import {
  Fabric,
  CustomizationOption,
  BodyMeasurements,
  BodyProfile,
  FinishedGarmentMeasurements,
  SizeRecommendation,
  PriceBreakdown,
  DesignSelectionState
} from '../../types';
import { formatCurrency } from '../pricing/pricingEngine';
import { formatLength } from '../measurements/units';
import { CheckCircle2, ShieldCheck, X, AlertTriangle } from 'lucide-react';

interface DesignConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (quantity: number) => Promise<void>;
  designState: DesignSelectionState;
  fabric: Fabric;
  options: CustomizationOption[];
  measurements: BodyMeasurements;
  profile: BodyProfile;
  finishedMeasurements: FinishedGarmentMeasurements;
  sizeRec: SizeRecommendation;
  pricing: PriceBreakdown;
}

export const DesignConfirmationModal: React.FC<DesignConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmOrder,
  designState,
  fabric,
  options,
  measurements,
  profile,
  finishedMeasurements,
  sizeRec,
  pricing
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const optionMap = new Map<string, CustomizationOption>(options.map((o) => [o.id, o]));
  const selectedList = Object.entries(designState.selections).map(([cat, id]) => ({
    category: cat,
    option: optionMap.get(id)
  }));

  const totalWithQuantity = pricing.totalCents * quantity;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmOrder(quantity);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Design & Manufacturing Specification Review
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review custom design, anatomical cut measurements, and price breakdown prior to order placement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Garment & Fabric */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold uppercase text-sky-400 tracking-wider">
                Fabric Specification
              </span>
              <h4 className="text-base font-bold text-white mt-1">{fabric.name}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {fabric.materialComposition}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                <span>Weave: {fabric.weaveType}</span>
                <span>•</span>
                <span>Color: {fabric.colorName}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold uppercase text-sky-400 tracking-wider">
                Fit & Sizing Recommendation
              </span>
              <div className="flex items-center justify-between mt-1">
                <h4 className="text-base font-bold text-white capitalize">
                  {profile.fitPreference} Fit Tailoring
                </h4>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Size: {sizeRec.recommendedSize}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Profile: {profile.profileName} (Rev {designState.version})
              </p>
              {sizeRec.warnings.length > 0 && (
                <div className="mt-2 p-2 bg-amber-950/40 border border-amber-800 rounded-lg text-[11px] text-amber-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{sizeRec.warnings[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Selected Customization Options */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Design Configuration Selections
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {selectedList.map(({ category, option }) => (
                <div
                  key={category}
                  className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800"
                >
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    {category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-slate-200 block truncate mt-0.5">
                    {option?.name || 'Default'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {option?.surchargeCents
                      ? `+${formatCurrency(option.surchargeCents, 'USD')}`
                      : 'Included'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Measurements Comparison (Body vs Finished Garment) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Tailoring Measurements Matrix (mm)
            </h4>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Anatomical Point</th>
                    <th className="py-2.5 px-3">Customer Body</th>
                    <th className="py-2.5 px-3">Garment Ease</th>
                    <th className="py-2.5 px-3">Finished Target Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-medium">Chest</td>
                    <td className="py-2 px-3 font-mono">{formatLength(measurements.chestCircMm, 'metric')}</td>
                    <td className="py-2 px-3 text-sky-400 font-mono">+{finishedMeasurements.chestMm - measurements.chestCircMm} mm</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono">{formatLength(finishedMeasurements.chestMm, 'metric')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Waist</td>
                    <td className="py-2 px-3 font-mono">{formatLength(measurements.waistCircMm, 'metric')}</td>
                    <td className="py-2 px-3 text-sky-400 font-mono">+{finishedMeasurements.waistMm - measurements.waistCircMm} mm</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono">{formatLength(finishedMeasurements.waistMm, 'metric')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Neck (Collar)</td>
                    <td className="py-2 px-3 font-mono">{formatLength(measurements.neckCircMm, 'metric')}</td>
                    <td className="py-2 px-3 text-sky-400 font-mono">+{finishedMeasurements.neckMm - measurements.neckCircMm} mm</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono">{formatLength(finishedMeasurements.neckMm, 'metric')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Sleeve Length</td>
                    <td className="py-2 px-3 font-mono">{formatLength(measurements.sleeveLengthMm, 'metric')}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono">Exact Cut</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono">{formatLength(finishedMeasurements.sleeveLengthMm, 'metric')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Shirt Length</td>
                    <td className="py-2 px-3 font-mono">{formatLength(measurements.shirtLengthMm, 'metric')}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono">Exact Cut</td>
                    <td className="py-2 px-3 font-semibold text-white font-mono">{formatLength(finishedMeasurements.shirtLengthMm, 'metric')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Server-Authoritative Price Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Server-Authoritative Price Breakdown
            </h4>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              {pricing.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-300">
                  <span>{item.description}</span>
                  <span className="font-mono">{formatCurrency(item.amountCents, pricing.currency)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Unit Subtotal</span>
                <span className="font-mono">{formatCurrency(pricing.totalCents, pricing.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Confirmation Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Quantity:</span>
            <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                -
              </button>
              <span className="px-3 py-1 bg-slate-900 text-white font-mono text-xs">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                +
              </button>
            </div>

            <div className="ml-4">
              <span className="text-xs text-slate-400 block">Final Order Total</span>
              <span className="text-xl font-black text-white font-mono">
                {formatCurrency(totalWithQuantity, pricing.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Back to Customizer
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Placing Order...' : 'Confirm & Generate Tech Pack'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
