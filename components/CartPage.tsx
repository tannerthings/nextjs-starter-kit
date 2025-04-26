import React from 'react';
import { useCart } from '../contexts/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { 
    cart, 
    loading, 
    error, 
    updateItemQuantity, 
    removeItemFromCart, 
    clearCart 
  } = useCart();

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading your cart</p>
          <p>{error}</p>
          <button 
            className="text-blue-500 underline mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Handle empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl mb-4">Your cart is empty</h2>
          <p className="mb-6">Add some items to get started!</p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Handle quantity change
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    try {
      await updateItemQuantity(index, newQuantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (index: number) => {
    try {
      await removeItemFromCart(index);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  // Handle cart clearing
  const handleClearCart = async () => {
    try {
      if (window.confirm("Are you sure you want to clear your cart?")) {
        await clearCart();
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Cart Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-gray-700">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>
            
            {/* Cart Items */}
            {cart.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b items-center">
                <div className="col-span-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center mr-4">
                      {/* If you have images, you could render them here */}
                      <span className="text-xs text-center text-gray-500">
                        {item.itemType === 'ticket' ? '🎟️' : '🛍️'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.variantSelections && item.variantSelections.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {item.variantSelections.map(v => `${v.name}: ${v.value}`).join(", ")}
                        </div>
                      )}
                      <button
                        className="text-red-500 text-sm mt-1"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 text-center">
                  ${(item.price / 100).toFixed(2)}
                </div>
                
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <button
                      className="w-8 h-8 rounded-l bg-gray-200 flex items-center justify-center"
                      onClick={() => handleQuantityChange(index, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-r bg-gray-200 flex items-center justify-center"
                      onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 text-center font-medium">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </div>
              </div>
            ))}
            
            {/* Cart Actions */}
            <div className="p-4 flex justify-between">
              <button
                className="text-red-500"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              
              <Link href="/" className="text-blue-500">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(cart.subtotal / 100).toFixed(2)}</span>
              </div>
              
              {/* Add any additional fees or taxes here */}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(cart.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="block w-full bg-blue-500 text-white text-center py-2 rounded-lg mt-6"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}