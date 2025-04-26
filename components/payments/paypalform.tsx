// PayPalFnFPayment.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

// Types
export interface PayPalSettings {
  email: string;
  clientId: string;
  clientSecret: string;
  enableFriendsAndFamily: boolean;
  defaultCurrency: string;
  defaultLocale: string;
}

export interface Invoice {
  id: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  dueDate?: string;
}

export interface PayPalFnFPaymentProps {
  invoice: Invoice;
  paypalSettings: PayPalSettings;
  onPaymentLinkGenerated?: (link: string) => void;
  onPaymentConfirmed?: (transactionId: string, notes: string) => void;
  onCancel?: () => void;
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface PaymentLinkData {
  id?: string;
  invoiceId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail?: string;
  description: string;
  paymentLink: string;
  createdAt: string;
  status: PaymentStatus;
  confirmedAt?: string;
  transactionId?: string;
  notes?: string;
}

// PayPal Service Helper Class
class PayPalService {
  private settings: PayPalSettings;

  constructor(settings: PayPalSettings) {
    this.settings = settings;
  }

  /**
   * Generate a PayPal Friends & Family payment link
   */
  generateFriendsAndFamilyLink(paymentDetails: {
    invoiceId: string;
    amount: number;
    currency: string;
    customerName: string;
    description: string;
  }): string {
    if (!this.settings.email) {
      throw new Error('PayPal email is not configured');
    }
    
    const baseUrl = 'https://www.paypal.com/paypalme/';
    
    // Extract the PayPal.me username from the email or use a default one
    const username = this.settings.email.split('@')[0];
    
    // Create the basic link with the amount
    let paymentLink = `${baseUrl}${username}/${paymentDetails.amount}${paymentDetails.currency}`;
    
    // Add note with invoice ID (this will appear in the transaction)
    const note = `Invoice #${paymentDetails.invoiceId} - ${paymentDetails.description}`;
    paymentLink += `?note=${encodeURIComponent(note)}`;
    
    return paymentLink;
  }
  
  /**
   * Store payment link information in the database
   */
  async savePaymentLink(paymentDetails: PaymentLinkData): Promise<string> {
    try {
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentDetails)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save payment link');
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error saving payment link:', error);
      throw error;
    }
  }
}

/**
 * PayPal Friends & Family Payment Component
 * 
 * This component provides a complete workflow for generating and managing
 * PayPal Friends & Family payment links for invoices.
 */
const PayPalFnFPayment: React.FC<PayPalFnFPaymentProps> = ({
  invoice,
  paypalSettings,
  onPaymentLinkGenerated,
  onPaymentConfirmed,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [linkId, setLinkId] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  useEffect(() => {
    // Validate settings
    if (!paypalSettings.email) {
      setError('PayPal email is not configured. Please check your PayPal settings.');
    } else if (!paypalSettings.enableFriendsAndFamily) {
      setError('PayPal Friends & Family payments are not enabled in your settings.');
    }
  }, [paypalSettings]);
  
  const generatePaymentLink = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const paypalService = new PayPalService(paypalSettings);
      
      const paymentDetails = {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: paypalSettings.defaultCurrency,
        customerName: invoice.customerName,
        description: invoice.description
      };
      
      // Generate the payment link
      const link = paypalService.generateFriendsAndFamilyLink(paymentDetails);
      setPaymentLink(link);
      
      // Create payment link data
      const paymentLinkData: PaymentLinkData = {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: paypalSettings.defaultCurrency,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        description: invoice.description,
        paymentLink: link,
        createdAt: new Date().toISOString(),
        status: PaymentStatus.PENDING
      };
      
      // Save the payment link to the database
      const id = await paypalService.savePaymentLink(paymentLinkData);
      setLinkId(id);
      
      // Call the callback if provided
      if (onPaymentLinkGenerated) {
        onPaymentLinkGenerated(link);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink).then(() => {
      setIsCopied(true);
      toast.success('Payment link copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link to clipboard');
    });
  };
  
  const sendLinkToCustomer = async () => {
    if (!invoice.customerEmail) {
      toast.error('Customer email is not available');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/payments/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          linkId,
          invoiceId: invoice.id,
          customerName: invoice.customerName,
          recipientEmail: invoice.customerEmail,
          paymentLink
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send payment link');
      }
      
      toast.success(`Payment link sent to ${invoice.customerEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmPayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update payment status
      const response = await fetch(`/api/payments/${linkId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: PaymentStatus.COMPLETED,
          transactionId,
          notes,
          confirmedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }
      
      // Update the invoice status as paid
      await fetch(`/api/invoices/${invoice.id}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: 'PayPal Friends & Family',
          transactionId,
          notes
        })
      });
      
      // Hide confirmation dialog
      setShowConfirmation(false);
      
      // Call the callback if provided
      if (onPaymentConfirmed) {
        onPaymentConfirmed(transactionId, notes);
      }
      
      toast.success('Payment confirmed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="paypal-fnf-payment border rounded-lg p-4">
      {/* Header */}
      <div className="mb-4 pb-3 border-b">
        <h2 className="text-lg font-semibold">Wiley Swift Reunion - PayPal Friends & Family Payment</h2>
        <p className="text-sm text-gray-600">Generate a manual payment link for invoice #{invoice.id}</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Invoice Details */}
      <div className="mb-4 bg-gray-50 p-3 rounded-md">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Invoice:</span> {invoice.id}
          </div>
          <div>
            <span className="font-medium text-gray-700">Amount:</span> {invoice.amount} {paypalSettings.defaultCurrency}
          </div>
          <div>
            <span className="font-medium text-gray-700">Customer:</span> {invoice.customerName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Description:</span> {invoice.description}
          </div>
        </div>
      </div>
      
      {/* Payment Link Generation */}
      {!paymentLink ? (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:bg-yellow-300"
          onClick={generatePaymentLink}
          disabled={isLoading || !paypalSettings.email || !paypalSettings.enableFriendsAndFamily}
        >
          {isLoading ? 'Generating...' : 'Generate PayPal F&F Link'}
        </button>
      ) : (
        <div>
          {/* Display Generated Link */}
          <div className="mb-4">
            <label htmlFor="payment-link" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Link
            </label>
            <div className="flex">
              <input
                id="payment-link"
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                value={paymentLink}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="bg-gray-100 border border-gray-300 border-l-0 rounded-r-md px-3 hover:bg-gray-200"
                title="Copy to clipboard"
              >
                {isCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This link will direct the customer to pay using PayPal Friends & Family
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              onClick={() => window.open(paymentLink, '_blank')}
            >
              Preview Link
            </button>
            
            {invoice.customerEmail && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:bg-green-300"
                onClick={sendLinkToCustomer}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send to Customer'}
              </button>
            )}
            
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition-colors"
              onClick={() => setShowConfirmation(true)}
            >
              Mark as Paid
            </button>
          </div>
        </div>
      )}
      
      {/* Cancel Button */}
      {onCancel && (
        <button
          className="text-gray-600 hover:text-gray-900 text-sm mt-4"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
      
      {/* Payment Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm Payment Receipt</h3>
            <p className="mb-4 text-sm text-gray-600">
              Please verify that you have received the payment of <strong>{invoice.amount} {paypalSettings.defaultCurrency}</strong> from <strong>{invoice.customerName}</strong> in your PayPal account before confirming.
            </p>
            
            <div className="mb-4">
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                PayPal Transaction ID (optional)
              </label>
              <input
                type="text"
                id="transactionId"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 5RT49183D13246924"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can find this in your PayPal account activity
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this payment"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors disabled:bg-green-300"
                onClick={confirmPayment}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPalFnFPayment;