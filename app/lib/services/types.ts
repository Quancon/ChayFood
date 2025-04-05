export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'main' | 'side' | 'dessert' | 'beverage';
  image: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isAvailable: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens?: string[];
  isVegetarian: boolean;
  spicyLevel: number; // 0-3: 0 = not spicy, 3 = very spicy
}

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    menuItem: string | MenuItem;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cod' | 'card' | 'banking';
  deliveryTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  items: Array<{
    menuItem: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentMethod: 'cod' | 'card' | 'banking';
  specialInstructions?: string;
}

export interface Plan {
  _id: string;
  name: string;
  code: string;
  price: number;
  duration: number;
  description: string;
  mealsPerDay: number;
  snacksPerDay: number;
  features: string[];
  isRecommended: boolean;
  isPremiumMenu: boolean;
  hasDietitianSupport: boolean;
  hasCustomization: boolean;
  hasPriorityDelivery: boolean;
  has24HrSupport: boolean;
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  user: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  selectedMenuItems?: Array<{
    menuItemId: string;
    quantity: number;
    dayOfWeek: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }>;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'card' | 'banking';
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  planId: string;
  startDate: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentMethod: 'card' | 'banking';
  specialInstructions?: string;
} 