"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { menuService } from '@/lib/services';
import { MenuItem } from '@/lib/services/types';
import { motion } from 'framer-motion';
import { Search, Filter, Flame } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MenuItemCard } from "@/components/ui/menu-item-card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MenuResponse {
  data: MenuItem[];
  status: number;
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

export default function MenuPage() {
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

  const fetchMenuItems = useCallback(() => {
    // Just fetch all items without any filters
    return menuService.getAll();
  }, []); // No dependencies needed since we're not using any filters in the API call

  const { data, loading, error } = useApi<MenuResponse>(
    fetchMenuItems,
    true,
    [] // No dependencies needed
  );

  // Process the menu items with client-side filters
  const menuItems = useMemo(() => {
    if (!data?.data) return [];
    
    console.log('📋 Starting client-side filtering with:', {
      totalItems: data.data.length,
      sampleItem: data.data[0], // Log a sample item to check structure
      filters: {
        category,
        searchQuery: debouncedSearchQuery,
        spicyLevel,
        priceRange,
        nutritionRange,
        excludedIngredients
      }
    });
    
    // Apply all filters on client side
    const filteredItems = data.data.filter(item => {
      // Category filter
      if (category && item.category !== category) return false;
      
      // Search query filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Spicy level filter
      if (spicyLevel !== null && item.spicyLevel !== spicyLevel) return false;
      
      // Price range filter
      if (priceRange && priceRange.length === 2) {
        const [min, max] = priceRange;
        if (item.price < min || item.price > max) return false;
      }

      // Nutrition filters
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
        // Log the item's nutrition data for debugging
        console.log('🍎 Checking nutrition for item:', {
          itemName: item.name,
          itemNutritionInfo: item.nutritionInfo,
          nutritionRange
        });
        
        // Skip items without nutrition data when filtering
        if (!item.nutritionInfo) return false;
        
        // Check calories range
        if (item.nutritionInfo.calories < minCal || item.nutritionInfo.calories > maxCal) {
          console.log(`❌ ${item.name} filtered out by calories:`, {
            itemCalories: item.nutritionInfo.calories,
            range: [minCal, maxCal]
          });
          return false;
        }
        
        // Check protein range
        if (item.nutritionInfo.protein < minProtein || item.nutritionInfo.protein > maxProtein) {
          console.log(`❌ ${item.name} filtered out by protein:`, {
            itemProtein: item.nutritionInfo.protein,
            range: [minProtein, maxProtein]
          });
          return false;
        }

        // Check fat range
        if (item.nutritionInfo.fat < minFat || item.nutritionInfo.fat > maxFat) {
          console.log(`❌ ${item.name} filtered out by fat:`, {
            itemFat: item.nutritionInfo.fat,
            range: [minFat, maxFat]
          });
          return false;
        }

        // Check carbs range
        if (item.nutritionInfo.carbs < minCarbs || item.nutritionInfo.carbs > maxCarbs) {
          console.log(`❌ ${item.name} filtered out by carbs:`, {
            itemCarbs: item.nutritionInfo.carbs,
            range: [minCarbs, maxCarbs]
          });
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
        if (hasExcludedIngredient) return false;
      }
      
      return true;
    });
    
    console.log('✨ After client-side filtering:', {
      remainingItems: filteredItems.length,
      appliedFilters: {
        hasCategory: !!category,
        hasSearch: !!debouncedSearchQuery,
        hasSpicyLevel: spicyLevel !== null,
        hasPriceRange: !!priceRange?.length,
        hasNutritionFilter: nutritionRange.calories[0] > 0 || nutritionRange.calories[1] < 1000 ||
                          nutritionRange.protein[0] > 0 || nutritionRange.protein[1] < 50,
        excludedIngredientsCount: excludedIngredients.length
      }
    });
    
    return filteredItems;
  }, [data, category, debouncedSearchQuery, spicyLevel, priceRange, nutritionRange, excludedIngredients]);

  // Handler for adding excluded ingredients
  const handleAddIngredient = useCallback(() => {
    if (ingredientInput.trim() && !excludedIngredients.includes(ingredientInput.trim())) {
      setExcludedIngredients(prev => [...prev, ingredientInput.trim()]);
      setIngredientInput('');
    }
  }, [ingredientInput]);

  // Handler for removing excluded ingredients
  const handleRemoveIngredient = useCallback((ingredient: string) => {
    setExcludedIngredients(prev => prev.filter(i => i !== ingredient));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-400 to-green-500 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Our Menu</h1>
          <p className="text-lg md:text-xl text-center max-w-2xl mx-auto text-white/90">
            Discover our delicious selection of vegetarian dishes, crafted with care and quality ingredients
          </p>
        </div>
          </div>

      {/* Search and Filter Section */}
      <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-sm shadow-sm py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full border-green-100 focus-visible:ring-green-400"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-500" />
          </div>
              )}
          </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-green-400 text-green-500 hover:bg-green-50">
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="border-l-green-400 bg-white/95 backdrop-blur-sm">
                <SheetHeader className="text-green-600">
                  <SheetTitle>Filter Menu</SheetTitle>
                  <SheetDescription className="text-green-500">
                    Adjust filters to find your perfect dish
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-3 text-green-600">Price Range</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        min={0}
                        placeholder="Min"
                        className="border-green-100 focus-visible:ring-green-400"
                      />
                      <span className="text-green-500">to</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        min={0}
                        placeholder="Max"
                        className="border-green-100 focus-visible:ring-green-400"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3 text-green-600">Nutrition</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-green-600 mb-2 block">Calories (kcal)</label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={nutritionRange.calories[0]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              calories: [Number(e.target.value), prev.calories[1]]
                            }))}
                            min={0}
                            placeholder="Min"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                          <span className="text-green-500">to</span>
                          <Input
                            type="number"
                            value={nutritionRange.calories[1]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              calories: [prev.calories[0], Number(e.target.value)]
                            }))}
                            min={0}
                            placeholder="Max"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                        </div>
                    </div>
                      <div>
                        <label className="text-sm text-green-600 mb-2 block">Protein (g)</label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={nutritionRange.protein[0]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              protein: [Number(e.target.value), prev.protein[1]]
                            }))}
                            min={0}
                            placeholder="Min"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                          <span className="text-green-500">to</span>
                          <Input
                            type="number"
                            value={nutritionRange.protein[1]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              protein: [prev.protein[0], Number(e.target.value)]
                            }))}
                            min={0}
                            placeholder="Max"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                    </div>
                      </div>
                      <div>
                        <label className="text-sm text-green-600 mb-2 block">Fat (g)</label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={nutritionRange.fat[0]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              fat: [Number(e.target.value), prev.fat[1]]
                            }))}
                            min={0}
                            placeholder="Min"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                          <span className="text-green-500">to</span>
                          <Input
                            type="number"
                            value={nutritionRange.fat[1]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              fat: [prev.fat[0], Number(e.target.value)]
                            }))}
                            min={0}
                            placeholder="Max"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-green-600 mb-2 block">Carbs (g)</label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={nutritionRange.carbs[0]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              carbs: [Number(e.target.value), prev.carbs[1]]
                            }))}
                            min={0}
                            placeholder="Min"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                          <span className="text-green-500">to</span>
                          <Input
                            type="number"
                            value={nutritionRange.carbs[1]}
                            onChange={(e) => setNutritionRange(prev => ({
                              ...prev,
                              carbs: [prev.carbs[0], Number(e.target.value)]
                            }))}
                            min={0}
                            placeholder="Max"
                            className="border-green-100 focus-visible:ring-green-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3 text-green-600">Exclude Ingredients</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={ingredientInput}
                          onChange={(e) => setIngredientInput(e.target.value)}
                          placeholder="Enter ingredient to exclude"
                          className="border-green-100 focus-visible:ring-green-400"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                        />
                        <Button
                          onClick={handleAddIngredient}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {excludedIngredients.map((ingredient) => (
                          <div
                            key={ingredient}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {ingredient}
                    <button
                              onClick={() => handleRemoveIngredient(ingredient)}
                              className="hover:text-red-700"
                            >
                              ×
                    </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3 text-green-600">Spicy Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3].map((level) => (
                        <Button
                          key={level}
                          variant={spicyLevel === level ? "default" : "outline"}
                          onClick={() => setSpicyLevel(spicyLevel === level ? null : level)}
                          className={cn(
                            "flex items-center gap-1",
                            spicyLevel === level 
                              ? "bg-green-500 hover:bg-green-600" 
                              : "border-green-100 text-green-600 hover:bg-green-50"
                          )}
                        >
                          {level === 0 ? (
                            <span>Not Spicy</span>
                          ) : (
                            <div className="flex items-center">
                              {Array(level).fill(0).map((_, i) => (
                                <Flame key={i} className="h-4 w-4 text-red-500" />
                              ))}
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(null)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                category === null
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-green-600 hover:bg-green-50 border border-green-100'
              }`}
            >
              All Menu
            </motion.button>
            {['main', 'side', 'dessert', 'beverage'].map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-medium capitalize transition-all duration-200 ${
                  category === cat
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-green-600 hover:bg-green-50 border border-green-100'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-lg text-red-500">Error loading menu items</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-lg text-green-500">No menu items found</p>
          </div>
        ) : (
          <>
            <p className="text-green-500 mb-6">{menuItems.length} items found</p>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {menuItems.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
} 