'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface TicketTypeFormProps {
  eventId: Id<"events">;
  ticketType?: {
    _id: Id<"ticketTypes">;
    name: string;
    price: number;
    description: string;
    available: number;
    sold: number;
    isActive: boolean;
  } | null;
  onClose: () => void;
}

export default function TicketTypeForm({ eventId, ticketType, onClose }: TicketTypeFormProps) {
  const createTicketType = useMutation(api.ticketTypes.create);
  const updateTicketType = useMutation(api.ticketTypes.update);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form data from ticketType or with defaults
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    available: 100,
    isActive: true
  });
  
  // Update form data when ticketType changes
  useEffect(() => {
    if (ticketType) {
      setFormData({
        name: ticketType.name,
        description: ticketType.description,
        price: ticketType.price,
        available: ticketType.available,
        isActive: ticketType.isActive
      });
    }
  }, [ticketType]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ticket name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.available < 0) {
      newErrors.available = 'Available tickets cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (ticketType) {
        // Update existing ticket type
        await updateTicketType({
          id: ticketType._id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          available: formData.available,
          isActive: formData.isActive
        });
      } else {
        // Create new ticket type
        await createTicketType({
          eventId,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          available: formData.available
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving ticket type:', error);
      setErrors(prev => ({
        ...prev,
        form: 'An error occurred while saving the ticket type. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ticket Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
          placeholder="e.g., Early Bird, VIP, Regular"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
          placeholder="Describe what this ticket includes"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($) *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`pl-7 block w-full rounded-md border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } shadow-sm p-2`}
            />
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="available" className="block text-sm font-medium text-gray-700">
            Available Tickets *
          </label>
          <input
            type="number"
            id="available"
            name="available"
            min="0"
            value={formData.available}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.available ? 'border-red-500' : 'border-gray-300'
            } shadow-sm p-2`}
          />
          {errors.available && <p className="mt-1 text-sm text-red-600">{errors.available}</p>}
        </div>
      </div>
      
      {ticketType && (
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleToggleActive}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : ticketType ? 'Update Ticket' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
}