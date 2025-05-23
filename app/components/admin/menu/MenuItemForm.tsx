'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import Image from 'next/image';

type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type FormValues = {
  name: string;
  description: string;
  price: number;
  category: 'main' | 'side' | 'dessert' | 'beverage';
  image: string;
  isAvailable: boolean;
  nutritionInfo: NutritionInfo;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
};

type MenuItemFormProps = {
  menuItemId?: string;
  mode: 'create' | 'edit';
};

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MenuItemForm({ menuItemId, mode }: MenuItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'main',
      image: '',
      isAvailable: true,
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      preparationTime: 0,
      ingredients: [],
      allergens: []
    }
  });

  const watchIngredients = watch('ingredients');
  const watchAllergens = watch('allergens');

  useEffect(() => {
    if (mode === 'edit' && menuItemId) {
      setIsLoading(true);
      
      const fetchMenuItem = async () => {
        try {
          console.log(`Fetching menu item with ID: ${menuItemId}`);
          const response = await axios.get(`${BASE_API_URL}/api/admin/menu-items/${menuItemId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          const apiData = response.data.data || response.data;
          console.log('API response:', apiData);
          
          // Set form values
          Object.entries(apiData).forEach(([key, value]) => {
            // Handle nutritionInfo object separately
            if (key === 'nutritionInfo') {
              Object.entries(value as any).forEach(([nutritionKey, nutritionValue]) => {
                setValue(`nutritionInfo.${nutritionKey}` as any, nutritionValue);
              });
            } else {
              setValue(key as any, value);
            }
          });
          
          setImagePreview(apiData.image);
          setIsLoading(false);
        } catch (err: any) {
          console.error('Error fetching menu item:', err);
          setError(err.message || 'Failed to load menu item');
          setIsLoading(false);
        }
      };
      
      fetchMenuItem();
    }
  }, [menuItemId, mode, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Submitting form data:', data);
      
      if (mode === 'create') {
        await axios.post(`${BASE_API_URL}/api/admin/menu-items`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      } else {
        await axios.put(`${BASE_API_URL}/api/admin/menu-items/${menuItemId}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      }
      
      // Redirect after successful submission
      router.push('/admin/menu');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to save menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      const currentIngredients = watch('ingredients') || [];
      setValue('ingredients', [...currentIngredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const currentIngredients = [...watchIngredients];
    currentIngredients.splice(index, 1);
    setValue('ingredients', currentIngredients);
  };

  const handleAddAllergen = () => {
    if (allergenInput.trim()) {
      const currentAllergens = watch('allergens') || [];
      setValue('allergens', [...currentAllergens, allergenInput.trim()]);
      setAllergenInput('');
    }
  };

  const handleRemoveAllergen = (index: number) => {
    const currentAllergens = [...watchAllergens];
    currentAllergens.splice(index, 1);
    setValue('allergens', currentAllergens);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (₫)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="price"
              min="0"
              step="1000"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'Description is required' })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <div className="mt-1">
            <select
              id="category"
              {...register('category', { required: 'Category is required' })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="main">Main Dish</option>
              <option value="side">Side Dish</option>
              <option value="dessert">Dessert</option>
              <option value="beverage">Beverage</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
            Preparation Time (minutes)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="preparationTime"
              min="1"
              {...register('preparationTime', { 
                required: 'Preparation time is required',
                min: { value: 1, message: 'Preparation time must be at least 1 minute' }
              })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {errors.preparationTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preparationTime.message}</p>
          )}
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-center">
            <input
              id="isAvailable"
              type="checkbox"
              {...register('isAvailable')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              Available for ordering
            </label>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="image"
              {...register('image', { required: 'Image URL is required' })}
              onChange={(e) => {
                setValue('image', e.target.value);
                setImagePreview(e.target.value);
              }}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
          
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="relative h-32 w-32 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={imagePreview}
                  alt="Menu item preview"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-6">
          <h3 className="text-lg font-medium text-gray-900">Nutrition Information</h3>
          <div className="mt-3 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                Calories
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="calories"
                  min="0"
                  {...register('nutritionInfo.calories', { 
                    required: 'Calories are required',
                    min: { value: 0, message: 'Calories must be positive' }
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.nutritionInfo?.calories && (
                <p className="mt-1 text-sm text-red-600">{errors.nutritionInfo.calories.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                Protein (g)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="protein"
                  min="0"
                  step="0.1"
                  {...register('nutritionInfo.protein', { 
                    required: 'Protein content is required',
                    min: { value: 0, message: 'Protein must be positive' }
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.nutritionInfo?.protein && (
                <p className="mt-1 text-sm text-red-600">{errors.nutritionInfo.protein.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                Carbs (g)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="carbs"
                  min="0"
                  step="0.1"
                  {...register('nutritionInfo.carbs', { 
                    required: 'Carbs content is required',
                    min: { value: 0, message: 'Carbs must be positive' }
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.nutritionInfo?.carbs && (
                <p className="mt-1 text-sm text-red-600">{errors.nutritionInfo.carbs.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700">
                Fat (g)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="fat"
                  min="0"
                  step="0.1"
                  {...register('nutritionInfo.fat', { 
                    required: 'Fat content is required',
                    min: { value: 0, message: 'Fat must be positive' }
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              {errors.nutritionInfo?.fat && (
                <p className="mt-1 text-sm text-red-600">{errors.nutritionInfo.fat.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
            Ingredients
          </label>
          <div className="mt-1 flex">
            <input
              type="text"
              id="ingredientInput"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add an ingredient"
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {watchIngredients?.map((ingredient, index) => (
              <div key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ingredient}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">
            Allergens
          </label>
          <div className="mt-1 flex">
            <input
              type="text"
              id="allergenInput"
              value={allergenInput}
              onChange={(e) => setAllergenInput(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add an allergen"
            />
            <button
              type="button"
              onClick={handleAddAllergen}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {watchAllergens?.map((allergen, index) => (
              <div key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {allergen}
                <button
                  type="button"
                  onClick={() => handleRemoveAllergen(index)}
                  className="ml-1.5 inline-flex text-red-400 hover:text-red-600"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/menu')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
} 