import React, { useState, useEffect, useMemo } from 'react';
import {
  GarmentType,
  Fabric,
  CustomizationOption,
  OptionCompatibilityRule,
  GarmentMeasurementsGrading,
  SizeEaseRule,
  UserProfile,
  BodyProfile,
  BodyMeasurements,
  DesignSelectionState,
  Order,
  OrderStatus,
  UserRole
} from './types';
import { repository } from './lib/storage/repository';
import { isSupabaseConfigured } from './lib/supabase/client';
import { createDefaultDesignSelections } from './modules/customization/compatibilityEngine';
import { calculateFinishedGarmentMeasurements, recommendStandardSize } from './modules/sizing/sizingEngine';
import { calculatePrice } from './modules/pricing/pricingEngine';
import { generateProductionSpec } from './modules/production/techPackGenerator';
import { GarmentCanvas } from './modules/visualization/GarmentCanvas';
import { CustomizerPanel } from './modules/customization/CustomizerPanel';
import { MeasurementsForm } from './modules/measurements/MeasurementsForm';
import { DesignConfirmationModal } from './modules/designs/DesignConfirmationModal';
import { OrderHistoryView } from './modules/orders/OrderHistoryView';
import {
  Sparkles,
  Ruler,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  Database,
  UserCheck
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'studio' | 'measurements' | 'orders'>('studio');

  // Loaded Catalog Data
  const [garmentType, setGarmentType] = useState<GarmentType | null>(null);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [rules, setRules] = useState<OptionCompatibilityRule[]>([]);
  const [gradingChart, setGradingChart] = useState<GarmentMeasurementsGrading[]>([]);
  const [easeRules, setEaseRules] = useState<SizeEaseRule[]>([]);

  // Customer State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');

  // Customization & Design State
  const [designState, setDesignState] = useState<DesignSelectionState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals & UI Banners
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Data
  useEffect(() => {
    async function init() {
      try {
        const types = await repository.getGarmentTypes();
        const loadedFabrics = await repository.getFabrics();
        const loadedOptions = await repository.getCustomizationOptions();
        const loadedRules = await repository.getCompatibilityRules();
        const loadedGrading = await repository.getGradingChart();
        const loadedEase = await repository.getEaseRules();
        const profile = await repository.getCurrentProfile();
        const bodyProfiles = await repository.getBodyProfiles(profile.id);
        const activeBodyProfile = bodyProfiles[0];
        const loadedMeasurements = await repository.getBodyMeasurements(activeBodyProfile.id);
        const loadedOrders = await repository.getOrders(profile.id);

        setGarmentType(types[0]);
        setFabrics(loadedFabrics);
        setOptions(loadedOptions);
        setRules(loadedRules);
        setGradingChart(loadedGrading);
        setEaseRules(loadedEase);
        setUserProfile(profile);
        setUserRole(profile.role);
        setBodyProfile(activeBodyProfile);
        setMeasurements(loadedMeasurements);
        setOrders(loadedOrders);

        // Initialize design selections
        const initialDesign = createDefaultDesignSelections(
          types[0].id,
          loadedFabrics[0].id,
          loadedOptions
        );
        setDesignState(initialDesign);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Active Fabric
  const activeFabric = useMemo(() => {
    if (!fabrics.length || !designState) return null;
    return fabrics.find((f) => f.id === designState.fabricId) || fabrics[0];
  }, [fabrics, designState]);

  // Selected Options Map
  const selectedOptionsMap = useMemo(() => {
    if (!designState || !options.length) return {};
    const map: Record<string, CustomizationOption> = {};
    const optionById = new Map(options.map((o) => [o.id, o]));
    for (const [cat, id] of Object.entries(designState.selections)) {
      const opt = optionById.get(id);
      if (opt) map[cat] = opt;
    }
    return map;
  }, [designState, options]);

  // Calculated Finished Garment Dimensions
  const finishedMeasurements = useMemo(() => {
    if (!measurements || !bodyProfile || !easeRules.length) return undefined;
    return calculateFinishedGarmentMeasurements(
      measurements,
      bodyProfile.fitPreference,
      easeRules
    );
  }, [measurements, bodyProfile, easeRules]);

  // Size Recommendation
  const sizeRecommendation = useMemo(() => {
    if (!measurements || !bodyProfile || !gradingChart.length || !easeRules.length) return null;
    return recommendStandardSize(
      measurements,
      bodyProfile.fitPreference,
      gradingChart,
      easeRules
    );
  }, [measurements, bodyProfile, gradingChart, easeRules]);

  // Server-Authoritative Price Calculation
  const priceBreakdown = useMemo(() => {
    if (!designState || !activeFabric || !options.length) {
      return {
        basePriceCents: 11900,
        fabricSurchargeCents: 0,
        customizationSurchargeCents: 0,
        customFitSurchargeCents: 0,
        subtotalCents: 11900,
        taxCents: 0,
        totalCents: 11900,
        currency: 'USD',
        lineItems: [],
        appliedRuleVersion: 1
      };
    }
    return calculatePrice(designState, activeFabric, options, {
      basePriceCents: 11900,
      customFitSurchargeCents: 2000,
      isCustomFit: false,
      currency: 'USD'
    });
  }, [designState, activeFabric, options]);

  // Save Measurements Handler
  const handleSaveMeasurements = async (
    newMeasurements: BodyMeasurements,
    updatedProfile: BodyProfile
  ) => {
    const savedMeas = await repository.saveBodyMeasurements(newMeasurements);
    const savedProf = await repository.saveBodyProfile(updatedProfile);
    setMeasurements(savedMeas);
    setBodyProfile(savedProf);
  };

  // Place Order Transaction Handler
  const handleConfirmOrder = async (quantity: number) => {
    if (!userProfile || !garmentType || !activeFabric || !measurements || !finishedMeasurements || !sizeRecommendation || !designState) {
      return;
    }

    const orderId = crypto.randomUUID();
    const orderItemId = crypto.randomUUID();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randCode}`;

    // 1. Generate Immutable Production Spec
    const spec = generateProductionSpec({
      orderItemId,
      orderNumber,
      customerProfileId: userProfile.id,
      garmentName: garmentType.name,
      fabric: activeFabric,
      selectedOptions: Object.values(selectedOptionsMap),
      bodyMeasurements: measurements,
      finishedMeasurements,
      recommendedSize: sizeRecommendation.recommendedSize,
      fitPreference: bodyProfile?.fitPreference || 'regular',
      quantity
    });

    // 2. Build Order Record with Frozen Snapshots
    const newOrder: Order = {
      id: orderId,
      profileId: userProfile.id,
      orderNumber,
      status: 'confirmed',
      totalPriceCents: priceBreakdown.totalCents * quantity,
      currency: priceBreakdown.currency,
      idempotencyKey: `IDEM-${orderNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: orderItemId,
          quantity,
          unitPriceCents: priceBreakdown.totalCents,
          designSnapshot: {
            design: {
              garmentName: garmentType.name,
              fabric: activeFabric,
              options: Object.values(selectedOptionsMap).map((o) => ({
                category: o.category,
                name: o.name,
                code: o.code,
                surchargeCents: o.surchargeCents
              }))
            },
            measurements,
            calculatedGarmentMeasurements: finishedMeasurements,
            recommendedSize: sizeRecommendation.recommendedSize,
            pricing: priceBreakdown
          },
          productionSpec: spec
        }
      ]
    };

    // 3. Persist Order and Spec
    const placed = await repository.placeOrder(newOrder);
    setOrders((prev) => [placed, ...prev]);
    setIsConfirmationOpen(false);
    setOrderNotice(`Order ${placed.orderNumber} successfully confirmed! Production Tech Pack has been sealed.`);
    setActiveTab('orders');
  };

  // Update Status Handler (Simulation)
  const handleUpdateOrderStatus = async (orderId: string, toStatus: OrderStatus) => {
    const updated = await repository.updateOrderStatus(orderId, toStatus);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Custom Clothing Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                BESPOKE ATELIER
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
                Custom Men's Shirt V1 MVP
              </span>
            </div>
          </div>

          {/* Mode Badge & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-sky-950/60 border-sky-800 text-sky-300'
              }`}
            >
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Offline Mode (Zero-Cost)'}
            </span>

            {/* Role Switcher (Simulates Customer vs Staff for Lifecycle testing) */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setUserRole('customer')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                  userRole === 'customer'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                Customer
              </button>
              <button
                onClick={() => setUserRole('staff')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                  userRole === 'staff'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                Staff / Tailor
              </button>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'studio'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('measurements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'measurements'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Measurements</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Global Order Success Toast */}
      {orderNotice && (
        <div className="bg-emerald-950 border-b border-emerald-800 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {orderNotice}
          </span>
          <button
            onClick={() => setOrderNotice(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'studio' && activeFabric && designState && measurements && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] min-h-[620px]">
            {/* Left 7 Columns: 3D Studio Canvas */}
            <div className="lg:col-span-7 h-full flex flex-col">
              <div className="flex-1 h-full min-h-[460px]">
                <GarmentCanvas
                  fabric={activeFabric}
                  selectedOptions={selectedOptionsMap}
                  bodyMeasurements={measurements}
                  garmentMeasurements={finishedMeasurements}
                />
              </div>
            </div>

            {/* Right 5 Columns: Customizer Controls */}
            <div className="lg:col-span-5 h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <CustomizerPanel
                  fabrics={fabrics}
                  options={options}
                  rules={rules}
                  designState={designState}
                  pricing={priceBreakdown}
                  onDesignChange={setDesignState}
                  onSelectFabric={(fId) =>
                    setDesignState((prev) => (prev ? { ...prev, fabricId: fId, version: prev.version + 1 } : null))
                  }
                />
              </div>

              {/* Bottom Order Call To Action */}
              <div className="pt-3">
                <button
                  onClick={() => setIsConfirmationOpen(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Review Design & Order Specification
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'measurements' && measurements && bodyProfile && (
          <MeasurementsForm
            initialMeasurements={measurements}
            activeProfile={bodyProfile}
            onSave={handleSaveMeasurements}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
            userRole={userRole}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Confirmation Modal */}
      {designState && activeFabric && measurements && bodyProfile && finishedMeasurements && sizeRecommendation && (
        <DesignConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirmOrder={handleConfirmOrder}
          designState={designState}
          fabric={activeFabric}
          options={options}
          measurements={measurements}
          profile={bodyProfile}
          finishedMeasurements={finishedMeasurements}
          sizeRec={sizeRecommendation}
          pricing={priceBreakdown}
        />
      )}
    </div>
  );
};

export default App;
