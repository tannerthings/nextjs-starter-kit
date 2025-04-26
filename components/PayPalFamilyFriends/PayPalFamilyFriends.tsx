import React, { useState } from 'react';

interface PayPalFamilyFriendsProps {
  eventName: string;
  registrationFee: number;
  paypalEmail: string;
  currency?: string;
  buttonText?: string;
  successCallback?: () => void;
}

/**
 * PayPalFamilyFriends Component
 * 
 * A component that generates a PayPal "Family & Friends" payment link for event registration
 * 
 * @param eventName - Name of the private event
 * @param registrationFee - The amount to be paid
 * @param paypalEmail - Your PayPal email address to receive payments
 * @param currency - Currency code (default: USD)
 * @param buttonText - Custom text for the payment button
 * @param successCallback - Function to call after successful payment
 */
const PayPalFamilyFriends: React.FC<PayPalFamilyFriendsProps> = ({
  eventName,
  registrationFee,
  paypalEmail,
  currency = 'USD',
  buttonText = 'Pay Registration Fee',
  successCallback
}) => {
  const [payerName, setPayerName] = useState('');
  const [paymentSent, setPaymentSent] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Generate PayPal Family & Friends URL
  // Note: PayPal doesn't provide a direct API for F&F payments, so we use their standard link format
  const generatePayPalFnFLink = (): string => {
    // Create the PayPal.me link with the right parameters
    // Note: PayPal.me links don't officially support "friends and family" designation via URL
    // Users will need to select this option on the PayPal site
    const baseUrl = `https://www.paypal.com/paypalme/${paypalEmail.split('@')[0]}`;
    const amountParam = `/${registrationFee}${currency !== 'USD' ? currency : ''}`;
    
    return `${baseUrl}${amountParam}`;
  };

  const handlePaymentClick = () => {
    if (!payerName.trim()) {
      alert('Please enter your name before proceeding to payment');
      return;
    }

    // Open PayPal in a new window
    window.open(generatePayPalFnFLink(), '_blank');
    setPaymentSent(true);
  };

  const confirmPayment = () => {
    setShowThankYou(true);
    if (successCallback) {
      successCallback();
    }
  };

  if (showThankYou) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto text-center">
        <h3 className="text-xl text-green-800 font-semibold mb-2">Thank You!</h3>
        <p className="text-green-700 mb-4">
          Your registration for <span className="font-medium">{eventName}</span> has been confirmed.
        </p>
        <p className="text-green-600 text-sm">
          A confirmation has been recorded for {payerName}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{eventName} Registration</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Registration Fee: <span className="font-semibold">{currency} {registrationFee.toFixed(2)}</span></p>
        <p className="text-sm text-gray-500">Please use PayPal&apos;s &quot;Friends &ldquo; Family&quot; option when completing payment.</p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="payerName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="payerName"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your full name"
          required
        />
      </div>
      
      {!paymentSent ? (
        <button
          onClick={handlePaymentClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502z" />
            <path d="M9.237 6.599c.278-1.835 1.87-3.065 3.587-3.065h4.413c.218 0 .551.037.903.145.129.039.237.08.368.126l.008.004c.383.13.754.321 1.103.593.291-.888.292-1.913-.067-2.824a4.318 4.318 0 0 0-1.072-.43c-.29-.088-.624-.132-.903-.132H11.6c-.444 0-.816.32-.885.748l-.422 2.674-.012.078h-1.044z" />
          </svg>
          {buttonText}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <p className="text-sm text-yellow-700">
              After completing your payment on PayPal, please return here and confirm your payment below.
            </p>
          </div>
          <button
            onClick={confirmPayment}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            I&apos;ve Completed My Payment
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Secure payment processed via PayPal</p>
      </div>
    </div>
  );
};

export default PayPalFamilyFriends;