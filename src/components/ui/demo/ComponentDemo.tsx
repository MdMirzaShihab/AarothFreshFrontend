import React, { useState } from 'react';
import { Search, Plus, Edit, Trash, Download } from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingSpinner,
  FormField,
  FileUpload,
  Table,
  Pagination,
  EmptyState,
  SearchBar,
  ToastContainer,
  ConfirmDialog
} from '../index';

// Sample data for Table component
const sampleData = [
  { id: 1, name: 'Fresh Tomatoes', category: 'Vegetables', price: 25.50, stock: 150, vendor: 'Farm Fresh Co' },
  { id: 2, name: 'Organic Carrots', category: 'Vegetables', price: 18.75, stock: 89, vendor: 'Green Valley' },
  { id: 3, name: 'Bell Peppers', category: 'Vegetables', price: 32.00, stock: 45, vendor: 'Local Harvest' },
  { id: 4, name: 'Fresh Spinach', category: 'Leafy Greens', price: 15.25, stock: 78, vendor: 'Organic Fields' },
  { id: 5, name: 'Sweet Corn', category: 'Vegetables', price: 12.50, stock: 120, vendor: 'Sunny Farms' }
];

const tableColumns = [
  { key: 'name', header: 'Product Name', sortable: true },
  { key: 'category', header: 'Category', sortable: true },
  { 
    key: 'price', 
    header: 'Price (৳/kg)', 
    sortable: true,
    render: (value: number) => `৳${value.toFixed(2)}`
  },
  { key: 'stock', header: 'Stock (kg)', sortable: true },
  { key: 'vendor', header: 'Vendor', sortable: false },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    )
  }
];

export const ComponentDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [toasts, setToasts] = useState<Array<any>>([]);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const toast = {
      id: Date.now().toString(),
      type,
      message,
      onClose: (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }
    };
    setToasts(prev => [...prev, toast]);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortDirection(direction);
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    addToast('success', `${files.length} file(s) uploaded successfully!`);
  };

  const handleFileRemove = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    addToast('info', 'File removed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/20 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text-dark">Aaroth Fresh UI Components</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            A comprehensive, mobile-first component library built with React, TypeScript, and Tailwind CSS
          </p>
        </div>

        {/* Base Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Base Components</h2>
          
          {/* Buttons */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button leftIcon={<Plus className="w-4 h-4" />}>With Icon</Button>
                <Button rightIcon={<Download className="w-4 h-4" />}>Download</Button>
              </div>
            </CardContent>
          </Card>

          {/* Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Default Input" placeholder="Enter text..." />
                <Input 
                  label="With Icon" 
                  placeholder="Search..." 
                  leftIcon={<Search className="w-4 h-4" />}
                />
                <Input 
                  label="Error State" 
                  placeholder="Invalid input" 
                  error="This field is required"
                />
                <Input 
                  label="Loading State" 
                  placeholder="Processing..." 
                  loading
                />
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="default" padding="md">
                  <h3 className="font-semibold mb-2">Default Card</h3>
                  <p className="text-text-muted text-sm">Standard card with shadow</p>
                </Card>
                
                <Card variant="glass" padding="md" hover>
                  <h3 className="font-semibold mb-2">Glass Card</h3>
                  <p className="text-text-muted text-sm">Glassmorphism effect with hover</p>
                </Card>
                
                <Card variant="elevated" padding="md" interactive>
                  <h3 className="font-semibold mb-2">Interactive Card</h3>
                  <p className="text-text-muted text-sm">Clickable with focus states</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Form Components</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Form Fields & File Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField 
                label="Product Name" 
                required
                helperText="Enter the name of your product"
              >
                <Input placeholder="Fresh Tomatoes" />
              </FormField>
              
              <FormField 
                label="Product Images" 
                helperText="Upload product photos (PNG, JPG)"
              >
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  value={selectedFiles}
                  acceptedTypes={['image/*']}
                  maxFiles={5}
                  multiple
                  maxFileSize={5}
                />
              </FormField>
            </CardContent>
          </Card>
        </section>

        {/* Data Display Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Data Display</h2>
          
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Search Bar</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search products, vendors..."
                onSearch={(value) => addToast('info', `Searching for: ${value}`)}
              />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                data={sampleData}
                columns={tableColumns}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                hoverable
                onRowClick={(record) => addToast('info', `Clicked on ${record.name}`)}
              />
              
              <div className="p-6 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                  totalItems={25}
                  itemsPerPage={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card>
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No products found"
                description="Try adjusting your search criteria or add some products to get started."
                action={
                  <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Add Product
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Loading States</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Loading Spinners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center space-y-2">
                  <LoadingSpinner size="sm" />
                  <p className="text-xs text-text-muted">Small</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-text-muted">Medium</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs text-text-muted">Large</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="xl" />
                  <p className="text-xs text-text-muted">Extra Large</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Demos */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Interactive Components</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Modals & Dialogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setShowModal(true)}>
                  Open Modal
                </Button>
                <Button onClick={() => setShowConfirm(true)} variant="danger">
                  Show Confirm Dialog
                </Button>
                <Button onClick={() => addToast('success', 'Hello from toast!')}>
                  Show Toast
                </Button>
                <Button onClick={() => addToast('error', 'Something went wrong!')}>
                  Show Error Toast
                </Button>
                <Button onClick={() => addToast('warning', 'Warning message')}>
                  Show Warning Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sample Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-text-muted">
              This is a sample modal demonstrating the modal component with proper focus management, 
              keyboard navigation, and accessibility features.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            addToast('success', 'Action confirmed!');
          }}
          title="Confirm Action"
          message="Are you sure you want to perform this action? This cannot be undone."
          variant="danger"
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} position="top-right" />
      </div>
    </div>
  );
};