import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Define types for our cart context
interface CartItem {
  itemId: string;
  itemType: string;
  quantity: number;
  price: number;
  name: string;
  description?: string;
  variantSelections?: Array<{
    name: string;
    value: string;
  }>;
}

// Updated Cart interface to match your actual data structure
interface Cart {
  _id: Id<"carts">;
  _creationTime: number;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Made optional to match actual data
  subtotal: number;
  total: number;
  taxes?: number; // Made optional to match actual data
  fees?: number; // Made optional to match actual data
}

interface AddItemArgs {
  itemId: string;
  itemType: string;
  quantity: number;
  variantSelections?: Array<{
    name: string;
    value: string;
  }>;
}

interface CartContextType {
  cart: Cart | null;
  cartId: Id<"carts"> | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  addItemToCart: (item: AddItemArgs) => Promise<void>;
  updateItemQuantity: (itemIndex: number, quantity: number) => Promise<void>;
  removeItemFromCart: (itemIndex: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartId, setCartId] = useState<Id<"carts"> | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Try to get the session ID from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem("cartSessionId");
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Get mutations from Convex
  const getOrCreateCartMutation = useMutation(api.cart.getOrCreateCart);
  const addItemMutation = useMutation(api.cart.addItemToCart);
  const updateQuantityMutation = useMutation(api.cart.updateItemQuantity);
  const removeItemMutation = useMutation(api.cart.removeItemFromCart);
  const clearCartMutation = useMutation(api.cart.clearCart);

  // Fetch the cart with the cartId
  const cartResult = useQuery(api.cart.getCart, cartId ? { cartId } : "skip");
  
  // Convert cartResult to our Cart | null type
  const cart: Cart | null = cartResult as Cart | null;

  // Initialize cart on component mount
  useEffect(() => {
    async function initCart() {
      if (loading && !cartId) {
        try {
          const result = await getOrCreateCartMutation({ 
            sessionId: sessionId || undefined 
          });
          
          setCartId(result.cartId);
          setSessionId(result.sessionId);
          
          // Save session ID to localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem("cartSessionId", result.sessionId);
          }
          
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to create cart");
          setLoading(false);
        }
      } else if (cartId && cartResult) {
        // If we have a cart and the data is loaded, we're no longer loading
        setLoading(false);
      }
    }
    
    initCart();
  }, [getOrCreateCartMutation, cartId, sessionId, loading, cartResult]);

  // Refresh cart data when triggered
  const refreshCart = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Add item to cart with proper error handling
  const addItemToCart = async (item: AddItemArgs) => {
    try {
      if (!cartId) {
        // Ensure we have a cart first
        const result = await getOrCreateCartMutation({ 
          sessionId: sessionId || undefined 
        });
        setCartId(result.cartId);
        setSessionId(result.sessionId);
        
        // Now add the item to the new cart
        await addItemMutation({
          cartId: result.cartId,
          ...item
        });
      } else {
        // Add to existing cart
        await addItemMutation({
          cartId,
          ...item
        });
      }
      
      // Refresh cart data
      refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item to cart");
      throw err;
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemIndex: number, quantity: number) => {
    try {
      if (!cartId) {
        throw new Error("No cart available");
      }
      
      await updateQuantityMutation({
        cartId,
        itemIndex,
        quantity
      });
      
      refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item quantity");
      throw err;
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (itemIndex: number) => {
    try {
      if (!cartId) {
        throw new Error("No cart available");
      }
      
      await removeItemMutation({
        cartId,
        itemIndex
      });
      
      refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item from cart");
      throw err;
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      if (!cartId) {
        throw new Error("No cart available");
      }
      
      await clearCartMutation({
        cartId
      });
      
      refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear cart");
      throw err;
    }
  };

  // The context value that will be provided to consumers
  const contextValue: CartContextType = {
    cart,
    cartId,
    sessionId,
    loading,
    error,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  return context;
}