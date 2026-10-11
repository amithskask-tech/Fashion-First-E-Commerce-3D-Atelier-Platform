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
  UserRole,
  Product,
  CartItem,
  StandardSizeCode
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
import { CatalogBrowser } from './modules/catalog/CatalogBrowser';
import { CartDrawer } from './modules/cart/CartDrawer';
import {
  Sparkles,
  Ruler,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  Database,
  UserCheck,
  Compass,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation Tabs: catalog | studio | measurements | orders
  const [activeTab, setActiveTab] = useState<'catalog' | 'studio' | 'measurements' | 'orders'>('catalog');

  // Loaded Catalog & Products
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [garmentType, setGarmentType] = useState<GarmentType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [rules, setRules] = useState<OptionCompatibilityRule[]>([]);
  const [gradingChart, setGradingChart] = useState<GarmentMeasurementsGrading[]>([]);
  const [easeRules, setEaseRules] = useState<SizeEaseRule[]>([]);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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
        const loadedProducts = await repository.getProducts();
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
        const loadedCart = await repository.getCartItems();

        setGarmentTypes(types);
        setGarmentType(types[0]); // Men's Kurta default
        setProducts(loadedProducts);
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
        setCartItems(loadedCart);

        // Initialize design selections for primary Indian Kurta
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

  // Active Fabric in Customizer
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
    if (!measurements || !bodyProfile || !easeRules.length || !garmentType) return undefined;
    return calculateFinishedGarmentMeasurements(
      measurements,
      bodyProfile.fitPreference,
      easeRules,
      garmentType.id
    );
  }, [measurements, bodyProfile, easeRules, garmentType]);

  // Size Recommendation
  const sizeRecommendation = useMemo(() => {
    if (!measurements || !bodyProfile || !gradingChart.length || !easeRules.length || !garmentType) return null;
    return recommendStandardSize(
      measurements,
      bodyProfile.fitPreference,
      gradingChart,
      easeRules,
      garmentType.id
    );
  }, [measurements, bodyProfile, gradingChart, easeRules, garmentType]);

  // Pricing Calculation (Dual-currency: INR for Indian garments, USD for Western)
  const isIndianGarment = garmentType?.category !== 'western';
  const priceBreakdown = useMemo(() => {
    const currency = isIndianGarment ? 'INR' : 'USD';
    const basePriceCents = isIndianGarment ? 249900 : 11900;
    const customFitSurchargeCents = isIndianGarment ? 50000 : 2000;

    if (!designState || !activeFabric || !options.length) {
      return {
        basePriceCents,
        fabricSurchargeCents: 0,
        customizationSurchargeCents: 0,
        customFitSurchargeCents: 0,
        subtotalCents: basePriceCents,
        taxCents: 0,
        totalCents: basePriceCents,
        currency,
        lineItems: [],
        appliedRuleVersion: 1
      };
    }

    return calculatePrice(designState, activeFabric, options, {
      basePriceCents,
      customFitSurchargeCents,
      isCustomFit: true,
      currency,
      garmentName: garmentType?.name
    });
  }, [designState, activeFabric, options, isIndianGarment, garmentType]);

  // Switch Garment Type in 3D Studio
  const handleSwitchGarmentType = (targetType: GarmentType) => {
    setGarmentType(targetType);
    const suitableFabric = fabrics.find((f) =>
      f.suitableGarmentTypes?.includes(targetType.code)
    ) || fabrics[0];

    const newDesign = createDefaultDesignSelections(targetType.id, suitableFabric.id, options);
    setDesignState(newDesign);
  };

  // Launch 3D Customizer from Catalog Card
  const handleCustomizeFromCatalog = (product: Product) => {
    const targetType = garmentTypes.find((g) => g.id === product.garmentTypeId) || garmentTypes[0];
    const targetFabric = fabrics.find((f) => f.name.toLowerCase().includes(product.fabricName.toLowerCase())) || fabrics[0];

    setGarmentType(targetType);
    const newDesign = createDefaultDesignSelections(targetType.id, targetFabric.id, options);
    setDesignState(newDesign);
    setActiveTab('studio');
  };

  // Quick Add Ready-Made to Unified Cart
  const handleAddToCart = async (product: Product, sizeCode: StandardSizeCode) => {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      title: product.title,
      fabricName: product.fabricName,
      unitPricePaise: product.pricePaise,
      currency: 'INR',
      quantity: 1,
      isCustom: false,
      sizeCode
    };

    const updated = await repository.addToCart(newItem);
    setCartItems(updated);
    setIsCartOpen(true);
  };

  // Add Made-To-Measure Design from 3D Studio to Bag
  const handleAddCustomToBag = async () => {
    if (!garmentType || !activeFabric) return;

    const customSummary = Object.values(selectedOptionsMap)
      .map((o) => o.name)
      .slice(0, 3)
      .join(', ');

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      title: `${garmentType.name} (Bespoke)`,
      fabricName: activeFabric.name,
      unitPricePaise: priceBreakdown.totalCents,
      currency: priceBreakdown.currency,
      quantity: 1,
      isCustom: true,
      designState: designState || undefined,
      sizeCode: sizeRecommendation?.recommendedSize || 'M',
      customSummary: `${customSummary} • Tailored to ${bodyProfile?.fitPreference || 'regular'} fit`
    };

    const updated = await repository.addToCart(newItem);
    setCartItems(updated);
    setIsConfirmationOpen(false);
    setIsCartOpen(true);
  };

  // Remove Cart Item
  const handleRemoveCartItem = async (itemId: string) => {
    const updated = await repository.removeFromCart(itemId);
    setCartItems(updated);
  };

  // Save Measurements Handler
  const handleSaveMeasurements = async (
    newMeasurements: BodyMeasurements,
    updatedProfile: BodyProfile
  ) => {
    const savedMeas = await repository.saveBodyMeasurements(newMeasurements);
    const savedProf = await repository.saveBodyProfile(updatedProfile);
    setMeasurements(savedMeas);
    setBodyProfile(savedProf);
    setOrderNotice('Measurements successfully calibrated and saved to your profile.');
  };

  // Checkout Handler: Converts unified cart items into confirmed Orders & Tech Packs
  const handleCheckout = async () => {
    if (!userProfile || cartItems.length === 0) return;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `ORD-IN-${dateStr}-${randCode}`;

    let totalOrderCents = 0;
    const orderItems = cartItems.map((cartItem) => {
      totalOrderCents += cartItem.unitPricePaise * cartItem.quantity;
      const orderItemId = crypto.randomUUID();

      let productionSpec;
      if (cartItem.isCustom && measurements && finishedMeasurements && sizeRecommendation && activeFabric) {
        productionSpec = generateProductionSpec({
          orderItemId,
          orderNumber,
          customerProfileId: userProfile.id,
          garmentName: cartItem.title,
          fabric: activeFabric,
          selectedOptions: Object.values(selectedOptionsMap),
          bodyMeasurements: measurements,
          finishedMeasurements,
          recommendedSize: cartItem.sizeCode || sizeRecommendation.recommendedSize,
          fitPreference: bodyProfile?.fitPreference || 'regular',
          quantity: cartItem.quantity
        });
      }

      return {
        id: orderItemId,
        quantity: cartItem.quantity,
        unitPriceCents: cartItem.unitPricePaise,
        designSnapshot: {
          design: {
            garmentName: cartItem.title,
            fabric: activeFabric || fabrics[0],
            options: Object.values(selectedOptionsMap).map((o) => ({
              category: o.category,
              name: o.name,
              code: o.code,
              surchargeCents: o.surchargeCents
            }))
          },
          measurements: measurements || {} as any,
          calculatedGarmentMeasurements: finishedMeasurements || {} as any,
          recommendedSize: cartItem.sizeCode || 'M',
          pricing: priceBreakdown
        },
        productionSpec
      };
    });

    const newOrder: Order = {
      id: crypto.randomUUID(),
      profileId: userProfile.id,
      orderNumber,
      status: 'confirmed',
      totalPriceCents: totalOrderCents,
      currency: 'INR',
      idempotencyKey: `IDEM-${orderNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems
    };

    const placed = await repository.placeOrder(newOrder);
    await repository.clearCart();
    setCartItems([]);
    setIsCartOpen(false);
    setOrders((prev) => [placed, ...prev]);
    setOrderNotice(`Order ${placed.orderNumber} successfully placed! Tailoring specifications created.`);
    setActiveTab('orders');
  };

  // Update Status Handler (Simulation)
  const handleUpdateOrderStatus = async (orderId: string, toStatus: OrderStatus) => {
    const updated = await repository.updateOrderStatus(orderId, toStatus);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Indian Fashion Atelier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Luxury Navigation Bar */}
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 py-3">
          {/* Logo & Platform Name */}
          <div
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-black tracking-tight text-white leading-none">
                AURA ETHNICS
              </h1>
              <span className="text-[10px] tracking-widest text-amber-400 uppercase font-medium">
                Bespoke Indian Atelier
              </span>
            </div>
          </div>

          {/* Mode Badge & Role Switcher */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'Supabase Connected' : 'Zero-Cost Local Mode'}
            </span>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setUserRole('customer')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                  userRole === 'customer'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                Customer
              </button>
              <button
                onClick={() => setUserRole('staff')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                  userRole === 'staff'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                Master Tailor
              </button>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'catalog'
                    ? 'bg-amber-500 text-slate-950 shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Indian Catalog</span>
                <span className="sm:hidden">Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'studio'
                    ? 'bg-amber-500 text-slate-950 shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Customizer</span>
                <span className="sm:hidden">Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('measurements')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'measurements'
                    ? 'bg-amber-500 text-slate-950 shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Measurements</span>
                <span className="sm:hidden">Fit</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 shadow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders ({orders.length})</span>
              </button>
            </nav>

            {/* Shopping Bag Button with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-200 transition"
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 rounded-full text-[11px] font-black flex items-center justify-center shadow-lg">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
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

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: Indian Catalog Browser */}
        {activeTab === 'catalog' && (
          <CatalogBrowser
            products={products}
            onAddToCart={handleAddToCart}
            onCustomize3D={handleCustomizeFromCatalog}
          />
        )}

        {/* VIEW 2: 3D Studio & Customizer */}
        {activeTab === 'studio' && activeFabric && designState && measurements && garmentType && (
          <div className="space-y-4">
            {/* Garment Type Switcher in 3D Studio */}
            <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-slate-400 font-semibold mr-2 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Garment:
                </span>
                {garmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSwitchGarmentType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      garmentType.id === type.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span>Authentic drape simulation with procedural weaves</span>
              </div>
            </div>

            {/* 3D Canvas & Customizer Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-13rem)] min-h-[640px]">
              {/* Left 7 Columns: 3D Studio Canvas */}
              <div className="lg:col-span-7 h-full flex flex-col">
                <div className="flex-1 h-full min-h-[460px]">
                  <GarmentCanvas
                    garmentTypeCode={garmentType.code}
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
                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => setIsConfirmationOpen(true)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Review Specs
                  </button>

                  <button
                    onClick={handleAddCustomToBag}
                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span>Add Made-To-Measure to Bag</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Body Measurements */}
        {activeTab === 'measurements' && measurements && bodyProfile && (
          <MeasurementsForm
            initialMeasurements={measurements}
            activeProfile={bodyProfile}
            onSave={handleSaveMeasurements}
          />
        )}

        {/* VIEW 4: Order History & Tailor Tech Packs */}
        {activeTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
            userRole={userRole}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Confirmation Modal */}
      {designState && activeFabric && measurements && bodyProfile && finishedMeasurements && sizeRecommendation && garmentType && (
        <DesignConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirmOrder={() => handleAddCustomToBag()}
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

      {/* Slide-over Unified Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default App;
