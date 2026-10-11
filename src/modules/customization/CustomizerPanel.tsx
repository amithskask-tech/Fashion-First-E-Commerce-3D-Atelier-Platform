import React, { useState } from 'react';
import {
  Fabric,
  CustomizationOption,
  OptionCategory,
  OptionCompatibilityRule,
  DesignSelectionState,
  PriceBreakdown
} from '../../types';
import {
  applyOptionSelection,
  duplicateDesign
} from './compatibilityEngine';
import { formatCurrency } from '../pricing/pricingEngine';
import { Check, AlertCircle, Sparkles, Copy, Layers } from 'lucide-react';

interface CustomizerPanelProps {
  fabrics: Fabric[];
  options: CustomizationOption[];
  rules: OptionCompatibilityRule[];
  designState: DesignSelectionState;
  pricing: PriceBreakdown;
  onDesignChange: (newState: DesignSelectionState) => void;
  onSelectFabric: (fabricId: string) => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  fabrics,
  options,
  rules,
  designState,
  pricing,
  onDesignChange,
  onSelectFabric
}) => {
  const [activeTab, setActiveTab] = useState<'fabric' | OptionCategory>('fabric');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoNotice, setAutoNotice] = useState<string | null>(null);

  const categories: Array<{ key: OptionCategory; label: string }> = [
    { key: 'collar', label: 'Collar' },
    { key: 'cuff', label: 'Cuffs' },
    { key: 'sleeve', label: 'Sleeves' },
    { key: 'placket', label: 'Front Placket' },
    { key: 'pocket', label: 'Pocket' },
    { key: 'buttons', label: 'Buttons' },
    { key: 'back_pleat', label: 'Back Pleat' },
    { key: 'hem', label: 'Hemline' }
  ];

  const handleOptionSelect = (category: OptionCategory, optionId: string) => {
    setErrorMessage(null);
    setAutoNotice(null);

    const result = applyOptionSelection(
      designState,
      category,
      optionId,
      options,
      rules
    );

    if (result.errors.length > 0) {
      setErrorMessage(result.errors[0]);
      return;
    }

    if (result.appliedAutoCorrections.length > 0) {
      const correction = result.appliedAutoCorrections[0];
      const opt = options.find((o) => o.id === correction.newOptionId);
      setAutoNotice(
        `Auto-adjusted ${correction.category} to "${opt?.name}": ${correction.reason}`
      );
    }

    onDesignChange(result.newState);
  };

  const handleDuplicate = () => {
    const cloned = duplicateDesign(designState);
    onDesignChange(cloned);
    setAutoNotice('Design duplicated into new revision.');
  };

  const activeOptions = options.filter(
    (o) => activeTab !== 'fabric' && o.category === activeTab && o.isActive
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Top Banner: Price & Version */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Estimated Total
          </span>
          <span className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(pricing.totalCents, pricing.currency)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
            Rev {designState.version}
          </span>
          <button
            onClick={handleDuplicate}
            title="Duplicate Design"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1 scrollbar-none">
        <button
          onClick={() => {
            setActiveTab('fabric');
            setErrorMessage(null);
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition flex items-center gap-1.5 ${
            activeTab === 'fabric'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fabric
        </button>

        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setActiveTab(c.key);
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition ${
              activeTab === c.key
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="m-3 p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Incompatible Selection</strong>
            {errorMessage}
          </div>
        </div>
      )}

      {autoNotice && (
        <div className="m-3 p-3 bg-sky-950/40 border border-sky-800 rounded-xl text-xs text-sky-200 flex items-start gap-2">
          <Layers className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>{autoNotice}</div>
        </div>
      )}

      {/* Selection Options List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'fabric' ? (
          <div className="grid grid-cols-1 gap-3">
            {fabrics.map((f) => {
              const isSelected = designState.fabricId === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFabric(f.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-md ring-1 ring-sky-500'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color Swatch */}
                    <div
                      className="w-10 h-10 rounded-lg border border-slate-700 shadow-inner shrink-0"
                      style={{ backgroundColor: f.colorHex }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {f.name}
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {f.materialComposition} • {f.weaveType}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300 block">
                      {f.surchargeCents > 0
                        ? `+${formatCurrency(f.surchargeCents, 'USD')}`
                        : 'Included'}
                    </span>
                    <span className="text-[10px] text-emerald-400">In Stock</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {activeOptions.map((opt) => {
              const isSelected = designState.selections[activeTab] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleOptionSelect(activeTab, opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-md ring-1 ring-sky-500'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      {opt.name}
                      {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                    </h4>
                    {opt.description && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-semibold text-slate-300">
                      {opt.surchargeCents > 0
                        ? `+${formatCurrency(opt.surchargeCents, 'USD')}`
                        : 'Included'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
