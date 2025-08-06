import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Save,
  Eye,
  Plus,
  Minus,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  TextArea,
  Label,
  LoadingSpinner,
  Badge
} from '@/components/ui';
import {
  useCategoryTree,
  useCreateProduct,
  useUploadImages
} from '@/hooks/admin/useProductQueries';
import { CreateProductData, NutritionInfo } from '@/types/product';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';

// Validation Schema
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(200, 'Short description too long').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  comparePrice: z.number().min(0).optional(),
  unit: z.string().min(1, 'Unit is required'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  minOrderQuantity: z.number().min(1, 'Minimum order quantity must be at least 1'),
  maxOrderQuantity: z.number().min(1).optional(),
  tags: z.array(z.string()).default([]),
  isOrganic: z.boolean().default(false),
  shelfLife: z.number().min(1).optional(),
  storageInstructions: z.string().max(500).optional(),
  origin: z.string().max(100).optional(),
  harvestDate: z.string().optional(),
  nutritionInfo: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
    servingSize: z.string().optional()
  }).optional()
}).refine(data => {
  if (data.comparePrice && data.comparePrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Compare price must be higher than regular price",
  path: ["comparePrice"]
}).refine(data => {
  if (data.maxOrderQuantity && data.maxOrderQuantity < data.minOrderQuantity) {
    return false;
  }
  return true;
}, {
  message: "Maximum quantity must be greater than minimum quantity",
  path: ["maxOrderQuantity"]
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

interface ImageFile {
  file: File;
  preview: string;
  uploading?: boolean;
  uploaded?: boolean;
}

const ImageUploadZone: React.FC<{
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
}> = ({ images, onImagesChange, maxImages = 10 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages: ImageFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }));

    onImagesChange([...images, ...newImages]);
  }, [images, onImagesChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200',
          dragOver 
            ? 'border-bottle-green bg-bottle-green/5' 
            : 'border-gray-200 hover:border-gray-300',
          images.length >= maxImages && 'opacity-50 pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          disabled={images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            dragOver ? 'bg-bottle-green text-white' : 'bg-gray-100 text-gray-400'
          )}>
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-text-dark font-medium mb-1">
              {dragOver ? 'Drop images here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-text-muted">
              PNG, JPG, WEBP up to 5MB each ({images.length}/{maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden"
            >
              <img
                src={image.preview}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-bottle-green text-white px-2 py-1 rounded-full text-xs font-medium">
                  Primary
                </div>
              )}

              {/* Upload Status */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}

              {image.uploaded && (
                <div className="absolute top-2 right-2 bg-mint-fresh text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-tomato-red text-white rounded-full hover:bg-tomato-red/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {index > 0 && (
                  <button
                    onClick={() => moveImage(index, 0)}
                    className="p-2 bg-bottle-green text-white rounded-full hover:bg-bottle-green/80 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TagInput: React.FC<{
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}> = ({ tags, onTagsChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn(
      'w-full px-4 py-3 border rounded-2xl bg-earthy-beige/30 transition-all duration-300 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-glow-green',
      focused && 'bg-white shadow-lg shadow-glow-green'
    )}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            className="bg-bottle-green/10 text-bottle-green px-2 py-1 text-sm flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-tomato-red transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="w-full bg-transparent border-0 outline-none text-text-dark placeholder-text-muted/60"
      />
    </div>
  );
};

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showNutritionInfo, setShowNutritionInfo] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // API hooks
  const { data: categories } = useCategoryTree();
  const createProductMutation = useCreateProduct();
  const uploadImagesMutation = useUploadImages();

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      tags: [],
      isOrganic: false,
      minOrderQuantity: 1
    }
  });

  const watchedValues = watch();

  // Handle form submission
  const onSubmit = async (data: CreateProductFormData) => {
    try {
      if (images.length === 0) {
        toast.error('Please upload at least one product image');
        return;
      }

      // Upload images first
      const imageFiles = images.map(img => img.file);
      const uploadedImages = await uploadImagesMutation.mutateAsync(imageFiles);

      // Prepare product data
      const productData: CreateProductData = {
        ...data,
        images: imageFiles, // The API will handle the uploaded images
        comparePrice: data.comparePrice || undefined,
        maxOrderQuantity: data.maxOrderQuantity || undefined,
        shelfLife: data.shelfLife || undefined,
        storageInstructions: data.storageInstructions || undefined,
        origin: data.origin || undefined,
        harvestDate: data.harvestDate || undefined,
        nutritionInfo: showNutritionInfo ? data.nutritionInfo : undefined
      };

      // Create product
      await createProductMutation.mutateAsync(productData);
      
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product. Please try again.');
    }
  };

  const isLoading = isSubmitting || createProductMutation.isPending || uploadImagesMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Create New Product</h1>
            <p className="text-text-muted">Add a new product to the marketplace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            type="submit"
            form="create-product-form"
            leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </div>

      <form id="create-product-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" required>Product Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="Enter product name..."
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    {...register('shortDescription')}
                    error={errors.shortDescription?.message}
                    placeholder="Brief product description for listings..."
                  />
                </div>

                <div>
                  <Label htmlFor="description" required>Full Description</Label>
                  <TextArea
                    id="description"
                    {...register('description')}
                    error={errors.description?.message}
                    placeholder="Detailed product description..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        tags={field.value}
                        onTagsChange={field.onChange}
                        placeholder="Add tags (press Enter or comma to add)..."
                      />
                    )}
                  />
                  <p className="text-sm text-text-muted mt-2">
                    Add relevant tags to help customers find your product
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadZone
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                />
                {images.length === 0 && (
                  <div className="flex items-center gap-2 text-tomato-red text-sm mt-2">
                    <AlertCircle className="w-4 h-4" />
                    At least one product image is required
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" required>Price (৳)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comparePrice">Compare Price (৳)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('comparePrice', { 
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? undefined : Number(v)
                      })}
                      error={errors.comparePrice?.message}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-text-muted mt-1">
                      Original price to show discount
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="unit" required>Unit</Label>
                    <select
                      id="unit"
                      {...register('unit')}
                      className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 focus:outline-none"
                    >
                      <option value="">Select unit</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="piece">Piece</option>
                      <option value="bunch">Bunch</option>
                      <option value="packet">Packet</option>
                      <option value="bag">Bag</option>
                      <option value="box">Box</option>
                      <option value="liter">Liter</option>
                    </select>
                    {errors.unit && (
                      <p className="text-tomato-red text-sm mt-1">{errors.unit.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock" required>Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      {...register('stock', { valueAsNumber: true })}
                      error={errors.stock?.message}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minOrderQuantity" required>Minimum Order Quantity</Label>
                    <Input
                      id="minOrderQuantity"
                      type="number"
                      min="1"
                      {...register('minOrderQuantity', { valueAsNumber: true })}
                      error={errors.minOrderQuantity?.message}
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxOrderQuantity">Maximum Order Quantity</Label>
                    <Input
                      id="maxOrderQuantity"
                      type="number"
                      min="1"
                      {...register('maxOrderQuantity', { 
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? undefined : Number(v)
                      })}
                      error={errors.maxOrderQuantity?.message}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      {...register('origin')}
                      error={errors.origin?.message}
                      placeholder="e.g., Local Farm, Dhaka"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shelfLife">Shelf Life (days)</Label>
                    <Input
                      id="shelfLife"
                      type="number"
                      min="1"
                      {...register('shelfLife', { 
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? undefined : Number(v)
                      })}
                      error={errors.shelfLife?.message}
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <Label htmlFor="harvestDate">Harvest Date</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      {...register('harvestDate')}
                      error={errors.harvestDate?.message}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storageInstructions">Storage Instructions</Label>
                  <TextArea
                    id="storageInstructions"
                    {...register('storageInstructions')}
                    error={errors.storageInstructions?.message}
                    placeholder="How to store this product..."
                    rows={3}
                  />
                </div>

                {/* Organic Toggle */}
                <div className="flex items-center gap-3">
                  <Controller
                    name="isOrganic"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bottle-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bottle-green"></div>
                        <span className="ml-3 text-sm font-medium text-text-dark">
                          Organic Product
                        </span>
                      </label>
                    )}
                  />
                </div>

                {/* Nutrition Information Toggle */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowNutritionInfo(!showNutritionInfo)}
                    className="flex items-center gap-2 text-bottle-green font-medium hover:text-bottle-green/80 transition-colors"
                  >
                    {showNutritionInfo ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    Nutrition Information
                  </button>

                  {showNutritionInfo && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            min="0"
                            {...register('nutritionInfo.calories', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.protein', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.carbs', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.fat', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="fiber">Fiber (g)</Label>
                          <Input
                            id="fiber"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.fiber', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="sugar">Sugar (g)</Label>
                          <Input
                            id="sugar"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.sugar', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="sodium">Sodium (mg)</Label>
                          <Input
                            id="sodium"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register('nutritionInfo.sodium', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="servingSize">Serving Size</Label>
                          <Input
                            id="servingSize"
                            {...register('nutritionInfo.servingSize')}
                            placeholder="e.g., 100g"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Category & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="categoryId" required>Product Category</Label>
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-tomato-red text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Review Process</p>
                      <p className="text-xs text-amber-600 mt-1">
                        New products will be pending approval until reviewed by an admin.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Preview */}
            {(watchedValues.name || images.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {images.length > 0 && (
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={images[0].preview}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-text-dark line-clamp-2">
                        {watchedValues.name || 'Product Name'}
                      </h3>
                      <p className="text-sm text-text-muted mt-1">
                        {watchedValues.shortDescription || watchedValues.description?.substring(0, 100) || 'Product description...'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-bottle-green">
                          ৳{watchedValues.price?.toFixed(2) || '0.00'}
                        </span>
                        {watchedValues.unit && (
                          <span className="text-sm text-text-muted ml-1">
                            /{watchedValues.unit}
                          </span>
                        )}
                        {watchedValues.comparePrice && watchedValues.comparePrice > (watchedValues.price || 0) && (
                          <div className="text-sm text-text-muted line-through">
                            ৳{watchedValues.comparePrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {watchedValues.stock !== undefined && (
                        <div className="text-sm text-text-muted">
                          {watchedValues.stock} {watchedValues.unit} in stock
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {watchedValues.isOrganic && (
                        <Badge className="bg-mint-fresh/20 text-bottle-green px-2 py-1 text-xs">
                          Organic
                        </Badge>
                      )}
                      {watchedValues.tags?.map((tag) => (
                        <Badge key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;