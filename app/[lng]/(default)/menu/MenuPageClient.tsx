"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from '@/[lng]/(default)/hooks/useApi';
import { menuService } from '@/lib/services';
import { MenuItem } from '@/lib/services/types';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MenuItemCard } from "@/components/ui/menu-item-card"
import { categoryService, Category } from '../services/categoryService';
import { useTranslation } from 'react-i18next';

// Helper to get localized name/description from MenuItem
const getLocalizedField = (field: string | Record<string, string> | undefined, lng: string, fallback = '') => {
  if (!field) return fallback;
  if (typeof field === 'object') {
    return field[lng] || field.en || fallback;
  }
  return field;
};

interface MenuResponse {
  data: MenuItem[] | { data?: MenuItem[], items?: MenuItem[] };
  status: number;
}

interface MenuPageClientProps {
  lng: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 300;

export default function MenuPageClient({ lng }: MenuPageClientProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [spicyLevel, setSpicyLevel] = useState<number | null>(null);
  const [nutritionRange, setNutritionRange] = useState<{
    calories: [number, number];
    protein: [number, number];
    fat: [number, number];
    carbs: [number, number];
  }>({
    calories: [0, 1000],
    protein: [0, 50],
    fat: [0, 50],
    carbs: [0, 100]
  });
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const fetchMenuItems = useCallback(async () => {
    console.log('Calling menuService.getAll()');
    return menuService.getAll();
  }, []);

  const { data, loading, error } = useApi<MenuResponse>(
    fetchMenuItems,
    true,
    [] // No dependencies needed
  );

  // For debugging
  useEffect(() => {
    console.log('API Response:', data);
  }, [data]);

  // Process the menu items with client-side filters
  const filteredMenuItems = useMemo(() => {
    if (!data) {
      console.log('No data available');
      return [];
    }
    
    // Check data structure
    let items: MenuItem[] = [];
    
    if (Array.isArray(data.data)) {
      console.log('Direct array data:', data.data.length);
      items = data.data;
    } else if (typeof data.data === 'object' && data.data !== null) {
      const nestedData = data.data as { data?: MenuItem[], items?: MenuItem[] };
      // Handle case where data might be nested
      if (Array.isArray(nestedData.data)) {
        console.log('Nested data array:', nestedData.data.length);
        items = nestedData.data;
      } else if (Array.isArray(nestedData.items)) {
        console.log('Nested items array:', nestedData.items.length);
        items = nestedData.items;
      }
    }
    
    if (items.length === 0) {
      console.log('No menu items found in data structure:', data);
      return [];
    }
    
    console.log('Found menu items:', items.length);
    
    // Apply all filters on client side
    const filtered = items.filter(item => {
      // Log each item being processed to understand structure
      if (items.indexOf(item) < 3) {
        console.log('Sample item to filter:', JSON.stringify(item, null, 2));
      }
      
      // Category filter
      if (category) {
        // Check if category is object or string
        const itemCategoryId = typeof item.category === 'object' 
          ? (item.category as { _id?: string })?._id 
          : item.category;
        
        console.log(`Comparing category: item='${itemCategoryId}', selected='${category}'`);
        
        if (itemCategoryId !== category) {
          console.log(`Item "${item.name}" filtered out by category: ${itemCategoryId} !== ${category}`);
          return false;
        }
      }
      
      // Search query filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const itemName = getLocalizedField(item.name, lng, '');
        const itemDescription = getLocalizedField(item.description, lng, '');

        const matchesSearch = 
          itemName.toLowerCase().includes(searchLower) ||
          (itemDescription && itemDescription.toLowerCase().includes(searchLower)) ||
          (typeof item.category === 'string' && item.category.toLowerCase().includes(searchLower));
        if (!matchesSearch) {
          // console.log(`Item ${item.name} filtered out by search query`);
          return false;
        }
      }
      
      // Spicy level filter - only apply if selected
      if (spicyLevel !== null) {
        // Kiểm tra giá trị spicyLevel trong item
        if (typeof item.spicyLevel === 'undefined') {
          return false; // Lọc ra các món không có spicyLevel khi người dùng đã chọn filter
        }
        if (item.spicyLevel !== spicyLevel) {
          // console.log(`Item ${item.name} filtered out by spicy level: ${item.spicyLevel} !== ${spicyLevel}`);
          return false;
        }
      }
      
      // Price range filter - only apply if min/max changed from defaults
      if (priceRange && priceRange.length === 2 && (priceRange[0] > 0 || priceRange[1] < 50)) {
        const [min, max] = priceRange;
        if (item.price < min || item.price > max) {
          // console.log(`Item ${item.name} filtered out by price range: ${item.price} not in [${min}, ${max}]`);
          return false;
        }
      }

      // Nutrition filters - only apply if any nutrition filter was changed
      const { 
        calories: [minCal, maxCal], 
        protein: [minProtein, maxProtein],
        fat: [minFat, maxFat],
        carbs: [minCarbs, maxCarbs]
      } = nutritionRange;
      
      // Check if nutrition values are being filtered
      const isFilteringNutrition = minCal > 0 || maxCal < 1000 || 
                               minProtein > 0 || maxProtein < 50 ||
                               minFat > 0 || maxFat < 50 ||
                               minCarbs > 0 || maxCarbs < 100;
      
      if (isFilteringNutrition) {
        // Skip items without nutrition data when filtering
        if (!item.nutritionInfo) {
          // console.log(`Item ${item.name} filtered out - no nutrition info`);
          return false;
        }
        
        // Check calories range
        if (item.nutritionInfo.calories < minCal || item.nutritionInfo.calories > maxCal) {
          return false;
        }
        
        // Check protein range
        if (item.nutritionInfo.protein < minProtein || item.nutritionInfo.protein > maxProtein) {
          return false;
        }

        // Check fat range
        if (item.nutritionInfo.fat < minFat || item.nutritionInfo.fat > maxFat) {
          return false;
        }

        // Check carbs range
        if (item.nutritionInfo.carbs < minCarbs || item.nutritionInfo.carbs > maxCarbs) {
          return false;
        }
      }

      // Excluded ingredients filter
      if (excludedIngredients.length > 0 && item.ingredients) {
        const hasExcludedIngredient = excludedIngredients.some(excluded =>
          item.ingredients.some(ing => 
            ing.toLowerCase().includes(excluded.toLowerCase())
          )
        );
        if (hasExcludedIngredient) {
          return false;
        }
      }
      
      // Item passed all filters
      return true;
    });
    
    return filtered;
  }, [data, category, debouncedSearchQuery, spicyLevel, priceRange, nutritionRange, excludedIngredients, lng]);

