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
  CustomerDesign,
  Order,
  ProductionSpec,
  ProductionEvent,
  OrderStatus,
  Product,
  CartItem
} from '../../types';
import {
  INITIAL_GARMENT_TYPES,
  INITIAL_FABRICS,
  INITIAL_OPTIONS,
  INITIAL_COMPATIBILITY_RULES,
  INITIAL_GRADING_CHART,
  INITIAL_EASE_RULES,
  INITIAL_PROFILE,
  INITIAL_BODY_PROFILES,
  INITIAL_BODY_MEASUREMENTS,
  INITIAL_PRODUCTS
} from './mockData';

class LocalRepository {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(`bespoke_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`bespoke_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }

  // Garment Catalog
  async getGarmentTypes(): Promise<GarmentType[]> {
    return this.getStorage('garment_types', INITIAL_GARMENT_TYPES);
  }

  async getFabrics(garmentTypeCode?: string): Promise<Fabric[]> {
    const all = this.getStorage('fabrics', INITIAL_FABRICS);
    if (!garmentTypeCode) return all;
    return all.filter((f) => !f.suitableGarmentTypes || f.suitableGarmentTypes.includes(garmentTypeCode));
  }

  async getCustomizationOptions(garmentTypeId?: string): Promise<CustomizationOption[]> {
    const all = this.getStorage('options', INITIAL_OPTIONS);
    if (!garmentTypeId) return all;
    return all.filter((o) => o.garmentTypeId === garmentTypeId);
  }

  async getCompatibilityRules(): Promise<OptionCompatibilityRule[]> {
    return this.getStorage('rules', INITIAL_COMPATIBILITY_RULES);
  }

  async getGradingChart(garmentTypeId?: string): Promise<GarmentMeasurementsGrading[]> {
    const all = this.getStorage('grading', INITIAL_GRADING_CHART);
    if (!garmentTypeId) return all;
    return all.filter((g) => g.garmentTypeId === garmentTypeId);
  }

  async getEaseRules(garmentTypeId?: string): Promise<SizeEaseRule[]> {
    const all = this.getStorage('ease', INITIAL_EASE_RULES);
    if (!garmentTypeId) return all;
    return all.filter((e) => e.garmentTypeId === garmentTypeId);
  }

