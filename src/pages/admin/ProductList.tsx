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
  TrendingDown,
  AlertCircle,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ChevronDown
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
  Modal,
  Badge
} from '@/components/ui';
import { 
  useProducts,
  useCategoryTree,
  useUpdateProductStatus,
  useToggleProductFeatured,
  useDeleteProduct,
  useBulkProductOperation
} from '@/hooks/admin/useProductQueries';
import { Product, ProductFilters } from '@/types/product';
import { cn } from '@/utils/cn';

const StatusBadge: React.FC<{ status: Product['status'] }> = ({ status }) => {
  const variants = {
    active: 'bg-mint-fresh/20 text-bottle-green',
    inactive: 'bg-gray-100 text-gray-600',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-tomato-red/20 text-tomato-red',
    out_of_stock: 'bg-orange-100 text-orange-600'
  };

  const labels = {
    active: 'Active',
    inactive: 'Inactive', 
    pending: 'Pending',
    rejected: 'Rejected',
    out_of_stock: 'Out of Stock'
  };

  return (
    <Badge className={cn('px-2 py-1 rounded-full text-xs font-medium', variants[status])}>
      {labels[status]}
    </Badge>
  );
};

const ProductCard: React.FC<{
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (product: Product) => void;
}> = ({ product, isSelected, onSelect, onEdit, onView, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const toggleFeaturedMutation = useToggleProductFeatured();
  const updateStatusMutation = useUpdateProductStatus();

  const handleToggleFeatured = () => {
    toggleFeaturedMutation.mutate(product.id);
    setShowActions(false);
  };

  const handleToggleStatus = () => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    updateStatusMutation.mutate({ id: product.id, status: newStatus });
    setShowActions(false);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      <CardContent className="p-0">
        {/* Selection Checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.id);
            }}
            className="p-1 hover:bg-white/80 rounded-md backdrop-blur-sm bg-white/60"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-bottle-green" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Product Image */}
        <div className="relative aspect-video bg-gray-100 rounded-t-3xl overflow-hidden">
          {product.images.length > 0 ? (
            <img 
              src={product.images[0].url} 
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
            <div className="absolute top-3 right-12 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <button
                    onClick={() => {
                      onView(product);
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
                    onClick={handleToggleFeatured}
                    disabled={toggleFeaturedMutation.isPending}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
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
                    onClick={handleToggleStatus}
                    disabled={updateStatusMutation.isPending}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
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
            {product.isOrganic && (
              <Badge className="mt-1 bg-mint-fresh/20 text-bottle-green px-2 py-0.5 text-xs">
                Organic
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-bottle-green">৳{product.price.toFixed(2)}</span>
              <span className="text-sm text-text-muted ml-1">/{product.unit}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-text-muted line-through ml-2">
                  ৳{product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-sm text-text-muted">
              Stock: {product.stock} {product.unit}
            </div>
          </div>

          {/* Product Metrics */}
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-gray-400" />
                <span className="text-text-muted">{product.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-gray-400" />
                <span className="text-text-muted">{product.orders}</span>
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-current" />
                  <span className="text-text-muted">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">
                  {product.vendor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-text-muted truncate max-w-[120px]">{product.vendor.businessName}</span>
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

const AdvancedFilters: React.FC<{
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: any[];
  onClose: () => void;
}> = ({ filters, onFiltersChange, categories, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: ProductFilters = {
      search: '',
      page: 1,
      limit: 12
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-dark">Advanced Filters</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Category</label>
          <select
            value={localFilters.categoryId || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, categoryId: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Featured</label>
          <select
            value={localFilters.featured === undefined ? '' : localFilters.featured.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setLocalFilters({ 
                ...localFilters, 
                featured: value === '' ? undefined : value === 'true'
              });
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="">All Products</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
        </div>

        {/* Organic Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Organic</label>
          <select
            value={localFilters.isOrganic === undefined ? '' : localFilters.isOrganic.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setLocalFilters({ 
                ...localFilters, 
                isOrganic: value === '' ? undefined : value === 'true'
              });
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="">All Products</option>
            <option value="true">Organic Only</option>
            <option value="false">Non-Organic</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Min Price (৳)</label>
          <input
            type="number"
            value={localFilters.priceMin || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              priceMin: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Max Price (৳)</label>
          <input
            type="number"
            value={localFilters.priceMax || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              priceMax: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            placeholder="1000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          />
        </div>

        {/* Stock Filter */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Min Stock</label>
          <input
            type="number"
            value={localFilters.stockMin || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              stockMin: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Sort By</label>
          <select
            value={localFilters.sortBy || 'created'}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              sortBy: e.target.value as any
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="created">Created Date</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="views">Views</option>
            <option value="orders">Orders</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Sort Order</label>
          <select
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              sortOrder: e.target.value as 'asc' | 'desc'
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export const ProductList: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created',
    sortOrder: 'desc'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // API hooks
  const { data: productsData, isLoading, error, refetch } = useProducts(filters);
  const { data: categoriesData } = useCategoryTree();
  const deleteProductMutation = useDeleteProduct();
  const bulkOperationMutation = useBulkProductOperation();

  // Helper functions
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (!productsData?.products) return;
    
    if (selectedProducts.length === productsData.products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsData.products.map(p => p.id));
    }
  };

  const handleBulkOperation = (action: string) => {
    if (selectedProducts.length === 0) return;

    bulkOperationMutation.mutate({
      action: action as any,
      productIds: selectedProducts
    });
    
    setSelectedProducts([]);
  };

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search: search.trim() || undefined, page: 1 }));
  };

  // Statistics
  const stats = useMemo(() => {
    if (!productsData) return { total: 0, active: 0, inactive: 0, featured: 0, outOfStock: 0 };
    
    return {
      total: productsData.total,
      active: productsData.products.filter(p => p.status === 'active').length,
      inactive: productsData.products.filter(p => p.status === 'inactive').length,
      featured: productsData.products.filter(p => p.featured).length,
      outOfStock: productsData.products.filter(p => p.status === 'out_of_stock').length
    };
  }, [productsData]);

  // Table columns for list view
  const columns = [
    {
      key: 'select',
      header: (
        <button
          onClick={selectAllProducts}
          className="p-1 hover:bg-gray-100 rounded touch-target"
        >
          {selectedProducts.length === productsData?.products.length && productsData?.products.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-bottle-green" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      width: '50px',
      render: (_: any, product: Product) => (
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
      render: (_: any, product: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
            {product.images.length > 0 ? (
              <img 
                src={product.images[0].url} 
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
            <div className="flex items-center gap-2 mt-1">
              {product.featured && (
                <Badge className="bg-amber-100 text-amber-800 px-1 py-0 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.isOrganic && (
                <Badge className="bg-mint-fresh/20 text-bottle-green px-1 py-0 text-xs">
                  Organic
                </Badge>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (_: any, product: Product) => (
        <div>
          <p className="font-medium text-text-dark text-sm">{product.vendor.businessName}</p>
          <p className="text-xs text-text-muted">{product.vendor.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (_: any, product: Product) => (
        <div>
          <p className="font-medium text-bottle-green">৳{product.price.toFixed(2)}</p>
          <p className="text-xs text-text-muted">per {product.unit}</p>
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-xs text-text-muted line-through">৳{product.comparePrice.toFixed(2)}</p>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (_: any, product: Product) => (
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
      key: 'metrics',
      header: 'Performance',
      render: (_: any, product: Product) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-gray-400" />
            <span>{product.views} views</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-gray-400" />
            <span>{product.orders} orders</span>
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, product: Product) => <StatusBadge status={product.status} />
    },
    {
      key: 'created',
      header: 'Created',
      render: (_: any, product: Product) => (
        <div className="text-sm text-text-muted">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Product List</h1>
          <p className="text-text-muted">
            Manage and monitor all products across the platform ({stats.total} total)
          </p>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total</p>
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
            <TrendingDown className="w-8 h-8 text-gray-500" />
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

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-tomato-red">{stats.outOfStock}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-tomato-red" />
          </div>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="p-4 bg-bottle-green/5 border-bottle-green/20">
          <div className="flex items-center justify-between">
            <p className="text-bottle-green font-medium">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </p>
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
                onClick={() => handleBulkOperation('deactivate')}
                disabled={bulkOperationMutation.isPending}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkOperation('feature')}
                disabled={bulkOperationMutation.isPending}
              >
                Feature
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedProducts([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={filters.search || ''}
                onChange={handleSearchChange}
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

            {/* Advanced Filters */}
            <Button
              variant="outline"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setShowAdvancedFilters(true)}
            >
              Advanced Filters
              {(filters.categoryId || filters.status || filters.featured !== undefined || 
                filters.isOrganic !== undefined || filters.priceMin || filters.priceMax || 
                filters.stockMin) && ' (Active)'}
            </Button>
          </div>
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
      ) : !productsData?.products.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title="No products found"
              description="No products match your current search criteria."
              action={
                <Button onClick={() => handleFiltersChange({ page: 1, limit: 12 })}>
                  Clear Filters
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onSelect={toggleProductSelection}
              onView={(product) => {
                setSelectedProduct(product);
                setShowProductModal(true);
              }}
              onEdit={(product) => {
                // Navigate to edit form or open edit modal
                console.log('Edit product:', product.id);
              }}
              onDelete={(product) => {
                setSelectedProduct(product);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table
              data={productsData.products}
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
            currentPage={productsData.page}
            totalPages={productsData.totalPages}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            totalItems={productsData.total}
            itemsPerPage={filters.limit || 12}
          />
        </div>
      )}

      {/* Advanced Filters Modal */}
      <Modal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        title="Advanced Filters"
        size="xl"
      >
        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categoriesData || []}
          onClose={() => setShowAdvancedFilters(false)}
        />
      </Modal>

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
            {/* Product overview */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0].url} 
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
                  {selectedProduct.isOrganic && (
                    <Badge className="bg-mint-fresh/20 text-bottle-green">
                      Organic
                    </Badge>
                  )}
                </div>
                <p className="text-text-muted mb-4">{selectedProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-dark">Price:</label>
                    <p className="text-lg font-bold text-bottle-green">
                      ৳{selectedProduct.price.toFixed(2)} / {selectedProduct.unit}
                    </p>
                    {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                      <p className="text-sm text-text-muted line-through">
                        ৳{selectedProduct.comparePrice.toFixed(2)}
                      </p>
                    )}
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

                {/* Performance metrics */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">{selectedProduct.views}</p>
                    <p className="text-sm text-text-muted">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">{selectedProduct.orders}</p>
                    <p className="text-sm text-text-muted">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">
                      {selectedProduct.rating > 0 ? selectedProduct.rating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="text-sm text-text-muted">Rating</p>
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
          if (selectedProduct) {
            deleteProductMutation.mutate(selectedProduct.id);
          }
          setShowDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        variant="danger"
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
};

export default ProductList;