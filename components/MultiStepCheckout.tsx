// components/MultiStepCheckout.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface CheckoutProps {
  cartId: Id<"carts">;
  onComplete: (orderId: Id<"orders">) => void;
  onCancel: () => void;
}

interface AttendeeInfo {
  ticketId: string;
  quantity: number;
  attendees: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dietaryRestrictions?: string;
  }[];
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

export default function MultiStepCheckout({ cartId, onComplete, onCancel }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
  });
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({
    method: '',
    email: '',
    phone: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Mutations
  const checkout = useMutation(api.cart.checkout);
  const addAttendee = useMutation(api.cart.addAttendee);
  const completeOrder = useMutation(api.cart.completeOrder);
  
  // Queries - FIXED: Ensure cartId is passed correctly and check if it's valid
  const cart = useQuery(api.cart.getCart, cartId ? { cartId } : "skip");
  
  // Show loading indicator if cart is undefined (still loading)
  if (cart === undefined) {
    return <div>Loading...</div>;
  }
  
  // Handle case where cartId might be invalid or cart data couldn't be fetched
  if (cart === null) {
    return <div>Cart not found or could not be loaded.</div>;
  }
  
  // Check if cart has tickets that need attendee info
  const hasTickets = cart.items.some(item => item.itemType === 'ticket');
  
  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate customer info
    const newErrors: Record<string, string> = {};
    
    if (!customerInfo.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!customerInfo.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If all is valid and cart has tickets, prepare attendee info for next step
    if (hasTickets) {
      const newAttendeeInfo: AttendeeInfo[] = cart.items
      .filter(item => item.itemType === 'ticket')
      .map((item: CartItem) => ({
        ticketId: item.itemId,
        quantity: item.quantity,
        attendees: Array(item.quantity).fill(null).map(() => ({
          firstName: '',
          lastName: '',
          email: customerInfo.email, // Pre-fill with customer email
          phone: customerInfo.phone, // Pre-fill with customer phone
          dietaryRestrictions: '',
        })),
      }));
      
      setAttendeeInfo(newAttendeeInfo);
      setErrors({});
      setStep(2);
    } else {
      // Skip attendee step if no tickets in cart
      setErrors({});
      setStep(3);
    }
  };
  
  const handleAttendeeInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all attendee info
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    attendeeInfo.forEach((info, infoIndex) => {
      info.attendees.forEach((attendee, attendeeIndex) => {
        if (!attendee.firstName) {
          newErrors[`attendee-${infoIndex}-${attendeeIndex}-firstName`] = 'First name is required';
          isValid = false;
        }
        
        if (!attendee.lastName) {
          newErrors[`attendee-${infoIndex}-${attendeeIndex}-lastName`] = 'Last name is required';
          isValid = false;
        }
        
        if (!attendee.email) {
          newErrors[`attendee-${infoIndex}-${attendeeIndex}-email`] = 'Email is required';
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(attendee.email)) {
          newErrors[`attendee-${infoIndex}-${attendeeIndex}-email`] = 'Email is invalid';
          isValid = false;
        }
      });
    });
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setStep(3);
  };
  
  const handlePaymentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment info
    const newErrors: Record<string, string> = {};
    
    if (!paymentInfo.method) {
      newErrors.method = 'Payment method is required';
    }
    
    if (paymentInfo.method === 'paypal' && !paymentInfo.email) {
      newErrors.paymentEmail = 'PayPal email is required';
    }
    
    if (paymentInfo.method === 'zelle' && !paymentInfo.phone) {
      newErrors.paymentPhone = 'Zelle phone number is required';
    }
    
    if (!paymentInfo.confirmation) {
      newErrors.confirmation = 'Payment confirmation is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Submit order
      const { orderId } = await checkout({
        cartId,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        paymentMethod: paymentInfo.method,
        paymentEmail: paymentInfo.email,
        paymentPhone: paymentInfo.phone,
      });
      
      // Add attendees only for ticket items
      if (hasTickets) {
        for (const info of attendeeInfo) {
          for (const attendee of info.attendees) {
            await addAttendee({
              orderId,
              ticketTypeId: info.ticketId,
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              email: attendee.email,
              phone: attendee.phone,
              dietaryRestrictions: attendee.dietaryRestrictions,
            });
          }
        }
      }
      
      // Complete order with payment confirmation
      await completeOrder({
        orderId,
        paymentConfirmation: paymentInfo.confirmation,
      });


      setStep(4);
      onComplete(orderId);

     //
     //  await sendReservationEmail();
      

// Extract all attendee emails into a single array
const allAttendeeEmails = attendeeInfo.flatMap(info => 
  info.attendees.map(attendee => attendee.email)
);

// Call the updated sendReservationEmail function
await sendReservationEmail(
  orderId,
  customerInfo.email,
  allAttendeeEmails,
  "susanrwiley@gmail.com", // Replace with actual admin email or fetch from config
  {
    items: cart.items,
    total: cart.total
  }
);

    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({
        form: 'An error occurred during checkout. Please try again.',
      });
    }
  };
  
  // Render the order summary
  const renderOrderSummary = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
        
        <div className="border-b border-gray-200 pb-4 mb-4">
          {cart.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm mb-2">
              <div>
                <span>{item.name} x {item.quantity}</span>
                {item.variantSelections && item.variantSelections.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {item.variantSelections.map((v, i) => (
                      <span key={i}>{v.name}: {v.value}{i < item.variantSelections!.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                )}
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </div>
    );
  };
  
  // Step 1: Customer Info
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Contact Information</h2>
        
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.form}
          </div>
        )}
        
        {renderOrderSummary()}
        
        <form onSubmit={handleCustomerInfoSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Rest of the component remains unchanged...
  // Step 2: Attendee Info (only for tickets)
  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Attendee Information</h2>
        
        <form onSubmit={handleAttendeeInfoSubmit}>
          {attendeeInfo.map((info, infoIndex) => (
            <div key={info.ticketId} className="mb-8">
              <h3 className="text-lg font-medium mb-4">
                {cart.items.find(item => item.itemId === info.ticketId)?.name} 
                ({info.quantity} {info.quantity === 1 ? 'ticket' : 'tickets'})
              </h3>
              
              {info.attendees.map((attendee, attendeeIndex) => (
                <div key={attendeeIndex} className="border-t border-gray-200 pt-4 mb-6">
                  <h4 className="text-md font-medium mb-3">Attendee {attendeeIndex + 1}</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label 
                        htmlFor={`attendee-${infoIndex}-${attendeeIndex}-firstName`} 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id={`attendee-${infoIndex}-${attendeeIndex}-firstName`}
                        value={attendee.firstName}
                        onChange={(e) => {
                          const newAttendeeInfo = [...attendeeInfo];
                          newAttendeeInfo[infoIndex].attendees[attendeeIndex].firstName = e.target.value;
                          setAttendeeInfo(newAttendeeInfo);
                        }}
                        className={`w-full p-2 border rounded ${
                          errors[`attendee-${infoIndex}-${attendeeIndex}-firstName`] 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[`attendee-${infoIndex}-${attendeeIndex}-firstName`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`attendee-${infoIndex}-${attendeeIndex}-firstName`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label 
                        htmlFor={`attendee-${infoIndex}-${attendeeIndex}-lastName`} 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id={`attendee-${infoIndex}-${attendeeIndex}-lastName`}
                        value={attendee.lastName}
                        onChange={(e) => {
                          const newAttendeeInfo = [...attendeeInfo];
                          newAttendeeInfo[infoIndex].attendees[attendeeIndex].lastName = e.target.value;
                          setAttendeeInfo(newAttendeeInfo);
                        }}
                        className={`w-full p-2 border rounded ${
                          errors[`attendee-${infoIndex}-${attendeeIndex}-lastName`] 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[`attendee-${infoIndex}-${attendeeIndex}-lastName`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`attendee-${infoIndex}-${attendeeIndex}-lastName`]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label 
                      htmlFor={`attendee-${infoIndex}-${attendeeIndex}-email`} 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id={`attendee-${infoIndex}-${attendeeIndex}-email`}
                      value={attendee.email}
                      onChange={(e) => {
                        const newAttendeeInfo = [...attendeeInfo];
                        newAttendeeInfo[infoIndex].attendees[attendeeIndex].email = e.target.value;
                        setAttendeeInfo(newAttendeeInfo);
                      }}
                      className={`w-full p-2 border rounded ${
                        errors[`attendee-${infoIndex}-${attendeeIndex}-email`] 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      }`}
                    />
                    {errors[`attendee-${infoIndex}-${attendeeIndex}-email`] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[`attendee-${infoIndex}-${attendeeIndex}-email`]}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label 
                      htmlFor={`attendee-${infoIndex}-${attendeeIndex}-dietaryRestrictions`} 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Dietary Restrictions
                    </label>
                    <input
                      type="text"
                      id={`attendee-${infoIndex}-${attendeeIndex}-dietaryRestrictions`}
                      value={attendee.dietaryRestrictions || ''}
                      onChange={(e) => {
                        const newAttendeeInfo = [...attendeeInfo];
                        newAttendeeInfo[infoIndex].attendees[attendeeIndex].dietaryRestrictions = e.target.value;
                        setAttendeeInfo(newAttendeeInfo);
                      }}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Step 3: Payment Info
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">Payment Information</h2>
        
        {renderOrderSummary()}
        
        <form onSubmit={handlePaymentInfoSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative border rounded p-3 flex cursor-pointer border-gray-300">
                <input
                  type="radio"
                  name="payment-method"
                  id="paypal"
                  value="paypal"
                  className="h-4 w-4 mt-1"
                  checked={paymentInfo.method === 'paypal'}
                  onChange={() => setPaymentInfo({ ...paymentInfo, method: 'paypal' })}
                />
                <label htmlFor="paypal" className="ml-3 flex flex-col cursor-pointer">
                  <span className="block text-sm font-medium text-gray-900">PayPal (Friends & Family)</span>
                </label>
              </div>
              
              <div className="relative border rounded p-3 flex cursor-pointer border-gray-300">
                <input
                  type="radio"
                  name="payment-method"
                  id="zelle"
                  value="zelle"
                  className="h-4 w-4 mt-1"
                  checked={paymentInfo.method === 'zelle'}
                  onChange={() => setPaymentInfo({ ...paymentInfo, method: 'zelle' })}
                />
                <label htmlFor="zelle" className="ml-3 flex flex-col cursor-pointer">
                  <span className="block text-sm font-medium text-gray-900">Zelle</span>
                </label>
              </div>
            </div>
            {errors.method && <p className="mt-1 text-xs text-red-500">{errors.method}</p>}
          </div>
          
          {/* Payment Instructions */}
          {paymentInfo.method && (
            <div className="mb-6 p-4 bg-blue-50 text-sm text-blue-700 rounded">
              <p className="font-medium mb-2">Payment Instructions:</p>
              {paymentInfo.method === 'paypal' && (
                <div>
                  <p>Please send ${cart.total.toFixed(2)} to:</p>
                  <p className="font-medium my-2">keithreeves172@gmail.com</p>
                  <p>Use the &quot;Friends &ldquo; Family&quot; option and include your full name in the notes.</p>
                </div>
              )}
              {paymentInfo.method === 'zelle' && (
                <div>
                  <p>Please send ${cart.total.toFixed(2)} to:</p>
                  <p className="font-medium my-2">+1 (571) 284-9833 or keithreeves172@gmail.com</p>
                  <p>Include your full name in the memo.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Payment details based on selected method */}
          {paymentInfo.method === 'paypal' && (
            <div className="mb-4">
              <label htmlFor="paymentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Your PayPal Email *
              </label>
              <input
                type="email"
                id="paymentEmail"
                value={paymentInfo.email}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                className={`w-full p-2 border rounded ${errors.paymentEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email used for your PayPal payment"
              />
              {errors.paymentEmail && <p className="mt-1 text-xs text-red-500">{errors.paymentEmail}</p>}
            </div>
          )}
          
          {paymentInfo.method === 'zelle' && (
            <div className="mb-4">
              <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Your Zelle Phone Number *
              </label>
              <input
                type="tel"
                id="paymentPhone"
                value={paymentInfo.phone}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, phone: e.target.value })}
                className={`w-full p-2 border rounded ${errors.paymentPhone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Phone number used for your Zelle payment"
              />
              {errors.paymentPhone && <p className="mt-1 text-xs text-red-500">{errors.paymentPhone}</p>}
            </div>
          )}
          
          {/* Transaction ID field for verification */}
          {paymentInfo.method && (
            <div className="mb-6">
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID/Confirmation *
              </label>
              <input
                type="text"
                id="confirmation"
                value={paymentInfo.confirmation}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, confirmation: e.target.value })}
                className={`w-full p-2 border rounded ${errors.confirmation ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter the transaction ID or last 4 digits of your confirmation"
              />
              {errors.confirmation && <p className="mt-1 text-xs text-red-500">{errors.confirmation}</p>}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(hasTickets ? 2 : 1)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Complete Order
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Step 4: Confirmation (handled by parent component)
  return null;
}

  async function sendReservationEmail(
    orderId: Id<"orders">,
    customerEmail: string,
    attendeeEmails: string[],
    adminEmail: string,
    orderDetails: {
      items: CartItem[],
      total: number
    }
  ) {
    try {
      // Customer email confirmation
      await fetch("/api/email/send-email-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC`,
        },
        body: JSON.stringify({
          to: customerEmail,
          subject: "Your Registration Confirmation",
          html: `
            <h1>Thank you for your order!</h1>
            <p>Order ID: ${orderId}</p>
            <p>Total: $${orderDetails.total.toFixed(2)}</p>
            <!-- Add more order details here -->
          `,
        }),
      });


      console.log("Attendee notification email");
      
      // Optional: Send emails to each attendee (if different from customer)
      for (const email of attendeeEmails) {
        if (email !== customerEmail) {
          await fetch("/api/email/send-email-confirmation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC`,
            },
            body: JSON.stringify({
              to: email,
              emailType: 'attendee',
              subject: "Your Registration Information",
              html: `
                <h1>Your Registration Information</h1>
                <p>Order ID: ${orderId}</p>
                <!-- Add more ticket-specific details here -->
              `,
            }),
          });
        }
      }
      
      console.log("Admin notification email");
      // Admin notification email
      await fetch("/api/email/send-email-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer re_Ss3v3cFu_GNyfvPqDkEV9RWDJ4q3YJ9eC`,
        },
        body: JSON.stringify({
          to: adminEmail,
          emailType: 'admin',
          subject: "New Order Received",
          html: `
            <h1>New Order Received</h1>
            <p>Order ID: ${orderId}</p>
            <p>Customer: ${customerEmail}</p>
            <p>Total: $${orderDetails.total.toFixed(2)}</p>
            <a href='https://www.wileyswiftreunion.com/attendees'>Attendees Management</a>
            <!-- Add more order details here for admin -->
          `,
        }),
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }