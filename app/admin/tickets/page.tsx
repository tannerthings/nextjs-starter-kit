'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import AdminLayout from '@/components/admin/AdminLayout';
import TicketTypeForm from '@/components/admin/TicketTypeForm';

export default function TicketsAdminPage() {
  const events = useQuery(api.events.getActive) || [];
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);
  
  // Only query ticket types if an event is selected
  const ticketTypes = useQuery(
    api.ticketTypes.getByEventId,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  ) || [];
  
  const updateTicketType = useMutation(api.ticketTypes.update);
  //const removeTicketType = useMutation(api.ticketTypes.remove);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<Id<"ticketTypes"> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Id<"ticketTypes"> | null>(null);
  
  const toggleTicketStatus = async (ticketId: Id<"ticketTypes">, currentStatus: boolean) => {
    await updateTicketType({
      id: ticketId,
      isActive: !currentStatus
    });
  };
  
  const handleDeleteClick = (ticketId: Id<"ticketTypes">) => {
    setConfirmDelete(ticketId);
  };
  
 // const handleConfirmDelete = async () => {
 //   if (confirmDelete) {
 //     await removeTicketType({ id: confirmDelete });
 //     setConfirmDelete(null);
 //   }
 // };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const handleEditClick = (ticketId: Id<"ticketTypes">) => {
    setEditingTicketId(ticketId);
    setShowCreateForm(false);
  };
  
  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingTicketId(null);
  };
  
  // Get the ticket being edited
  const editingTicket = editingTicketId 
    ? ticketTypes.find(ticket => ticket._id === editingTicketId)
    : null;
  
  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Ticket Types</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage ticket types for your events including pricing and availability.
            </p>
          </div>
        </div>
        
        {/* Event Selection */}
        <div className="mt-4 max-w-xl">
          <label htmlFor="event-select" className="block text-sm font-medium text-gray-700">
            Select Event
          </label>
          <select
            id="event-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedEventId || ''}
            onChange={(e) => {
              const newEventId = e.target.value ? e.target.value as Id<"events"> : null;
              setSelectedEventId(newEventId);
              setShowCreateForm(false);
              setEditingTicketId(null);
            }}
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEventId && (
          <div className="mt-4 sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">
                Tickets for {events.find(e => e._id === selectedEventId)?.name}
              </h2>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingTicketId(null);
                }}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Add Ticket Type
              </button>
            </div>
          </div>
        )}
        
        {/* Ticket Type Form (Create or Edit) */}
        {selectedEventId && (showCreateForm || editingTicketId) && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingTicketId ? 'Edit Ticket Type' : 'Create New Ticket Type'}
              </h3>
              <div className="mt-5">
                <TicketTypeForm 
                  eventId={selectedEventId}
                  ticketType={editingTicket}
                  onClose={handleFormClose}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Ticket Types Table */}
        {selectedEventId && (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Price
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Available
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Sold
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {ticketTypes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-3 text-center text-sm text-gray-500">
                            No ticket types found. Create your first ticket type to get started.
                          </td>
                        </tr>
                      ) : (
                        ticketTypes.map((ticket) => (
                          <tr key={ticket._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {ticket.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              ${ticket.price.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {ticket.available}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {ticket.sold}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  ticket.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {ticket.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex space-x-2 justify-end">
                                <button
                                  onClick={() => toggleTicketStatus(ticket._id, ticket.isActive)}
                                  className={`text-${ticket.isActive ? 'red' : 'green'}-600 hover:text-${ticket.isActive ? 'red' : 'green'}-900`}
                                >
                                  {ticket.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleEditClick(ticket._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(ticket._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Ticket Type
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this ticket type? Any registered attendees with this ticket type will be affected. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                   
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}