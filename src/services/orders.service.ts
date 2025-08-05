import { api } from './api';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilters,
  OrderAnalytics,
  OrderTracking,
  PaginatedResponse,
} from '@/types';

export class OrdersService {
  /**
   * Get all orders (filtered by user role)
   */
  static async getAll(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      '/orders',
      filters
    );
    return response.data;
  }

  /**
   * Get single order by ID
   */
  static async getById(id: string): Promise<Order> {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data;
  }

  /**
   * Create new order (restaurant only)
   */
  static async create(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post<{ success: boolean; data: Order }>('/orders', data);
    return response.data;
  }

  /**
   * Update order status
   */
  static async updateStatus(id: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.put<{ success: boolean; data: Order }>(
      `/orders/${id}/status`,
      data
    );
    return response.data;
  }

  /**
   * Cancel order
   */
  static async cancel(id: string, reason: string): Promise<Order> {
    const response = await api.post<{ success: boolean; data: Order }>(
      `/orders/${id}/cancel`,
      { reason }
    );
    return response.data;
  }

  /**
   * Get restaurant's orders
   */
  static async getRestaurantOrders(filters: Omit<OrderFilters, 'restaurant'> = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      '/orders/restaurant',
      filters
    );
    return response.data;
  }

  /**
   * Get vendor's orders
   */
  static async getVendorOrders(filters: Omit<OrderFilters, 'vendor'> = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      '/orders/vendor',
      filters
    );
    return response.data;
  }

  /**
   * Get order analytics
   */
  static async getAnalytics(dateRange?: { from: string; to: string }): Promise<OrderAnalytics> {
    const response = await api.get<{ success: boolean; data: OrderAnalytics }>(
      '/orders/analytics',
      dateRange
    );
    return response.data;
  }

  /**
   * Get order tracking information
   */
  static async getTracking(id: string): Promise<OrderTracking> {
    const response = await api.get<{ success: boolean; data: OrderTracking }>(
      `/orders/${id}/tracking`
    );
    return response.data;
  }

  /**
   * Add rating and review to completed order
   */
  static async addReview(id: string, rating: number, review?: string): Promise<Order> {
    const response = await api.post<{ success: boolean; data: Order }>(
      `/orders/${id}/review`,
      { rating, review }
    );
    return response.data;
  }

  /**
   * Get order receipt/invoice
   */
  static async getReceipt(id: string): Promise<Blob> {
    const response = await api.getClient().get(`/orders/${id}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download order receipt as PDF
   */
  static async downloadReceipt(id: string, orderNumber: string): Promise<void> {
    const receipt = await this.getReceipt(id);
    const url = window.URL.createObjectURL(receipt);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get orders by status
   */
  static async getByStatus(status: string, filters: Omit<OrderFilters, 'status'> = {}): Promise<PaginatedResponse<Order>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      `/orders/status/${status}`,
      filters
    );
    return response.data;
  }

  /**
   * Get recent orders
   */
  static async getRecent(limit: number = 10): Promise<Order[]> {
    const response = await api.get<{ success: boolean; data: Order[] }>(
      '/orders/recent',
      { limit }
    );
    return response.data;
  }

  /**
   * Get order summary for dashboard
   */
  static async getSummary(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    thisMonthRevenue: number;
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        thisMonthRevenue: number;
      };
    }>('/orders/summary');
    return response.data;
  }

  /**
   * Estimate delivery time
   */
  static async estimateDelivery(data: {
    vendorId: string;
    restaurantAddress: {
      latitude: number;
      longitude: number;
    };
  }): Promise<{
    estimatedMinutes: number;
    estimatedDeliveryTime: string;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        estimatedMinutes: number;
        estimatedDeliveryTime: string;
      };
    }>('/orders/estimate-delivery', data);
    return response.data;
  }

  /**
   * Check order eligibility (validate cart before creating order)
   */
  static async checkEligibility(data: CreateOrderRequest): Promise<{
    isEligible: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        isEligible: boolean;
        errors: string[];
        warnings: string[];
      };
    }>('/orders/check-eligibility', data);
    return response.data;
  }
}

// Export as default and named export
export default OrdersService;