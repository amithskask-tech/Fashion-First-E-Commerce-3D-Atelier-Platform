import React, { useState } from 'react';
import { Order, OrderStatus, ProductionSpec, UserRole } from '../../types';
import { formatCurrency } from '../pricing/pricingEngine';
import { ALLOWED_STATUS_TRANSITIONS, validateStatusTransition } from './orderStateMachine';
import {
  FileText,
  Download,
  Printer,
  ChevronRight,
  Clock,
  AlertCircle,
  Package,
  Layers,
  Scissors
} from 'lucide-react';

interface OrderHistoryViewProps {
  orders: Order[];
  userRole: UserRole;
  onUpdateStatus: (orderId: string, toStatus: OrderStatus) => Promise<void>;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  userRole,
  onUpdateStatus
}) => {
  const [selectedSpec, setSelectedSpec] = useState<ProductionSpec | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const statusColors: Record<OrderStatus, string> = {
    draft: 'bg-slate-700 text-slate-300',
    confirmed: 'bg-blue-900/60 text-blue-300 border-blue-700',
    accepted_production: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
    in_production: 'bg-amber-900/60 text-amber-300 border-amber-700',
    quality_check: 'bg-purple-900/60 text-purple-300 border-purple-700',
    ready_dispatch: 'bg-cyan-900/60 text-cyan-300 border-cyan-700',
    completed: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    cancelled: 'bg-red-900/60 text-red-300 border-red-700',
    rejected: 'bg-rose-900/60 text-rose-300 border-rose-700'
  };

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    setTransitionError(null);
    const check = validateStatusTransition(order.status, nextStatus, userRole);
    if (!check.canTransition) {
      setTransitionError(check.reason || 'Invalid transition');
      return;
    }
    await onUpdateStatus(order.id, nextStatus);
  };

  const handleDownloadJson = (spec: ProductionSpec) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(spec, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${spec.specNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (orders.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-xl">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
        <p className="text-sm text-slate-400 mt-1">
          Customize your shirt in the 3D Studio and submit your design to view live order tracking and production tech packs.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Role Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs text-slate-300">
            Current Operator Role: <strong className="text-white uppercase">{userRole}</strong>
          </span>
        </div>
        <span className="text-xs text-slate-400">
          State Machine enforcement active
        </span>
      </div>

      {transitionError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{transitionError}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const item = order.items?.[0];
          const spec = item?.productionSpec;
          const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status] || [];

          return (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">
                      {order.orderNumber}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      statusColors[order.status]
                    } uppercase tracking-wider`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    {formatCurrency(order.totalPriceCents, order.currency)}
                  </span>
                </div>
              </div>

              {/* Order Item Snapshot Summary */}
              {item && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Fabric
                    </span>
                    <span className="font-semibold text-white">
                      {item.designSnapshot.design.fabric.name}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {item.designSnapshot.design.fabric.weaveType} • {item.designSnapshot.design.fabric.colorName}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                      Selected Sizing
                    </span>
                    <span className="font-semibold text-white">
                      Size: {item.designSnapshot.recommendedSize}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Chest: {item.designSnapshot.calculatedGarmentMeasurements.chestMm}mm • Sleeve: {item.designSnapshot.calculatedGarmentMeasurements.sleeveLengthMm}mm
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {spec && (
                      <button
                        onClick={() => setSelectedSpec(spec)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 rounded-lg text-xs font-semibold transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Tech Pack
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Lifecycle Progression Actions (Simulation Bar) */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400">
                  Allowed Next Transitions:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {allowedNext.length === 0 ? (
                    <span className="text-xs text-slate-500 font-medium italic">
                      Lifecycle completed / terminal state
                    </span>
                  ) : (
                    allowedNext.map((next) => (
                      <button
                        key={next}
                        onClick={() => handleAdvanceStatus(order, next)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-sky-500 transition capitalize flex items-center gap-1"
                      >
                        <span>Move to: {next.replace(/_/g, ' ')}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Tech Pack Modal */}
      {selectedSpec && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-sky-400" />
                  {selectedSpec.specNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Factory Cut & Assembly Specification • PII Redacted ({selectedSpec.customerRef})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadJson(selectedSpec)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  title="Download JSON Spec"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  title="Print Specification"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSpec(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Spec Document Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 print:text-black">
              {/* Header Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Garment</span>
                  <strong className="text-white font-medium">{selectedSpec.garmentType}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Client Ref</span>
                  <strong className="text-white font-medium font-mono">{selectedSpec.customerRef}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Seam Allowance</span>
                  <strong className="text-white font-medium">{selectedSpec.cutDimensions.seamAllowanceMm} mm (1/2")</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Cut Tolerance</span>
                  <strong className="text-emerald-400 font-medium">±8 mm</strong>
                </div>
              </div>

              {/* Cut Dimensions Table */}
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2">
                  1. Component Cut Dimensions (Millimetres)
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2.5">Pattern Piece</th>
                        <th className="p-2.5">Cut Dimension (incl. allowances)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr><td className="p-2">Chest (Half-panel cut)</td><td className="p-2 text-white">{selectedSpec.cutDimensions.chestCutMm} mm</td></tr>
                      <tr><td className="p-2">Waist (Half-panel cut)</td><td className="p-2 text-white">{selectedSpec.cutDimensions.waistCutMm} mm</td></tr>
                      <tr><td className="p-2">Hips (Half-panel cut)</td><td className="p-2 text-white">{selectedSpec.cutDimensions.hipCutMm} mm</td></tr>
                      <tr><td className="p-2">Collar Band Length</td><td className="p-2 text-white">{selectedSpec.cutDimensions.collarCutMm} mm</td></tr>
                      <tr><td className="p-2">Shoulder Width</td><td className="p-2 text-white">{selectedSpec.cutDimensions.shoulderCutMm} mm</td></tr>
                      <tr><td className="p-2">Sleeve Length Cut</td><td className="p-2 text-white">{selectedSpec.cutDimensions.sleeveCutMm} mm</td></tr>
                      <tr><td className="p-2">Shirt Total Length (incl. hem)</td><td className="p-2 text-white">{selectedSpec.cutDimensions.shirtLengthCutMm} mm</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill of Materials */}
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2">
                  2. Bill of Materials (BOM)
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5">Specification</th>
                        <th className="p-2.5">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedSpec.billOfMaterials.map((bom, i) => (
                        <tr key={i}>
                          <td className="p-2 font-semibold text-white">{bom.item}</td>
                          <td className="p-2 text-slate-300">{bom.spec}</td>
                          <td className="p-2 font-mono text-sky-400">{bom.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tailoring & Construction Instructions */}
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2">
                  3. Assembly & Construction Guide
                </h4>
                <ul className="space-y-1.5 list-disc list-inside bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedSpec.constructionInstructions.map((ins, i) => (
                    <li key={i} className="text-slate-300 leading-relaxed">
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
