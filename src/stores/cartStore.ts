import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Listing } from '@/types';

export interface CartItem {
  id: string;
  listing: Listing;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  // Item management
  addItem: (listing: Listing, quantity: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  
  // Bulk operations
  removeItems: (itemIds: string[]) => void;
  
  // Calculations
  recalculateTotals: () => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Validation
  validateCart: () => { isValid: boolean; errors: string[] };
  
  // Utility
  getItemById: (itemId: string) => CartItem | undefined;
  hasItem: (listingId: string) => boolean;
  getItemByListingId: (listingId: string) => CartItem | undefined;
}

type CartStore = CartState & CartActions;

const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return Math.round((quantity * unitPrice) * 100) / 100; // Round to 2 decimal places
};

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        totalItems: 0,
        totalAmount: 0,
        isLoading: false,
        error: null,

        // Item management
        addItem: (listing: Listing, quantity: number, notes?: string) => {
          const state = get();
          
          // Check if item already exists
          const existingItem = state.items.find(item => item.listing.id === listing.id);
          
          if (existingItem) {
            // Update existing item quantity
            get().updateQuantity(existingItem.id, existingItem.quantity + quantity);
            return;
          }

          // Add new item
          const newItem: CartItem = {
            id: generateCartItemId(),
            listing,
            quantity,
            unitPrice: listing.price,
            totalPrice: calculateItemTotal(quantity, listing.price),
            ...(notes && { notes }),
            addedAt: new Date().toISOString(),
          };

          const newItems = [...state.items, newItem];
          
          set({ 
            items: newItems,
            error: null,
          });
          
          get().recalculateTotals();
        },

        removeItem: (itemId: string) => {
          const state = get();
          const newItems = state.items.filter(item => item.id !== itemId);
          
          set({ 
            items: newItems,
            error: null,
          });
          
          get().recalculateTotals();
        },

        updateQuantity: (itemId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          const state = get();
          const newItems = state.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                totalPrice: calculateItemTotal(quantity, item.unitPrice),
              };
            }
            return item;
          });

          set({ 
            items: newItems,
            error: null,
          });
          
          get().recalculateTotals();
        },

        updateNotes: (itemId: string, notes: string) => {
          const state = get();
          const newItems = state.items.map(item => {
            if (item.id === itemId) {
              return { ...item, notes };
            }
            return item;
          });

          set({ items: newItems });
        },

        clearCart: () => {
          set({
            items: [],
            totalItems: 0,
            totalAmount: 0,
            error: null,
          });
        },

        // Bulk operations
        removeItems: (itemIds: string[]) => {
          const state = get();
          const newItems = state.items.filter(item => !itemIds.includes(item.id));
          
          set({ 
            items: newItems,
            error: null,
          });
          
          get().recalculateTotals();
        },

        // Calculations
        recalculateTotals: () => {
          const state = get();
          
          const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
          
          set({
            totalItems,
            totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
          });
        },

        // State management
        setLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: string | null) => set({ error }),
        clearError: () => set({ error: null }),

        // Validation
        validateCart: () => {
          const state = get();
          const errors: string[] = [];

          if (state.items.length === 0) {
            errors.push('Cart is empty');
          }

          // Check for invalid quantities
          const invalidItems = state.items.filter(item => item.quantity <= 0);
          if (invalidItems.length > 0) {
            errors.push('Some items have invalid quantities');
          }

          // Check for unavailable listings
          const unavailableItems = state.items.filter(item => !item.listing.isAvailable);
          if (unavailableItems.length > 0) {
            errors.push('Some items are no longer available');
          }

          // Check for insufficient stock
          const insufficientStockItems = state.items.filter(
            item => item.quantity > item.listing.availableQuantity
          );
          if (insufficientStockItems.length > 0) {
            errors.push('Some items exceed available stock');
          }

          // Check minimum order quantities
          const belowMinimumItems = state.items.filter(
            item => 
              item.listing.minOrderQuantity && 
              item.quantity < item.listing.minOrderQuantity
          );
          if (belowMinimumItems.length > 0) {
            errors.push('Some items are below minimum order quantity');
          }

          // Check maximum order quantities
          const aboveMaximumItems = state.items.filter(
            item => 
              item.listing.maxOrderQuantity && 
              item.quantity > item.listing.maxOrderQuantity
          );
          if (aboveMaximumItems.length > 0) {
            errors.push('Some items exceed maximum order quantity');
          }

          return {
            isValid: errors.length === 0,
            errors,
          };
        },

        // Utility
        getItemById: (itemId: string) => {
          return get().items.find(item => item.id === itemId);
        },

        hasItem: (listingId: string) => {
          return get().items.some(item => item.listing.id === listingId);
        },

        getItemByListingId: (listingId: string) => {
          return get().items.find(item => item.listing.id === listingId);
        },
      }),
      {
        name: 'cart-store',
        partialize: (state) => ({
          items: state.items,
          totalItems: state.totalItems,
          totalAmount: state.totalAmount,
        }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
);

// Helper hooks
export const useCart = () => {
  const {
    items,
    totalItems,
    totalAmount,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    validateCart,
  } = useCartStore();

  return {
    items,
    totalItems,
    totalAmount,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    validateCart,
    isEmpty: items.length === 0,
  };
};

export const useCartItem = (listingId: string) => {
  const getItemByListingId = useCartStore(state => state.getItemByListingId);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const updateNotes = useCartStore(state => state.updateNotes);
  
  const item = getItemByListingId(listingId);

  return {
    item,
    isInCart: !!item,
    quantity: item?.quantity || 0,
    updateQuantity: (quantity: number) => item && updateQuantity(item.id, quantity),
    removeItem: () => item && removeItem(item.id),
    updateNotes: (notes: string) => item && updateNotes(item.id, notes),
  };
};