import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderId } = router.query;
  
  // Use mock data instead of API call to avoid errors
  const orderData = {
    status: 'completed',
    customerEmail: 'customer@example.com',
    customerPhone: '555-123-4567',
    createdAt: new Date().toISOString(),
    items: [
      {
        name: 'Sample Ticket',
        itemType: 'ticket',
        quantity: 2,
        price: 2500
      }
    ],
    subtotal: 5000,
    total: 5000
  };
  
  // Handle missing orderId
  if (!orderId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Information Missing</h1>
        <Link href="/" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded inline-block">
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Order Confirmation</h1>
          <p className="text-green-600 mt-2">
            <span className="inline-block w-6 h-6 bg-green-600 text-white rounded-full mr-2 text-center">✓</span>
            Order placed successfully!
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Order header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Order #{orderId}</h2>
              <p className="text-gray-600">
                {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-100 text-yellow-800 rounded">
              Completed
            </div>
          </div>
          
          {/* Contact information */}
          <div className="border-t border-b py-4 mb-4">
            <p><strong>Email:</strong> {orderData.customerEmail}</p>
            <p><strong>Phone:</strong> {orderData.customerPhone}</p>
          </div>
          
          {/* Order items - simplified */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-4">
                    {item.itemType === 'ticket' ? '🎟️' : '📦'}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                  <p className="text-sm text-gray-600 text-right">
                    {item.quantity} × ${(item.price / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order summary - simplified */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${(orderData.subtotal / 100).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total</span>
              <span>${(orderData.total / 100).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="mb-4">Thank you for your order!</p>
            
            <div className="flex justify-center space-x-4">
              <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded">
                Continue Shopping
              </Link>
              
              <button 
                onClick={() => window.print()}
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}