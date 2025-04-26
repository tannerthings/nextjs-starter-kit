import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductDetail() {
  const router = useRouter();
  const { id, type = 'ticket' } = router.query;
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // For demo purposes, we'll use mock data
  // In a real implementation, you would fetch this from your API
  const productMock = {
    id: id as string,
    name: 'Sample Product',
    description: 'This is a sample product description.',
    price: 2500, // in cents
    imageUrl: '',
    available: 20,
    type: type as string
  };
  
  // Get cart context
  const { addItemToCart } = useCart();
  
  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!id) return;
    
    try {
      setAddingToCart(true);
      
      await addItemToCart({
        itemId: id as string,
        itemType: type as string,
        quantity,
        variantSelections: []
      });
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Product added to cart successfully!',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
      
    } catch (error) {
      // Show error notification
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to add product to cart',
        type: 'error'
      });
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };
  
  // If no product ID
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p>The product you&apos;re looking for does not exist or has been removed.</p>
          <Link href="/" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded inline-block">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
            {productMock.imageUrl ? (
    <Image
    src={productMock.imageUrl}
    alt={productMock.name}
    className="max-h-full max-w-full object-contain"
    width={500} // Set appropriate width
    height={500} // Set appropriate height
    priority={false} // Set to true if this image is above the fold
    quality={80} // Optional: image quality (default 75)
  />
            ) : (
              <span className="text-gray-400 text-4xl">
                {type === 'ticket' ? '🎟️' : '📦'}
              </span>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{productMock.name}</h1>
          
          <div className="text-2xl font-semibold mb-4">
            ${(productMock.price / 100).toFixed(2)}
          </div>
          
          <div className="mb-6">
            <p>{productMock.description}</p>
          </div>
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                className="w-10 h-10 rounded-l bg-gray-200 flex items-center justify-center"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 h-10 flex items-center justify-center border-t border-b">
                {quantity}
              </span>
              <button
                className="w-10 h-10 rounded-r bg-gray-200 flex items-center justify-center"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            className={`w-full py-3 rounded-lg font-medium ${
              addingToCart 
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 mr-3 border-b-2 border-white rounded-full"></span>
                Adding to Cart...
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
          
          {/* Availability */}
          <div className="mt-4 text-sm">
            {productMock.available > 10 ? (
              <span className="text-green-600">In Stock</span>
            ) : productMock.available > 0 ? (
              <span className="text-orange-600">Low Stock: {productMock.available} left</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}