'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Variant {
  name: string;
  values: string[];
}

interface MerchandiseFormProps {
  merchandise?: {
    _id: any;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    available: number;
    sold: number;
    category: string;
    variants?: Variant[];
    isActive: boolean;
  } | null;
  onClose: () => void;
}

export default function MerchandiseForm({ merchandise, onClose }: MerchandiseFormProps) {
  const createMerchandise = useMutation(api.merchandise.create);
  const updateMerchandise = useMutation(api.merchandise.update);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Common categories for pre-defined options
  const categories = [
    'Clothing',
    'Accessories',
    'Drinkware',
    'Stationery',
    'Books',
    'Digital',
    'Other'
  ];
  
  // Initialize form data from merchandise or with defaults
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    available: 100,
    category: 'Clothing',
    variants: [] as Variant[],
    isActive: true
  });
  
  // State for managing variant input
  const [newVariant, setNewVariant] = useState({
    name: '',
    valuesText: ''
  });
  
  // Update form data when merchandise changes
  useEffect(() => {
    if (merchandise) {
      setFormData({
        name: merchandise.name,
        description: merchandise.description,
        price: merchandise.price,
        imageUrl: merchandise.imageUrl || '',
        available: merchandise.available,
        category: merchandise.category,
        variants: merchandise.variants || [],
        isActive: merchandise.isActive
      });
    }
  }, [merchandise]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  
  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddVariant = () => {
    if (!newVariant.name.trim() || !newVariant.valuesText.trim()) {
      setErrors(prev => ({
        ...prev,
        variant: 'Both variant name and values are required'
      }));
      return;
    }
    
    // Split comma-separated values and trim whitespace
    const values = newVariant.valuesText.split(',').map(v => v.trim()).filter(v => v);
    
    if (values.length === 0) {
      setErrors(prev => ({
        ...prev,
        variant: 'At least one variant value is required'
      }));
      return;
    }
    
    // Check if variant with this name already exists
    if (formData.variants.some(v => v.name === newVariant.name)) {
      setErrors(prev => ({
        ...prev,
        variant: `A variant named "${newVariant.name}" already exists`
      }));
      return;
    }
    
    // Add the new variant
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: newVariant.name, values }]
    }));
    
    // Reset the variant input
    setNewVariant({ name: '', valuesText: '' });
    
    // Clear any variant errors
    if (errors.variant) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.variant;
        return newErrors;
      });
    }
  };
  
  const handleRemoveVariant = (variantName: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.name !== variantName)
    }));
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
      newErrors.name = 'Merchandise name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.available < 0) {
      newErrors.available = 'Available quantity cannot be negative';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
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
      if (merchandise) {
        // Update existing merchandise
        await updateMerchandise({
          id: merchandise._id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          imageUrl: formData.imageUrl || undefined,
          available: formData.available,
          category: formData.category,
          variants: formData.variants.length > 0 ? formData.variants : undefined,
          isActive: formData.isActive
        });
      } else {
        // Create new merchandise
        await createMerchandise({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          imageUrl: formData.imageUrl || undefined,
          available: formData.available,
          category: formData.category,
          variants: formData.variants.length > 0 ? formData.variants : undefined
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving merchandise:', error);
      setErrors(prev => ({
        ...prev,
        form: 'An error occurred while saving the merchandise. Please try again.'
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
          Item Name *
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
          placeholder="e.g., Event T-Shirt, Conference Mug"
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
          placeholder="Describe the merchandise item"
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
            Available Quantity *
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
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>
      
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter a URL for the product image. Leave blank if no image is available.
        </p>
      </div>
      
      {/* Variants Section */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Product Variants</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add variants like sizes, colors, or styles. Each variant can have multiple options.
        </p>
        
        {/* Current Variants */}
        {formData.variants.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current Variants:</h4>
            {formData.variants.map(variant => (
              <div key={variant.name} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">{variant.name}:</span>{' '}
                  <span>{variant.values.join(', ')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variant.name)}
                  className="text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Variant */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="variant-name" className="block text-sm font-medium text-gray-700">
              Variant Name
            </label>
            <input
              type="text"
              id="variant-name"
              name="name"
              value={newVariant.name}
              onChange={handleVariantChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="e.g., Size, Color"
            />
          </div>
          
          <div>
            <label htmlFor="variant-values" className="block text-sm font-medium text-gray-700">
              Values (comma separated)
            </label>
            <input
              type="text"
              id="variant-values"
              name="valuesText"
              value={newVariant.valuesText}
              onChange={handleVariantChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="e.g., Small, Medium, Large"
            />
          </div>
        </div>
        
        {errors.variant && <p className="mt-1 text-sm text-red-600">{errors.variant}</p>}
        
        <div className="mt-2">
          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none"
          >
            + Add Variant
          </button>
        </div>
      </div>
      
      {merchandise && (
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
          {isSubmitting ? 'Saving...' : merchandise ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  );
}