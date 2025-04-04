"use client"

import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { menuAPI, MenuItem } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { CartToast } from '../components/cart-toast';
import Image from 'next/image';

export default function MenuPage() {
  const [category, setCategory] = useState<string | null>(null);
  const { data, loading, error, refetch } = useApi<{ data: MenuItem[] }>(
    () => menuAPI.getAll({ category: category || undefined })
  );
  
  const { 
    addToCartWithMessage, 
    isItemInCart, 
    getItemQuantity,
    message, 
    dismissMessage 
  } = useCart();

  const handleCategoryChange = (newCategory: string | null) => {
    setCategory(newCategory);
    refetch();
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCartWithMessage(item, 1);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16 mt-16">
        <h1 className="text-3xl font-bold mb-8">Our Menu</h1>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full ${
              category === null
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {['main', 'side', 'dessert', 'beverage'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full capitalize ${
                category === cat
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load menu items. Please try again.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((item) => {
              const itemInCart = isItemInCart(item._id);
              const itemQuantity = getItemQuantity(item._id);
              
              return (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={item.image || 'https://placekitten.com/500/300'}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <span className="text-green-600 font-bold">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.ingredients.map((ingredient, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {ingredient}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <span className="mr-2">🔥</span>
                        <span>{item.nutritionInfo.calories} cal</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🍗</span>
                        <span>{item.nutritionInfo.protein}g protein</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">⏱️</span>
                        <span>{item.preparationTime} min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full py-2 rounded font-medium transition-colors ${
                        itemInCart 
                          ? 'bg-green-100 text-green-800 border border-green-500' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {itemInCart 
                        ? `In Cart (${itemQuantity})` 
                        : 'Add to Cart'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Toast notification */}
      <CartToast message={message || ''} onDismiss={dismissMessage} />
    </>
  );
} 