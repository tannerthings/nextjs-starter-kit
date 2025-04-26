// components/RegistrationForm.tsx
'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAction } from 'convex/react'; // Add this import

type TicketType = {
  id: string;
  name: string;
  price: number;
  description: string;
};

// Example ticket types - these would come from your Convex database in production
const TICKET_TYPES: TicketType[] = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 99,
    description: 'Limited availability early pricing'
  },
  {
    id: 'regular',
    name: 'Regular',
    price: 149,
    description: 'Standard conference ticket'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 299,
    description: 'Premium experience with exclusive networking events'
  }
];

export default function RegistrationForm() {
  const createRegistration = useMutation(api.registrations.create); 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    ticketTypeId: '',
    dietaryRestrictions: '',
    paymentMethod: '',
    paymentEmail: '',
    paymentPhone: '',
    paymentConfirmation: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  const selectedTicket = TICKET_TYPES.find(ticket => ticket.id === formData.ticketTypeId);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.ticketTypeId) newErrors.ticketTypeId = 'Please select a ticket type';
    
    // Validate payment method
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    } else {
      // Additional validation based on payment method
      if (formData.paymentMethod === 'paypal' && !formData.paymentEmail.trim()) {
        newErrors.paymentEmail = 'PayPal email is required';
      }
      
      if (formData.paymentMethod === 'zelle' && !formData.paymentPhone.trim()) {
        newErrors.paymentPhone = 'Zelle phone number is required';
      }
      
      if (!formData.paymentConfirmation.trim()) {
        newErrors.paymentConfirmation = 'Please enter the payment confirmation/transaction ID';
      }
    }
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear the error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    // First step: show payment details if ticket is selected but payment method isn't completed
    if (formData.ticketTypeId && !showPaymentDetails) {
      setShowPaymentDetails(true);
      return;
    }
    
    console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Set payment processing state for UI feedback
      setPaymentProcessing(true);
      
      // For manual payment methods, we don't need to process payment through an API
      // Just simulate a brief delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save registration to Convex with payment details
      await createRegistration({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        ticketTypeId: formData.ticketTypeId,
        dietaryRestrictions: formData.dietaryRestrictions,
        paymentMethod: formData.paymentMethod,
        paymentEmail: formData.paymentEmail,
        paymentPhone: formData.paymentPhone,
        paymentConfirmation: formData.paymentConfirmation,
        paymentStatus: 'completed', // For manual payment methods, we trust the user's confirmation
        paymentAmount: selectedTicket?.price || 0,
        registrationDate: new Date().toISOString()
      });
      
//


//
  
      setPaymentProcessing(false);
      setRegistrationComplete(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        ...errors,
        form: 'An error occurred during registration. Please try again.'
      });
      setPaymentProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (registrationComplete) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="mt-3 text-lg font-medium text-gray-900">Registration Complete!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for registering for our event. A confirmation email has been sent to {formData.email}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Register Another Attendee
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto my-10">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-center">Event Registration</h2>
        
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="ticketTypeId" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Type *
            </label>
            <select
              id="ticketTypeId"
              name="ticketTypeId"
              value={formData.ticketTypeId}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.ticketTypeId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a ticket type</option>
              {TICKET_TYPES.map(ticket => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.name} - ${ticket.price} - {ticket.description}
                </option>
              ))}
            </select>
            {errors.ticketTypeId && <p className="mt-1 text-xs text-red-500">{errors.ticketTypeId}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Restrictions
            </label>
            <textarea
              id="dietaryRestrictions"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          </div>
          
          {/* Payment Section - Only shown after selecting a ticket */}
          {showPaymentDetails && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className={`mr-2 ${errors.paymentMethod ? 'border-red-500' : ''}`}
                    />
                    <label htmlFor="paypal" className="text-sm text-gray-700">
                      PayPal (Friends & Family)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="zelle"
                      name="paymentMethod"
                      value="zelle"
                      checked={formData.paymentMethod === 'zelle'}
                      onChange={handleChange}
                      className={`mr-2 ${errors.paymentMethod ? 'border-red-500' : ''}`}
                    />
                    <label htmlFor="zelle" className="text-sm text-gray-700">
                      Zelle
                    </label>
                  </div>
                </div>
                {errors.paymentMethod && <p className="mt-1 text-xs text-red-500">{errors.paymentMethod}</p>}
              </div>
              
              {/* Payment Instructions */}
              <div className="mb-4 p-3 bg-blue-50 text-sm text-blue-700 rounded">
                <p className="font-medium mb-1">Payment Instructions:</p>
                {formData.paymentMethod === 'paypal' && (
                  <div>
                    <p>Please send the exact amount (${selectedTicket?.price.toFixed(2)}) to:</p>
                    <p className="font-medium my-1">payments@eventname.com</p>
                    <p>Use the &quot;Friends &#34; Family&quot; option and include your full name in the notes.</p>
                  </div>
                )}
                {formData.paymentMethod === 'zelle' && (
                  <div>
                    <p>Please send the exact amount (${selectedTicket?.price.toFixed(2)}) to:</p>
                    <p className="font-medium my-1">+1 (555) 123-4567 or payments@eventname.com</p>
                    <p>Include your full name in the memo.</p>
                  </div>
                )}
                {!formData.paymentMethod && (
                  <p>Select a payment method to see instructions.</p>
                )}
              </div>
              
              {/* Payment details based on selected method */}
              {formData.paymentMethod === 'paypal' && (
                <div className="mb-4">
                  <label htmlFor="paymentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Your PayPal Email *
                  </label>
                  <input
                    type="email"
                    id="paymentEmail"
                    name="paymentEmail"
                    value={formData.paymentEmail}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.paymentEmail ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Email used for your PayPal payment"
                  />
                  {errors.paymentEmail && <p className="mt-1 text-xs text-red-500">{errors.paymentEmail}</p>}
                </div>
              )}
              
              {formData.paymentMethod === 'zelle' && (
                <div className="mb-4">
                  <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Zelle Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="paymentPhone"
                    name="paymentPhone"
                    value={formData.paymentPhone}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.paymentPhone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Phone number used for your Zelle payment"
                  />
                  {errors.paymentPhone && <p className="mt-1 text-xs text-red-500">{errors.paymentPhone}</p>}
                </div>
              )}
              
              {/* Transaction ID field for verification */}
              {formData.paymentMethod && (
                <div className="mb-4">
                  <label htmlFor="paymentConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID/Confirmation *
                  </label>
                  <input
                    type="text"
                    id="paymentConfirmation"
                    name="paymentConfirmation"
                    value={formData.paymentConfirmation}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.paymentConfirmation ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter the transaction ID or last 4 digits of your confirmation"
                  />
                  {errors.paymentConfirmation && <p className="mt-1 text-xs text-red-500">{errors.paymentConfirmation}</p>}
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`mt-1 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the terms and conditions *
              </label>
            </div>
            {errors.agreeToTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms}</p>}
          </div>
          
          {selectedTicket && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-900">Order Summary</h3>
              <div className="mt-2 flex justify-between">
                <span>{selectedTicket.name} Ticket</span>
                <span>${selectedTicket.price.toFixed(2)}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-medium">
                <span>Total</span>
                <span>${selectedTicket.price.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-200 disabled:opacity-50"
          >
            {paymentProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {showPaymentDetails ? 'Completing Registration...' : 'Processing...'}
              </span>
            ) : (
              showPaymentDetails
                ? 'Complete Registration'
                : `Continue to Payment - ${selectedTicket?.price.toFixed(2) || '0.00'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}