// components/MerchandiseSelector.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

import Image from 'next/image';

interface MerchandiseSelectorProps {
  cartId: Id<"carts"> | null;
  onAddToCart: () => void;
}

interface Variant {
  name: string;
  values: string[];
}

interface MerchandiseItem {
  _id: Id<"merchandise">;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: number;
  sold: number;
  category: string;
  variants?: Variant[];
  isActive: boolean;
}

export default function MerchandiseSelector({ cartId, onAddToCart }: MerchandiseSelectorProps) {
  const merchandise = useQuery(api.merchandise.getActive) || [];
  const addItemToCart = useMutation(api.cart.addItemToCart);
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [variants, setVariants] = useState<Record<string, Record<string, string>>>({});
  
  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };
  
  const handleVariantChange = (itemId: string, variantName: string, value: string) => {
    setVariants(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [variantName]: value
      }
    }));
  };
  
  const handleAddToCart = async (item: MerchandiseItem) => {
    if (!cartId) return;
    
    const quantity = quantities[item._id] || 1;
    
    if (quantity > 0) {
      const variantSelections = item.variants?.map(variant => ({
        name: variant.name,
        value: variants[item._id]?.[variant.name] || variant.values[0]
      }));
      
      await addItemToCart({
        cartId,
        itemId: item._id,
        itemType: "merchandise",
        quantity,
        variantSelections
      });
      
      setQuantities(prev => ({
        ...prev,
        [item._id]: 0
      }));
      
      onAddToCart();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Merchandise</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {merchandise.map((item: MerchandiseItem) => (
          <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
            {item.imageUrl && (
              <div className="h-48 w-full overflow-hidden bg-gray-200">
<Image 
  src={item.imageUrl} 
  alt={item.name} 
  className="w-full h-full object-cover"
  width={500} // Set appropriate size based on your design
  height={500} // Set appropriate size based on your design
  priority={false} // Set to true if this is an above-the-fold image
/>
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              <p className="mt-2 text-lg font-medium text-gray-900">${item.price.toFixed(2)}</p>
              
              {/* Variants */}
              {item.variants && item.variants.length > 0 && (
                <div className="mt-3 space-y-3">
                  {item.variants.map((variant) => (
                    <div key={variant.name}>
                      <label className="block text-sm font-medium text-gray-700">
                        {variant.name}
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={variants[item._id]?.[variant.name] || variant.values[0]}
                        onChange={(e) => handleVariantChange(item._id, variant.name, e.target.value)}
                      >
                        {variant.values.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-l"
                    onClick={() => handleQuantityChange(
                      item._id,
                      Math.max(0, (quantities[item._id] || 0) - 1)
                    )}
                  >
                    -
                  </button>
                  <span className="mx-2 text-gray-700 w-8 text-center">
                    {quantities[item._id] || 0}
                  </span>
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-r"
                    onClick={() => handleQuantityChange(
                      item._id,
                      Math.min(item.available, (quantities[item._id] || 0) + 1)
                    )}
                    disabled={item.available === 0}
                  >
                    +
                  </button>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => handleAddToCart(item)}
                  disabled={!quantities[item._id] || quantities[item._id] === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}