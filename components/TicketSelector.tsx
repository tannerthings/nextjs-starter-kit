// components/TicketSelector.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface TicketSelectorProps {
  eventId: Id<"events">;
  cartId: Id<"carts"> | null;
  onAddToCart: () => void;
}

export default function TicketSelector({ eventId, cartId, onAddToCart }: TicketSelectorProps) {
  const ticketTypes = useQuery(api.ticketTypes.getByEventId, { eventId }) || [];
  const addItemToCart = useMutation(api.cart.addItemToCart);
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const handleQuantityChange = (ticketTypeId: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketTypeId]: value
    }));
  };
  
  const handleAddToCart = async (ticketTypeId: string) => {
    if (!cartId) return;
    
    const quantity = quantities[ticketTypeId] || 1;
    
    if (quantity > 0) {
      await addItemToCart({
        cartId,
        itemId: ticketTypeId,
        itemType: 'ticket',
        quantity
      });
      
      // Reset quantity
      setQuantities(prev => ({
        ...prev,
        [ticketTypeId]: 0
      }));
      
      // Notify parent component
      onAddToCart();
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Available Tickets</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Select the tickets you want to purchase.</p>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {ticketTypes.map((ticket) => (
            <li key={ticket._id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 truncate">{ticket.name}</h4>
                  <p className="mt-1 text-sm text-gray-500">{ticket.description}</p>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {ticket.available} {ticket.available === 1 ? 'ticket' : 'tickets'} available
                    </span>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0 flex items-center">
                  <span className="text-xl font-medium text-gray-900">${ticket.price.toFixed(2)}</span>
                  
                  <div className="ml-4 flex items-center">
                    <button
                      type="button"
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-l"
                      onClick={() => handleQuantityChange(
                        ticket._id,
                        Math.max(0, (quantities[ticket._id] || 0) - 1)
                      )}
                    >
                      -
                    </button>
                    <span className="mx-3 text-gray-700 w-8 text-center">
                      {quantities[ticket._id] || 0}
                    </span>
                    <button
                      type="button"
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-r"
                      onClick={() => handleQuantityChange(
                        ticket._id,
                        Math.min(ticket.available, (quantities[ticket._id] || 0) + 1)
                      )}
                      disabled={ticket.available === 0}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleAddToCart(ticket._id)}
                    disabled={!quantities[ticket._id] || quantities[ticket._id] === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}