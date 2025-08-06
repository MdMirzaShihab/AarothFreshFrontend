import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  adminDashboardApi,
  userManagementApi,
  vendorApprovalApi,
  productManagementApi,
  categoryManagementApi,
  analyticsApi
} from '@/services/admin/adminApi';
import {
  UserListParams,
  AdminUser,
  BulkOperation,
  VendorApprovalRequest
} from '@/types/admin';

// Query Keys
export const adminQueryKeys = {
  dashboard: {
    metrics: ['admin', 'dashboard', 'metrics'] as const,
    activities: (limit?: number) => ['admin', 'dashboard', 'activities', limit] as const,
  },
  users: {
    all: ['admin', 'users'] as const,
    list: (params: UserListParams) => ['admin', 'users', 'list', params] as const,
    detail: (id: string) => ['admin', 'users', 'detail', id] as const,
  },
  vendors: {
    approvals: (params?: any) => ['admin', 'vendors', 'approvals', params] as const,
    approval: (id: string) => ['admin', 'vendors', 'approval', id] as const,
    documents: (id: string) => ['admin', 'vendors', 'documents', id] as const,
  },
  products: {
    all: ['admin', 'products'] as const,
    list: (params?: any) => ['admin', 'products', 'list', params] as const,
    detail: (id: string) => ['admin', 'products', 'detail', id] as const,
  },
  categories: {
    all: ['admin', 'categories'] as const,
    list: (params?: any) => ['admin', 'categories', 'list', params] as const,
    detail: (id: string) => ['admin', 'categories', 'detail', id] as const,
  },
  analytics: {
    data: (params?: any) => ['admin', 'analytics', 'data', params] as const,
  },
};

// Dashboard Hooks
export const useAdminDashboardMetrics = () => {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.metrics,
    queryFn: adminDashboardApi.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdminRecentActivities = (limit?: number) => {
  return useQuery({
    queryKey: adminQueryKeys.dashboard.activities(limit),
    queryFn: () => adminDashboardApi.getRecentActivities(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User Management Hooks
export const useAdminUsers = (params: UserListParams) => {
  return useQuery({
    queryKey: adminQueryKeys.users.list(params),
    queryFn: () => userManagementApi.getUsers(params),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: adminQueryKeys.users.detail(userId),
    queryFn: () => userManagementApi.getUser(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      userManagementApi.updateUserStatus(userId, status),
    onSuccess: (data, { userId }) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user status');
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userManagementApi.updateUserRole(userId, role),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user role');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userManagementApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    },
  });
};

export const useBulkUserOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: BulkOperation) => userManagementApi.bulkOperation(operation),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      if (result.failedCount > 0) {
        toast.warning(`Operation completed: ${result.processedCount} succeeded, ${result.failedCount} failed`);
      } else {
        toast.success(`Bulk operation completed successfully: ${result.processedCount} users processed`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk operation failed');
    },
  });
};

// Vendor Approval Hooks
export const useVendorApprovals = (params?: any) => {
  return useQuery({
    queryKey: adminQueryKeys.vendors.approvals(params),
    queryFn: () => vendorApprovalApi.getPendingApprovals(params),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
  });
};

export const useVendorApproval = (approvalId: string) => {
  return useQuery({
    queryKey: adminQueryKeys.vendors.approval(approvalId),
    queryFn: () => vendorApprovalApi.getApprovalDetails(approvalId),
    enabled: !!approvalId,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useApproveVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ approvalId, notes }: { approvalId: string; notes?: string }) =>
      vendorApprovalApi.approveVendor(approvalId, { notes }),
    onSuccess: (data, { approvalId }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vendors.approvals() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vendors.approval(approvalId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      toast.success('Vendor approved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve vendor');
    },
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ approvalId, reason, notes }: { approvalId: string; reason: string; notes?: string }) =>
      vendorApprovalApi.rejectVendor(approvalId, { reason, notes }),
    onSuccess: (data, { approvalId }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vendors.approvals() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.vendors.approval(approvalId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard.metrics });
      
      toast.success('Vendor application rejected');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reject vendor');
    },
  });
};

// Product Management Hooks
export const useAdminProducts = (params?: any) => {
  return useQuery({
    queryKey: adminQueryKeys.products.list(params),
    queryFn: () => productManagementApi.getProducts(params),
    staleTime: 60 * 1000, // 1 minute
    keepPreviousData: true,
  });
};

export const useAdminProduct = (productId: string) => {
  return useQuery({
    queryKey: adminQueryKeys.products.detail(productId),
    queryFn: () => productManagementApi.getProduct(productId),
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, status }: { productId: string; status: string }) =>
      productManagementApi.updateProductStatus(productId, status),
    onSuccess: (data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products.detail(productId) });
      
      toast.success('Product status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product status');
    },
  });
};

// Category Management Hooks
export const useAdminCategories = (params?: any) => {
  return useQuery({
    queryKey: adminQueryKeys.categories.list(params),
    queryFn: () => categoryManagementApi.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

// Analytics Hooks
export const useAdminAnalytics = (params?: any) => {
  return useQuery({
    queryKey: adminQueryKeys.analytics.data(params),
    queryFn: () => analyticsApi.getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};