  // Ready-Made Products
  async getProducts(filters?: {
    category?: string;
    gender?: string;
    occasion?: string;
    region?: string;
    search?: string;
  }): Promise<Product[]> {
    let prods = this.getStorage('products', INITIAL_PRODUCTS);
    if (!filters) return prods;

    if (filters.category && filters.category !== 'all') {
      prods = prods.filter((p) => p.category === filters.category);
    }
    if (filters.gender && filters.gender !== 'all') {
      prods = prods.filter((p) => p.gender === filters.gender);
    }
    if (filters.occasion && filters.occasion !== 'all') {
      prods = prods.filter((p) => p.occasion === filters.occasion);
    }
    if (filters.region && filters.region !== 'all') {
      prods = prods.filter((p) => p.region.toLowerCase().includes(filters.region!.toLowerCase()));
    }
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabricName.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  async getProductById(id: string): Promise<Product | null> {
    const prods = await this.getProducts();
    return prods.find((p) => p.id === id) || null;
  }

  // Unified Shopping Cart
  async getCartItems(): Promise<CartItem[]> {
    return this.getStorage<CartItem[]>('cart_items', []);
  }

  async addToCart(item: CartItem): Promise<CartItem[]> {
    const items = await this.getCartItems();
    const existingIndex = items.findIndex(
      (i) =>
        i.itemType === 'ready_made' &&
        item.itemType === 'ready_made' &&
        i.productVariantId === item.productVariantId &&
        i.sizeCode === item.sizeCode
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }
    this.setStorage('cart_items', items);
    return items;
  }

  async removeFromCart(itemId: string): Promise<CartItem[]> {
    const items = await this.getCartItems();
    const filtered = items.filter((i) => i.id !== itemId);
    this.setStorage('cart_items', filtered);
    return filtered;
  }

  async clearCart(): Promise<void> {
    this.setStorage('cart_items', []);
  }

  // User Profile
  async getCurrentProfile(): Promise<UserProfile> {
    return this.getStorage('current_profile', INITIAL_PROFILE);
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentProfile();
    const updated = { ...current, ...profile, updatedAt: new Date().toISOString() };
    this.setStorage('current_profile', updated);
    return updated;
  }

  // Body Profiles
  async getBodyProfiles(profileId: string): Promise<BodyProfile[]> {
    const profiles = this.getStorage('body_profiles', INITIAL_BODY_PROFILES);
    return profiles.filter((p) => p.profileId === profileId);
  }

  async saveBodyProfile(bodyProfile: BodyProfile): Promise<BodyProfile> {
    const profiles = this.getStorage('body_profiles', INITIAL_BODY_PROFILES);
    const existingIndex = profiles.findIndex((p) => p.id === bodyProfile.id);
    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...bodyProfile, updatedAt: new Date().toISOString() };
    } else {
      profiles.push({ ...bodyProfile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setStorage('body_profiles', profiles);
    return bodyProfile;
  }

  async deleteBodyProfile(bodyProfileId: string): Promise<void> {
    const profiles = this.getStorage('body_profiles', INITIAL_BODY_PROFILES);
    const filtered = profiles.filter((p) => p.id !== bodyProfileId);
    this.setStorage('body_profiles', filtered);
  }

  // Body Measurements
  async getBodyMeasurements(bodyProfileId: string): Promise<BodyMeasurements | null> {
    const all = this.getStorage<BodyMeasurements[]>('body_measurements', [INITIAL_BODY_MEASUREMENTS]);
    const match = all.find((m) => m.bodyProfileId === bodyProfileId);
    return match || null;
  }

  async saveBodyMeasurements(measurements: BodyMeasurements): Promise<BodyMeasurements> {
    const all = this.getStorage<BodyMeasurements[]>('body_measurements', [INITIAL_BODY_MEASUREMENTS]);
    const existingIndex = all.findIndex((m) => m.bodyProfileId === measurements.bodyProfileId);
    const versioned = {
      ...measurements,
      version: existingIndex >= 0 ? (all[existingIndex].version || 1) + 1 : 1,
      createdAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      all[existingIndex] = versioned;
    } else {
      all.push(versioned);
    }
    this.setStorage('body_measurements', all);
    return versioned;
  }

  // Designs
  async getDesigns(profileId: string): Promise<CustomerDesign[]> {
    const designs = this.getStorage<CustomerDesign[]>('designs', []);
    return designs.filter((d) => d.profileId === profileId);
  }

  async saveDesign(design: CustomerDesign): Promise<CustomerDesign> {
    const designs = this.getStorage<CustomerDesign[]>('designs', []);
    const index = designs.findIndex((d) => d.id === design.id);
    if (index >= 0) {
      designs[index] = { ...design, updatedAt: new Date().toISOString() };
    } else {
      designs.push({ ...design, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setStorage('designs', designs);
    return design;
  }

  // Orders & Production
  async getOrders(profileId: string): Promise<Order[]> {
    const orders = this.getStorage<Order[]>('orders', []);
    return orders.filter((o) => o.profileId === profileId);
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const orders = this.getStorage<Order[]>('orders', []);
    return orders.find((o) => o.id === orderId) || null;
  }

  async placeOrder(order: Order): Promise<Order> {
    const orders = this.getStorage<Order[]>('orders', []);
    orders.unshift(order);
    this.setStorage('orders', orders);

    // Save production spec
    if (order.items && order.items[0]?.productionSpec) {
      const specs = this.getStorage<ProductionSpec[]>('production_specs', []);
      specs.unshift(order.items[0].productionSpec);
      this.setStorage('production_specs', specs);
    }

    // Save initial production event
    const events = this.getStorage<ProductionEvent[]>('production_events', []);
    events.push({
      id: crypto.randomUUID(),
      orderId: order.id,
      fromStatus: 'draft',
      toStatus: 'confirmed',
      notes: 'Order confirmed and production tech-pack snapshot sealed.',
      createdAt: new Date().toISOString()
    });
    this.setStorage('production_events', events);

    return order;
  }

  async updateOrderStatus(orderId: string, toStatus: OrderStatus, notes?: string): Promise<Order> {
    const orders = this.getStorage<Order[]>('orders', []);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const fromStatus = orders[index].status;
    orders[index].status = toStatus;
    orders[index].updatedAt = new Date().toISOString();
    this.setStorage('orders', orders);

    const events = this.getStorage<ProductionEvent[]>('production_events', []);
    events.push({
      id: crypto.randomUUID(),
      orderId,
      fromStatus,
      toStatus,
      notes: notes || `Order status advanced to ${toStatus}`,
      createdAt: new Date().toISOString()
    });
    this.setStorage('production_events', events);

    return orders[index];
  }

  async getProductionEvents(orderId: string): Promise<ProductionEvent[]> {
    const events = this.getStorage<ProductionEvent[]>('production_events', []);
    return events.filter((e) => e.orderId === orderId);
  }

  async getProductionSpecByOrderItemId(orderItemId: string): Promise<ProductionSpec | null> {
    const specs = this.getStorage<ProductionSpec[]>('production_specs', []);
    return specs.find((s) => s.orderItemId === orderItemId) || null;
  }
}

export const repository = new LocalRepository();