  const handleAddIngredient = () => {
    if (ingredientInput.trim() !== '') {
      setExcludedIngredients(prev => [...prev, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setExcludedIngredients(prev => prev.filter(ing => ing !== ingredientToRemove));
  };

  if (loading) return <div className="text-center mt-16">{t('menu.loading')}</div>;
  if (error) return <div className="text-center mt-16 text-red-600">{t('menu.error')}</div>;

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8">{t('menu.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters and Search - Left Column */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('menu.filterButton')}</h2>
              <Button 
                onClick={() => {
                  setCategory(null);
                  setSearchQuery('');
                  setPriceRange([0, 50]);
                  setSpicyLevel(null);
                  setNutritionRange({
                    calories: [0, 1000],
                    protein: [0, 50],
                    fat: [0, 50],
                    carbs: [0, 100]
                  });
                  setExcludedIngredients([]);
                }}
                variant="outline"
                className="w-full mb-4"
              >
                {t('menu.clearFilters')}
              </Button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                <Search className="inline-block mr-2 text-gray-500" size={18} /> {t('menu.searchPlaceholder')}
              </label>
              <Input
                id="search-input"
                type="text"
                placeholder="Tìm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-green-200 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-full shadow-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">{t('menu.categoryFilter')}</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={category === null ? "default" : "outline"}
                  onClick={() => setCategory(null)}
                  className="capitalize"
                >
                  {t('menu.allCategories')}
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat._id}
                    variant={category === cat._id ? "default" : "outline"}
                    onClick={() => setCategory(cat._id || null)}
                    className="capitalize"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Spicy Level Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">{t('menu.spicyLevel')}</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map(level => (
                  <Button
                    key={level}
                    variant={spicyLevel === level ? "default" : "outline"}
                    onClick={() => setSpicyLevel(level)}
                  >
                    {level === 0 && t('menu.spicyLevel.notSpicy')}
                    {level === 1 && t('menu.spicyLevel.mild')}
                    {level === 2 && t('menu.spicyLevel.medium')}
                    {level === 3 && t('menu.spicyLevel.hot')}
                  </Button>
                ))}
                 <Button
                  variant={spicyLevel === null ? "default" : "outline"}
                  onClick={() => setSpicyLevel(null)}
                >
                  {t('menu.allCategories')}
                </Button>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">{t('menu.priceRange')}: {priceRange[0]}K - {priceRange[1]}K</label>
              <Input
                type="range"
                min="0"
                max="50"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Input
                type="range"
                min="0"
                max="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>

            {/* Nutrition Range Filters */}
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">{t('menu.nutritionInfo')}</h3>
              <div>
                <label className="block text-gray-600 text-sm">{t('menu.calories')}: {nutritionRange.calories[0]} - {nutritionRange.calories[1]}</label>
                <Input
                  type="range" min="0" max="1000" value={nutritionRange.calories[0]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, calories: [Number(e.target.value), prev.calories[1]] }))}
                />
                <Input
                  type="range" min="0" max="1000" value={nutritionRange.calories[1]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, calories: [prev.calories[0], Number(e.target.value)] }))}
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm">{t('menu.protein')}: {nutritionRange.protein[0]} - {nutritionRange.protein[1]}</label>
                <Input
                  type="range" min="0" max="50" value={nutritionRange.protein[0]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, protein: [Number(e.target.value), prev.protein[1]] }))}
                />
                <Input
                  type="range" min="0" max="50" value={nutritionRange.protein[1]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, protein: [prev.protein[0], Number(e.target.value)] }))}
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm">{t('menu.fat')}: {nutritionRange.fat[0]} - {nutritionRange.fat[1]}</label>
                <Input
                  type="range" min="0" max="50" value={nutritionRange.fat[0]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, fat: [Number(e.target.value), prev.fat[1]] }))}
                />
                <Input
                  type="range" min="0" max="50" value={nutritionRange.fat[1]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, fat: [prev.fat[0], Number(e.target.value)] }))}
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm">{t('menu.carbs')}: {nutritionRange.carbs[0]} - {nutritionRange.carbs[1]}</label>
                <Input
                  type="range" min="0" max="100" value={nutritionRange.carbs[0]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, carbs: [Number(e.target.value), prev.carbs[1]] }))}
                />
                <Input
                  type="range" min="0" max="100" value={nutritionRange.carbs[1]}
                  onChange={e => setNutritionRange(prev => ({ ...prev, carbs: [prev.carbs[0], Number(e.target.value)] }))}
                />
              </div>
            </div>

            {/* Exclude Ingredients */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">{t('menu.excludedIngredients')}</label>
              <div className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder={t('menu.addIngredientPlaceholder')}
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddIngredient();
                    }
                  }}
                  className="flex-grow px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-green-500"
                />
                <Button onClick={handleAddIngredient} className="bg-green-500 text-white hover:bg-green-600">
                  {t('menu.addIngredientButton')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {excludedIngredients.map((ingredient, index) => (
                  <span key={index} className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {ingredient}
                    <button 
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items - Right Column */}
        <div className="lg:w-3/4">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">{t('menu.noItemsFound')}</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredMenuItems.map((item) => (
                <MenuItemCard key={item._id} item={item} lng={lng} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 