import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  Image as ImageIcon,
  RefreshCw,
  Download,
  CheckSquare,
  Square,
  Grid,
  List,
  TrendingUp,
  AlertCircle
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
  useAdminProducts,
  useAdminCategories,
  useUpdateProductStatus
} from '@/hooks/admin/useAdminQueries';
import { AdminProduct, ProductCategory } from '@/types/admin';
import { cn } from '@/utils/cn';

const StatusBadge: React.FC<{ status: AdminProduct['status'] }> = ({ status }) => {
  const variants = {
    active: 'bg-mint-fresh/20 text-bottle-green',
    inactive: 'bg-gray-100 text-gray-600',
    out_of_stock: 'bg-tomato-red/20 text-tomato-red'
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', variants[status])}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

const ProductCard: React.FC<{
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  onToggleFeature: (product: AdminProduct) => void;
  onUpdateStatus: (product: AdminProduct, status: string) => void;
}> = ({ product, onEdit, onDelete, onToggleFeature, onUpdateStatus }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-video bg-gray-100 rounded-t-3xl overflow-hidden">
          {product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={product.status} />
          </div>

          {/* Actions Menu */}
          <div className="absolute bottom-3 right-3">
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    onClick={() => {
                      onEdit(product);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => {
                      onEdit(product);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Product
                  </button>

                  <hr className="my-1" />

                  <button
                    onClick={() => {
                      onToggleFeature(product);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {product.featured ? (
                      <>
                        <StarOff className="w-4 h-4" />
                        Remove Featured
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Make Featured
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onUpdateStatus(product, product.status === 'active' ? 'inactive' : 'active');
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <hr className="my-1" />

                  <button
                    onClick={() => {
                      onDelete(product);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-tomato-red"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-text-dark mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-text-muted">{product.category.name}</p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-bottle-green">৳{product.price.toFixed(2)}</span>
              <span className="text-sm text-text-muted ml-1">/{product.unit}</span>
            </div>
            <div className="text-sm text-text-muted">
              Stock: {product.stock} {product.unit}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">
                  {product.vendor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-text-muted">{product.vendor.businessName}</span>
            </div>
            <span className="text-text-muted">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductManagement: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: viewMode === 'grid' ? 12 : 20,
    search: searchQuery.trim() || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    vendor: selectedVendor || undefined
  }), [currentPage, searchQuery, selectedCategory, selectedStatus, selectedVendor, viewMode]);

  // API hooks
  const { data: productsData, isLoading, error, refetch } = useAdminProducts(queryParams);
  const { data: categoriesData } = useAdminCategories();
  const updateProductStatusMutation = useUpdateProductStatus();

  // Table columns for list view
  const columns = [
    {
      key: 'select',
      header: '',
      width: '50px',
      render: (_: any, product: AdminProduct) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleProductSelection(product.id);
          }}
          className="p-1 hover:bg-gray-100 rounded touch-target"
        >
          {selectedProducts.includes(product.id) ? (
            <CheckSquare className="w-4 h-4 text-bottle-green" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )
    },
    {
      key: 'product',
      header: 'Product',
      render: (_: any, product: AdminProduct) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
            {product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-text-dark">{product.name}</p>
            <p className="text-sm text-text-muted">{product.category.name}</p>
            {product.featured && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600">Featured</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (_: any, product: AdminProduct) => (
        <div>
          <p className="font-medium text-text-dark text-sm">{product.vendor.businessName}</p>
          <p className="text-xs text-text-muted">{product.vendor.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (_: any, product: AdminProduct) => (
        <div>
          <p className="font-medium text-bottle-green">৳{product.price.toFixed(2)}</p>
          <p className="text-xs text-text-muted">per {product.unit}</p>
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (_: any, product: AdminProduct) => (
        <div className="text-sm">
          <span className={cn(
            'font-medium',
            product.stock > 0 ? 'text-text-dark' : 'text-tomato-red'
          )}>
            {product.stock} {product.unit}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, product: AdminProduct) => <StatusBadge status={product.status} />
    },
    {
      key: 'created',
      header: 'Created',
      render: (_: any, product: AdminProduct) => (
        <div className="text-sm text-text-muted">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Helper functions
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductAction = (action: string, product: AdminProduct) => {
    switch (action) {
      case 'edit':
        setSelectedProduct(product);
        setShowProductModal(true);
        break;
      case 'delete':
        setSelectedProduct(product);
        setShowDeleteConfirm(true);
        break;
      case 'toggle-feature':
        // Handle toggle feature
        break;
      case 'update-status':
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        updateProductStatusMutation.mutate({ productId: product.id, status: newStatus });
        break;
    }
  };

  // Statistics
  const stats = useMemo(() => {
    if (!productsData) return { total: 0, active: 0, inactive: 0, featured: 0 };
    
    return {
      total: productsData.items.length,
      active: productsData.items.filter(p => p.status === 'active').length,
      inactive: productsData.items.filter(p => p.status === 'inactive').length,
      featured: productsData.items.filter(p => p.featured).length
    };
  }, [productsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Product Management</h1>
          <p className="text-text-muted">Manage products and categories across the platform</p>
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
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Products</p>
              <p className="text-2xl font-bold text-text-dark">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-bottle-green" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Active</p>
              <p className="text-2xl font-bold text-mint-fresh">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-mint-fresh" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Featured</p>
              <p className="text-2xl font-bold text-amber-600">{stats.featured}</p>
            </div>
            <Star className="w-8 h-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search products by name, category, vendor..."
                debounceMs={500}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors duration-200',
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors duration-200',
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {(selectedCategory || selectedStatus || selectedVendor) && '(Active)'}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    <option value="">All Categories</option>
                    {categoriesData?.items.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
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
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Vendor</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    <option value="">All Vendors</option>
                    {/* Populate with vendors */}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedStatus('');
                      setSelectedVendor('');
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

      {/* Products Display */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="Failed to load products"
              description="There was an error loading the products. Please try again."
              action={
                <Button onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : !productsData?.items.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title="No products found"
              description="No products match your current search criteria."
              action={
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                  setSelectedVendor('');
                }}>
                  Clear Filters
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(product) => handleProductAction('edit', product)}
              onDelete={(product) => handleProductAction('delete', product)}
              onToggleFeature={(product) => handleProductAction('toggle-feature', product)}
              onUpdateStatus={(product, status) => 
                updateProductStatusMutation.mutate({ productId: product.id, status })
              }
            />
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table
              data={productsData.items}
              columns={columns}
              onRowClick={(product) => {
                setSelectedProduct(product);
                setShowProductModal(true);
              }}
              hoverable
              className="border-0"
            />
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {productsData && productsData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={productsData.totalPages}
            onPageChange={setCurrentPage}
            totalItems={productsData.total}
            itemsPerPage={viewMode === 'grid' ? 12 : 20}
          />
        </div>
      )}

      {/* Product Details Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        title="Product Details"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-dark mb-2">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={selectedProduct.status} />
                  {selectedProduct.featured && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">Featured</span>
                    </div>
                  )}
                </div>
                <p className="text-text-muted mb-4">{selectedProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-dark">Price:</label>
                    <p className="text-lg font-bold text-bottle-green">
                      ৳{selectedProduct.price.toFixed(2)} / {selectedProduct.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-dark">Stock:</label>
                    <p className="text-lg font-bold text-text-dark">
                      {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-dark">Category:</label>
                    <p className="text-text-muted">{selectedProduct.category.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-dark">Vendor:</label>
                    <p className="text-text-muted">{selectedProduct.vendor.businessName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Product
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
          setSelectedProduct(null);
        }}
        onConfirm={() => {
          // Handle delete
          setShowDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
};

export default ProductManagement;