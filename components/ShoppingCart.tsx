// components/ShoppingCart.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface CartProps {
  sessionId: string;
  cartId: Id<"carts"> | null;
  onCheckout: () => void;
}

interface CartItem {
  itemId: string;
  itemType: string;
  quantity: number;
  price: number;
  name: string;
  description?: string;
  variantSelections?: {
    name: string;
    value: string;
  }[];
}

export default function ShoppingCart({ sessionId, cartId, onCheckout }: CartProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Get or create cart if not provided
  const getOrCreateCart = useMutation(api.cart.getOrCreateCart);
  const [localCartId, setLocalCartId] = useState<Id<"carts"> | null>(cartId);
  
  // Cart mutations
  const updateItemQuantity = useMutation(api.cart.updateItemQuantity);
  const removeItemFromCart = useMutation(api.cart.removeItemFromCart);
  const clearCart = useMutation(api.cart.clearCart);
  
  // Get cart data
  const cart = useQuery(
    api.cart.getCart,
    localCartId ? { cartId: localCartId } : "skip"
  );
  
  useEffect(() => {
    // If no cartId is provided, create one
    const initializeCart = async () => {
      if (!localCartId) {
        const { cartId: newCartId } = await getOrCreateCart({ sessionId });
        setLocalCartId(newCartId);
      }
    };
    
    initializeCart();
  }, [sessionId, localCartId, getOrCreateCart]);
  
  if (!localCartId || !cart) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            0
          </span>
        </button>
      </div>
    );
  }
  
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  
  const handleQuantityChange = async (itemIndex: number, quantity: number) => {
    await updateItemQuantity({
      cartId: localCartId,
      itemIndex,
      quantity
    });
  };
  
  const handleRemoveItem = async (itemIndex: number) => {
    await removeItemFromCart({
      cartId: localCartId,
      itemIndex
    });
  };
  
  const handleClearCart = async () => {
    await clearCart({ cartId: localCartId });
  };
  
  // Render variant selections if they exist
  const renderVariants = (item: CartItem) => {
    if (!item.variantSelections || item.variantSelections.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-1 text-sm text-gray-500">
        {item.variantSelections.map((variant, idx) => (
          <span key={idx}>
            {variant.name}: {variant.value}
            {idx < item.variantSelections!.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <>
      {/* Cart Icon */}
      <div className="fixed top-4 right-4 z-50">
        <button
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Cart Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsCartOpen(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={() => setIsCartOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flow-root">
                        {cart.items.length === 0 ? (
                          <div className="text-center py-10">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                              />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Start adding items to your cart.</p>
                          </div>
                        ) : (
                          <ul className="-my-6 divide-y divide-gray-200">
                            {cart.items.map((item, index) => (
                              <li key={index} className="py-6 flex">
                                <div className="flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                    {renderVariants(item)}
                                    <div className="mt-1 text-xs text-gray-500">
                                      <span className="rounded-full bg-blue-100 text-yellow-800 px-2 py-0.5">
                                        {item.itemType === 'ticket' ? 'Ticket' : 'Merchandise'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button
                                        type="button"
                                        className="bg-gray-100 text-gray-600 px-2 rounded-l"
                                        onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                                      >
                                        -
                                      </button>
                                      <span className="mx-2 text-gray-700">{item.quantity}</span>
                                      <button
                                        type="button"
                                        className="bg-gray-100 text-gray-600 px-2 rounded-r"
                                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                        onClick={() => handleRemoveItem(index)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {cart.items.length > 0 && (
                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>${cart.subtotal.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex justify-between font-medium text-lg text-gray-900 mt-2 pt-2 border-t border-gray-200">
                        <p>Total</p>
                        <p>${cart.total.toFixed(2)}</p>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            onCheckout();
                          }}
                          className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Checkout
                        </button>
                      </div>
                      
                      <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                        <button
                          type="button"
                          className="text-blue-600 font-medium hover:text-blue-500"
                          onClick={() => handleClearCart()}
                        >
                          Clear Cart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}