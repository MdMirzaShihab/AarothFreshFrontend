import { User } from './user.types';
import { Listing } from './listing.types';
import { Address } from './api.types';

// Order status types
export type OrderStatus = 'pending' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled';

// Payment status types
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Payment method types
export type PaymentMethod = 'cash_on_delivery' | 'mobile_banking' | 'bank_transfer' | 'card';

// Order item interface
export interface OrderItem {
  id: string;
  listing: Listing;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// Order interface
export interface Order {
  id: string;
  orderNumber: string;
  restaurant: User;
  vendor: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  deliveryFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  deliveryAddress: Address;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  cancelReason?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

// Create order request
export interface CreateOrderRequest {
  items: Array<{
    listing: string; // listing ID
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  deliveryAddress: Address;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// Update order status request
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  estimatedDeliveryTime?: string;
}

// Order filters
export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  vendor?: string;
  restaurant?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'created' | 'amount' | 'delivery';
  sortOrder?: 'asc' | 'desc';
}

// Order analytics
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: Array<{
    product: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// Order tracking information
export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  timeline: Array<{
    status: OrderStatus;
    timestamp: string;
    notes?: string;
    updatedBy?: string;
  }>;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicle?: string;
  };
}