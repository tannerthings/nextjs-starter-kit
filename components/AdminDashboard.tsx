// components/AdminDashboard.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Id } from '../convex/_generated/dataModel';

interface Attendee {
  _id: Id<"registrations">;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  ticketTypeId: string;
  dietaryRestrictions?: string;
  paymentMethod: string;
  paymentEmail?: string;
  paymentPhone?: string;
  paymentConfirmation: string;
  paymentStatus: string;
  paymentAmount: number;
  registrationDate: string;
  paymentVerified?: boolean;
  verificationDate?: string;
  verifiedBy?: string;
}

export default function AdminDashboard() {
  const registrations = useQuery(api.registrations.getAll) || [];
  const registrationsByDay = useQuery(api.registrations.getRegistrationsByDay) || [];
  const ticketTypeSummary = useQuery(api.registrations.getTicketTypeSummary) || [];
  const paymentMethodStats = useQuery(api.registrations.getPaymentMethodStats) || [];
  const totalRevenue = useQuery(api.registrations.getTotalRevenue) || 0;
  
  const verifyPayment = useMutation(api.registrations.verifyPayment);
  
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [adminName, setAdminName] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Id<"registrations"> | null>(null);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Filter attendees based on search input
  const filteredAttendees = registrations.filter((attendee: Attendee) => {
    const searchText = filterText.toLowerCase();
    return (
      attendee.firstName.toLowerCase().includes(searchText) ||
      attendee.lastName.toLowerCase().includes(searchText) ||
      attendee.email.toLowerCase().includes(searchText) //TT||
     //TT  attendee.company.toLowerCase().includes(searchText)
    );
  });
  
  const ticketTypes = {
    'early-bird': 'Early Bird',
    'regular': 'Regular',
    'vip': 'VIP'
  };
  
  const paymentMethods = {
    'paypal': 'PayPal (Friends & Family)',
    'zelle': 'Zelle'
  };
  
  // Function to render verification status badge
  const renderVerificationStatus = (attendee: Attendee) => {
    if (attendee.paymentStatus === 'completed' && !attendee.paymentVerified) {
      return (
        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
          Needs Verification
        </span>
      );
    }
    
    if (attendee.paymentStatus === 'verified' || attendee.paymentVerified) {
      return (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
          Verified
        </span>
      );
    }
    
    return null;
  };
  
  // Handle verification
  const handleVerifyPayment = async () => {
    if (selectedRegistration && adminName.trim()) {
      try {
        await verifyPayment({
          registrationId: selectedRegistration,
          adminName: adminName.trim()
        });
        
        setShowVerifyModal(false);
        setSelectedRegistration(null);
        setAdminName('');
      } catch (error) {
        console.error('Error verifying payment:', error);
        alert('An error occurred while verifying the payment. Please try again.');
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Event Management Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 ${
                activeTab === 'attendees'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('attendees')}
            >
              Attendees List
            </button>
          </li>
        </ul>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Registrations</h3>
              <p className="text-2xl font-bold">{registrations.length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Registrations Today</h3>
              <p className="text-2xl font-bold">
                {registrationsByDay.find(d => d.date === new Date().toISOString().split('T')[0])?.count || 0}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Pending Verification</h3>
              <p className="text-2xl font-bold">
                {registrations.filter((r: Attendee) => r.paymentStatus === 'completed' && !r.paymentVerified).length}
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Registrations Over Time */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Registrations Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={registrationsByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Registrations"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Ticket Type Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Ticket Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ticketTypeSummary}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ticketType" 
                      tickFormatter={(value) => ticketTypes[value as keyof typeof ticketTypes] || value}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Revenue ($)') return `$${value}`;
                        return value;
                      }}
                      labelFormatter={(value) => ticketTypes[value as keyof typeof ticketTypes] || value}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Quantity" fill="#3b82f6" />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Payment Methods Chart */}
          <div className="grid grid-cols-1 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paymentMethodStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="method" 
                      tickFormatter={(value) => paymentMethods[value as keyof typeof paymentMethods] || value}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Revenue ($)') return `$${value}`;
                        return value;
                      }}
                      labelFormatter={(value) => paymentMethods[value as keyof typeof paymentMethods] || value}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Quantity" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Recent Registrations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Recent Registrations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.slice(0, 5).map((attendee: Attendee) => (
                    <tr key={attendee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {attendee.firstName} {attendee.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{attendee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {ticketTypes[attendee.ticketTypeId as keyof typeof ticketTypes] || attendee.ticketTypeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${attendee.paymentAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(attendee.registrationDate)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendees Tab */}
      {activeTab === 'attendees' && (
        <div>
          <div className="mb-6">
            <div className="max-w-md">
              <label htmlFor="filter" className="sr-only">
                Search Attendees
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="filter"
                  name="filter"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search attendees..."
                  type="search"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ticket
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered On
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map((attendee: Attendee) => (
                  <tr key={attendee._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attendee.firstName} {attendee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{attendee.email}</div>
                      <div className="text-sm text-gray-500">{attendee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{attendee.company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ticketTypes[attendee.ticketTypeId as keyof typeof ticketTypes] || attendee.ticketTypeId}
                      </span>
                      {attendee.dietaryRestrictions && (
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="font-medium">Dietary:</span> {attendee.dietaryRestrictions}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${attendee.paymentAmount.toFixed(2)}</div>
                      <div className="text-xs">
                        {attendee.paymentMethod && (
                          <span className="text-gray-500">
                            {paymentMethods[attendee.paymentMethod as keyof typeof paymentMethods] || attendee.paymentMethod}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1">
                        {renderVerificationStatus(attendee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(attendee.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {attendee.paymentStatus === 'completed' && !attendee.paymentVerified ? (
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            setSelectedRegistration(attendee._id);
                            setShowVerifyModal(true);
                          }}
                        >
                          Verify Payment
                        </button>
                      ) : (
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            alert(`Edit attendee: ${attendee.firstName} ${attendee.lastName}`);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Payment Verification Modal */}
      {showVerifyModal && selectedRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Verify Payment</h3>
            
            <p className="mb-4 text-sm text-gray-600">
              Please confirm that you have verified the payment for this registration.
              This will mark the payment as verified in the system.
            </p>
            
            <div className="mb-4">
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name (for audit purposes)
              </label>
              <input
                type="text"
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedRegistration(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 border border-transparent rounded shadow-sm text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={!adminName.trim()}
                onClick={handleVerifyPayment}
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}