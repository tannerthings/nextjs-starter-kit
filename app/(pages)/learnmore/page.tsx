// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import ShoppingCart from '@/components/ShoppingCart';
import TicketSelector from '@/components/TicketSelector';
import MerchandiseSelector from '@/components/MerchandiseSelector';
import  MultiStepCheckout from '@/components/MultiStepCheckout';

export default function LearnMorePage() {
  // Session and cart management
  const [sessionId, setSessionId] = useState<string>("");
  const [cartId, setCartId] = useState<Id<"carts"> | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<Id<"orders"> | null>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Get or create cart
  const getOrCreateCart = useMutation(api.cart.getOrCreateCart);
  
  // Get event info (in a real app, this would come from a route parameter)
  const events = useQuery(api.events.getActive) || [];
  const event = events[0]; // Just use the first active event for this demo
  
  // Initialize session and cart
  useEffect(() => {
    const initializeSession = async () => {
      // Try to get session ID from localStorage
      let storedSessionId = localStorage.getItem('eventSessionId');
      
      if (!storedSessionId) {
        // Generate a new random session ID if none exists
        storedSessionId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('eventSessionId', storedSessionId);
      }
      
      setSessionId(storedSessionId);
      
      // Get or create cart for this session
      try {
        const { cartId: newCartId } = await getOrCreateCart({ sessionId: storedSessionId });
        setCartId(newCartId);
      } catch (error) {
        console.error('Error initializing cart:', error);
      }
    };
    
    initializeSession();
  }, [getOrCreateCart]);
  
  // Handle cart updates
  const handleCartUpdated = () => {
    setCartUpdated(!cartUpdated);
    setShowCart(true);
  };
  
  // Handle checkout process
  const handleCheckout = () => {
    setIsCheckingOut(true);
  };
  
  const handleCheckoutComplete = (orderId: Id<"orders">) => {
    setCompletedOrderId(orderId);
    setIsCheckingOut(false);
    
    // Create a new cart for future purchases
    const initializeNewCart = async () => {
      try {
        const { cartId: newCartId } = await getOrCreateCart({ sessionId });
        setCartId(newCartId);
      } catch (error) {
        console.error('Error initializing new cart:', error);
      }
    };
    
    initializeNewCart();
  };
  
  const handleCheckoutCancel = () => {
    setIsCheckingOut(false);
  };
  
  // If no event is available, show a message
  if (!event) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">No Active Events</h1>
          <p className="mt-2 text-gray-600">There are no active events at this time. Please check back later.</p>
        </div>
      </main>
    );
  }
  
  // Order confirmation screen
  if (completedOrderId) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            
            <div className="bg-gray-50 p-4 rounded mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Order ID:</p>
              <p className="font-medium">{completedOrderId}</p>
            </div>
            
            <p className="text-gray-600 mb-8">
              A confirmation email has been sent with your order details.
              Please check your email for further instructions.
            </p>
            
            <div>
              <button
                onClick={() => setCompletedOrderId(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Event
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  // Checkout process
  if (isCheckingOut && cartId) {
    return (
      <main className="min-h-screen bg-gray-100 py-12">
        <MultiStepCheckout
          cartId={cartId}
          onComplete={handleCheckoutComplete}
          onCancel={handleCheckoutCancel}
        />
      </main>
    );
  }
  
  // Main event page with ticket and merchandise selection
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">{event.name}</h1>
          <p className="mt-4 text-xl text-gray-600">{event.description}</p>
          
          <div className="mt-6 flex justify-center space-x-8 text-gray-600">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{event.venue}</span>
            </div>
          </div>
        </header>
        
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700 leading-relaxed">
              {/* In a real app, this would be a rich description from the event */}
              Join us for an incredible event experience! This multi-day conference features
              industry-leading speakers, networking opportunities, and hands-on workshops.
              Whether you&aposre a beginner or an expert, there&aposs something for everyone.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">What&aposs Included</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Access to all keynote sessions</li>
                  <li>Workshop materials</li>
                  <li>Lunch and refreshments</li>
                  <li>Networking reception</li>
                  <li>Event swag bag</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Who Should Attend</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Industry professionals</li>
                  <li>Team leads and managers</li>
                  <li>Students and academics</li>
                  <li>Entrepreneurs and startups</li>
                  <li>Anyone interested in the field</li>
                </ul>
              </div>
            </div>
          </div>
        </section>     
      </div>
    </main>
  );
}