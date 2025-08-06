import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SearchBar,
  Table,
  Pagination,
  EmptyState,
  LoadingSpinner,
  ConfirmDialog,
  Modal
} from '@/components/ui';
import { 
  useAdminUsers, 
  useUpdateUserStatus, 
  useUpdateUserRole, 
  useDeleteUser,
  useBulkUserOperation 
} from '@/hooks/admin/useAdminQueries';
import { AdminUser, UserListParams } from '@/types/admin';
import { cn } from '@/utils/cn';

const StatusBadge: React.FC<{ status: AdminUser['status'] }> = ({ status }) => {
  const variants = {
    active: 'bg-mint-fresh/20 text-bottle-green',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-tomato-red/20 text-tomato-red',
    pending: 'bg-amber-100 text-amber-800'
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', variants[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const RoleBadge: React.FC<{ role: AdminUser['role'] }> = ({ role }) => {
  const variants = {
    admin: 'bg-tomato-red/20 text-tomato-red',
    vendor: 'bg-bottle-green/20 text-bottle-green',
    restaurantOwner: 'bg-earthy-yellow/20 text-earthy-brown',
    restaurantManager: 'bg-blue-100 text-blue-600'
  };

  const labels = {
    admin: 'Admin',
    vendor: 'Vendor',
    restaurantOwner: 'Restaurant Owner',
    restaurantManager: 'Restaurant Manager'
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', variants[role])}>
      {labels[role]}
    </span>
  );
};

interface UserActionsDropdownProps {
  user: AdminUser;
  onViewUser: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onUpdateStatus: (user: AdminUser, status: string) => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onUpdateStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
          <button
            onClick={() => {
              onViewUser(user);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          
          <button
            onClick={() => {
              onEditUser(user);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit User
          </button>

          <hr className="my-1" />

          {user.status === 'active' ? (
            <button
              onClick={() => {
                onUpdateStatus(user, 'suspended');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-amber-600"
            >
              <UserX className="w-4 h-4" />
              Suspend User
            </button>
          ) : (
            <button
              onClick={() => {
                onUpdateStatus(user, 'active');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-mint-fresh"
            >
              <UserCheck className="w-4 h-4" />
              Activate User
            </button>
          )}

          <hr className="my-1" />

          <button
            onClick={() => {
              onDeleteUser(user);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-tomato-red"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
};

export const UserManagement: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Query parameters
  const queryParams: UserListParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    search: searchQuery.trim() || undefined,
    role: selectedRole || undefined,
    status: selectedStatus || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [currentPage, searchQuery, selectedRole, selectedStatus]);

  // API hooks
  const { data: usersData, isLoading, error, refetch } = useAdminUsers(queryParams);
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const bulkOperationMutation = useBulkUserOperation();

  // Table columns
  const columns = [
    {
      key: 'select',
      header: '',
      width: '50px',
      render: (_: any, user: AdminUser) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleUserSelection(user.id);
          }}
          className="p-1 hover:bg-gray-100 rounded touch-target"
        >
          {selectedUsers.includes(user.id) ? (
            <CheckSquare className="w-4 h-4 text-bottle-green" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )
    },
    {
      key: 'user',
      header: 'User',
      render: (_: any, user: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-text-dark">{user.name}</p>
            <p className="text-sm text-text-muted">{user.phone}</p>
            {user.email && (
              <p className="text-xs text-text-muted">{user.email}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (_: any, user: AdminUser) => <RoleBadge role={user.role} />
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, user: AdminUser) => <StatusBadge status={user.status} />
    },
    {
      key: 'business',
      header: 'Business Info',
      render: (_: any, user: AdminUser) => (
        <div>
          {user.businessName && (
            <p className="text-sm font-medium text-text-dark">{user.businessName}</p>
          )}
          {user.restaurantName && (
            <p className="text-sm font-medium text-text-dark">{user.restaurantName}</p>
          )}
          {(user.businessType || user.cuisineType) && (
            <p className="text-xs text-text-muted">
              {user.businessType || user.cuisineType}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'created',
      header: 'Joined',
      render: (_: any, user: AdminUser) => (
        <div>
          <p className="text-sm text-text-dark">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-text-muted">
            {new Date(user.createdAt).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      render: (_: any, user: AdminUser) => (
        <UserActionsDropdown
          user={user}
          onViewUser={(user) => {
            setSelectedUser(user);
            setShowUserModal(true);
          }}
          onEditUser={(user) => {
            setSelectedUser(user);
            // Handle edit user
          }}
          onDeleteUser={(user) => {
            setSelectedUser(user);
            setShowDeleteConfirm(true);
          }}
          onUpdateStatus={(user, status) => {
            updateStatusMutation.mutate({ userId: user.id, status });
          }}
        />
      )
    }
  ];

  // Helper functions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === usersData?.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData?.users.map(user => user.id) || []);
    }
  };

  const handleBulkOperation = (action: string) => {
    if (selectedUsers.length === 0) return;

    bulkOperationMutation.mutate({
      action: action as any,
      userIds: selectedUsers
    }, {
      onSuccess: () => {
        setSelectedUsers([]);
      }
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">User Management</h1>
          <p className="text-text-muted">Manage user accounts, roles, and permissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search users by name, phone, email..."
                debounceMs={500}
              />
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {(selectedRole || selectedStatus) && '(Active)'}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                    <option value="restaurantOwner">Restaurant Owner</option>
                    <option value="restaurantManager">Restaurant Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRole('');
                      setSelectedStatus('');
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('activate')}
                  disabled={bulkOperationMutation.isPending}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('suspend')}
                  disabled={bulkOperationMutation.isPending}
                >
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleBulkOperation('delete')}
                  disabled={bulkOperationMutation.isPending}
                  loading={bulkOperationMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-8">
              <EmptyState
                title="Failed to load users"
                description="There was an error loading the user list. Please try again."
                action={
                  <Button onClick={() => refetch()}>
                    Try Again
                  </Button>
                }
              />
            </div>
          ) : !usersData?.users.length ? (
            <div className="p-8">
              <EmptyState
                icon={<Users className="w-12 h-12" />}
                title="No users found"
                description="No users match your current search criteria."
                action={
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedRole('');
                    setSelectedStatus('');
                  }}>
                    Clear Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-gray-100 rounded touch-target"
                  >
                    {selectedUsers.length === usersData.users.length ? (
                      <CheckSquare className="w-4 h-4 text-bottle-green" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <span className="text-sm text-text-muted">
                    {usersData.users.length} user(s) • Page {currentPage} of {usersData.totalPages}
                  </span>
                </div>
              </div>

              <Table
                data={usersData.users}
                columns={columns}
                onRowClick={(user) => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
                hoverable
                className="border-0"
              />

              {usersData.totalPages > 1 && (
                <div className="p-6 border-t border-gray-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={usersData.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={usersData.total}
                    itemsPerPage={20}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-dark mb-2">
                  {selectedUser.name}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-text-dark">Phone:</label>
                    <p className="text-text-muted">{selectedUser.phone}</p>
                  </div>
                  {selectedUser.email && (
                    <div>
                      <label className="font-medium text-text-dark">Email:</label>
                      <p className="text-text-muted">{selectedUser.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Info */}
            {(selectedUser.businessName || selectedUser.restaurantName) && (
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-text-dark mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedUser.businessName && (
                    <div>
                      <label className="font-medium text-text-dark">Business Name:</label>
                      <p className="text-text-muted">{selectedUser.businessName}</p>
                    </div>
                  )}
                  {selectedUser.restaurantName && (
                    <div>
                      <label className="font-medium text-text-dark">Restaurant Name:</label>
                      <p className="text-text-muted">{selectedUser.restaurantName}</p>
                    </div>
                  )}
                  {selectedUser.businessType && (
                    <div>
                      <label className="font-medium text-text-dark">Business Type:</label>
                      <p className="text-text-muted">{selectedUser.businessType}</p>
                    </div>
                  )}
                  {selectedUser.cuisineType && (
                    <div>
                      <label className="font-medium text-text-dark">Cuisine Type:</label>
                      <p className="text-text-muted">{selectedUser.cuisineType}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-semibold text-text-dark mb-4">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-text-dark">Joined:</label>
                  <p className="text-text-muted">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-text-dark">Last Updated:</label>
                  <p className="text-text-muted">
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </p>
                </div>
                {selectedUser.lastLoginAt && (
                  <div>
                    <label className="font-medium text-text-dark">Last Login:</label>
                    <p className="text-text-muted">
                      {new Date(selectedUser.lastLoginAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <label className="font-medium text-text-dark">Verification:</label>
                  <div className="flex gap-2 mt-1">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs',
                      selectedUser.emailVerified 
                        ? 'bg-mint-fresh/20 text-bottle-green' 
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      Email {selectedUser.emailVerified ? '✓' : '✗'}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs',
                      selectedUser.phoneVerified 
                        ? 'bg-mint-fresh/20 text-bottle-green' 
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      Phone {selectedUser.phoneVerified ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default UserManagement;