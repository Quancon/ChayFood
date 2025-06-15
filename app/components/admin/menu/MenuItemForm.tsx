'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';

import { menuService } from '@/lib/services';
import { categoryService, Category } from '../../../[lng]/(default)/services/categoryService';
import { toast } from 'react-hot-toast';

import Image from 'next/image';

type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type FormValues = {
  name: {
    en: string;
    vi: string;
  };
  description: {
    en: string;
    vi: string;
  };
  price: number;
  category: 'main' | 'side' | 'dessert' | 'beverage';
  image: string;
  isAvailable: boolean;
  nutritionInfo: NutritionInfo;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: number;
};

type MenuItemFormProps = {
  menuItemId?: string;
  mode: 'create' | 'edit';
};

// Extended Category type to handle both old and new format
interface ExtendedCategory extends Category {
  id?: number;
  _id?: string;
}

export default function MenuItemForm({ menuItemId, mode }: MenuItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [ingredientInput, setIngredientInput] = useState('');
  // const [allergenInput, setAllergenInput] = useState('');
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'vi' | 'en'>('vi');
  
  const [formData, setFormData] = useState({
    name: {
      en: '',
      vi: ''
    },
    description: {
      en: '',
      vi: ''
    },
    category: '',
    price: 0,
    image: '',
    isAvailable: true,
    ingredients: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    spicyLevel: 0,
    preparationTime: 0,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  });

  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      name: {
        en: '',
        vi: ''
      },
      description: {
        en: '',
        vi: ''
      },
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
      allergens: [],
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      spicyLevel: 0
    }
  });

  // const watchIngredients = watch('ingredients');
  // const watchAllergens = watch('allergens');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch {
        toast.error('Không thể tải danh mục');
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch menu item if in edit mode
  useEffect(() => {
    const fetchMenuItem = async () => {
    if (mode === 'edit' && menuItemId) {
      setIsLoading(true);
        try {
          const response = await menuService.getById(menuItemId);
          if (response.data) {
            const item = response.data;
            
            // Handle name which can be string or object
            let nameObj = { en: '', vi: '' };
            if (typeof item.name === 'string') {
              nameObj = { en: item.name, vi: item.name };
            } else if (typeof item.name === 'object' && item.name !== null) {
              nameObj = {
                en: item.name.en || '',
                vi: item.name.vi || ''
              };
            }
            
            // Handle description which can be string or object
            let descObj = { en: '', vi: '' };
            if (typeof item.description === 'string') {
              descObj = { en: item.description, vi: item.description };
            } else if (typeof item.description === 'object' && item.description !== null) {
              descObj = {
                en: item.description.en || '',
                vi: item.description.vi || ''
              };
            }
            
            // Handle category which can be string or object
            let categoryId = '';
            if (typeof item.category === 'string') {
              categoryId = item.category;
            } else if (typeof item.category === 'object' && item.category !== null) {
              categoryId = (item.category as ExtendedCategory)._id || '';
            }
            
            // Handle nutrition which can be undefined
            const nutrition = item.nutritionInfo || {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            };
            
            const formDataObj = {
              name: nameObj,
              description: descObj,
              category: categoryId,
              price: item.price || 0,
              image: typeof item.image === 'string' ? item.image : '',
              isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
              ingredients: item.ingredients || [],
              nutrition,
              spicyLevel: item.spicyLevel || 0,
              preparationTime: item.preparationTime || 0,
              isVegetarian: item.isVegetarian !== undefined ? item.isVegetarian : true,
              isVegan: item.isVegan !== undefined ? item.isVegan : false,
              isGlutenFree: item.isGlutenFree !== undefined ? item.isGlutenFree : false
            };
            
            setFormData(formDataObj);
            
            // Update form values
            setValue('name', nameObj);
            setValue('description', descObj);
            setValue('price', item.price || 0);
            setValue('category', categoryId as 'main' | 'side' | 'dessert' | 'beverage');
            setValue('image', typeof item.image === 'string' ? item.image : '');
            setValue('isAvailable', item.isAvailable !== undefined ? item.isAvailable : true);
            setValue('ingredients', item.ingredients || []);
            setValue('nutritionInfo', nutrition);
            setValue('preparationTime', item.preparationTime || 0);
            setValue('allergens', item.allergens || []);
            setValue('spicyLevel', item.spicyLevel || 0);
            setValue('isVegetarian', item.isVegetarian !== undefined ? item.isVegetarian : true);
            setValue('isVegan', item.isVegan !== undefined ? item.isVegan : false);
            setValue('isGlutenFree', item.isGlutenFree !== undefined ? item.isGlutenFree : false);
          }
        } catch  {
          toast.error('Không thể tải thông tin món ăn');
        } finally {
          setIsLoading(false);
        }
        }
      };
      
      fetchMenuItem();
  }, [menuItemId, mode, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Ensure form data is properly set
      const formValues = {
        ...data,
        name: formData.name,
        description: formData.description,
        category: formData.category as 'main' | 'side' | 'dessert' | 'beverage',
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        spicyLevel: formData.spicyLevel,
        image: formData.image,
        isAvailable: formData.isAvailable
      };
      
      console.log('Submitting form data:', formValues);
      
      // Map form data to the format expected by menuService
      const menuItemData = {
        name: formValues.name,
        description: formValues.description,
        price: formValues.price,
        category: formValues.category,
        image: formValues.image,
        isAvailable: formValues.isAvailable,
        ingredients: formValues.ingredients,
        nutritionInfo: {
          calories: formValues.nutritionInfo.calories,
          protein: formValues.nutritionInfo.protein,
          carbs: formValues.nutritionInfo.carbs,
          fat: formValues.nutritionInfo.fat
        },
        allergens: formValues.allergens,
        spicyLevel: formValues.spicyLevel,
        preparationTime: formValues.preparationTime,
        isVegetarian: formValues.isVegetarian,
        isVegan: formValues.isVegan,
        isGlutenFree: formValues.isGlutenFree
      };
      
      if (mode === 'create') {
        await menuService.create(menuItemData);
        toast.success('Thêm món thành công');
      } else if (mode === 'edit' && menuItemId) {
        await menuService.update(menuItemId, menuItemData);
        toast.success('Cập nhật món thành công');
      } else {
        throw new Error('Invalid mode or missing menuItemId');
      }
      
      // Redirect after successful submission
      router.push('/admin/menu');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError((err as Error).message || 'Failed to save menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleAddIngredient = () => {
  //   if (ingredientInput.trim()) {
  //     const currentIngredients = watch('ingredients') || [];
  //     setValue('ingredients', [...currentIngredients, ingredientInput.trim()]);
  //     setIngredientInput('');
  //   }
  // };

  // const handleRemoveIngredient = (index: number) => {
  //   const currentIngredients = [...watchIngredients];
  //   currentIngredients.splice(index, 1);
  //   setValue('ingredients', currentIngredients);
  // };

  // const handleAddAllergen = () => {
  //   if (allergenInput.trim()) {
  //     const currentAllergens = watch('allergens') || [];
  //     setValue('allergens', [...currentAllergens, allergenInput.trim()]);
  //     setAllergenInput('');
  //   }
  // };

  // const handleRemoveAllergen = (index: number) => {
  //   const currentAllergens = [...watchAllergens];
  //   currentAllergens.splice(index, 1);
  //   setValue('allergens', currentAllergens);
  // };

  const handleNameChange = (lang: 'en' | 'vi', value: string) => {
    setFormData({
      ...formData,
      name: {
        ...formData.name,
        [lang]: value
      }
    });
  };

  const handleDescriptionChange = (lang: 'en' | 'vi', value: string) => {
    setFormData({
      ...formData,
      description: {
        ...formData.description,
        [lang]: value
      }
    });
  };

  const handleNutritionChange = (field: keyof typeof formData.nutrition, value: number) => {
    setFormData({
      ...formData,
      nutrition: {
        ...formData.nutrition,
        [field]: value
      }
    });
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
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tên món ăn</label>
        <div className="flex border-b border-gray-200 mb-2">
          <button
            type="button"
            onClick={() => setActiveTab('vi')}
            className={`px-4 py-2 ${activeTab === 'vi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`px-4 py-2 ${activeTab === 'en' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            English
          </button>
        </div>
        {activeTab === 'vi' && (
          <input
            type="text"
            {...register('name.vi', { required: true })}
            value={formData.name.vi}
            onChange={(e) => {
              handleNameChange('vi', e.target.value);
              setValue('name.vi', e.target.value);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên món ăn (tiếng Việt)"
            required
          />
        )}
        {activeTab === 'en' && (
          <input
            type="text"
            {...register('name.en')}
            value={formData.name.en}
            onChange={(e) => {
              handleNameChange('en', e.target.value);
              setValue('name.en', e.target.value);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter dish name (English)"
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <div className="flex border-b border-gray-200 mb-2">
          <button
            type="button"
            onClick={() => setActiveTab('vi')}
            className={`px-4 py-2 ${activeTab === 'vi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`px-4 py-2 ${activeTab === 'en' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
          >
            English
          </button>
        </div>
        {activeTab === 'vi' && (
          <textarea
            {...register('description.vi', { required: true })}
            value={formData.description.vi}
            onChange={(e) => {
              handleDescriptionChange('vi', e.target.value);
              setValue('description.vi', e.target.value);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Nhập mô tả món ăn (tiếng Việt)"
            required
          />
        )}
        {activeTab === 'en' && (
          <textarea
            {...register('description.en')}
            value={formData.description.en}
            onChange={(e) => {
              handleDescriptionChange('en', e.target.value);
              setValue('description.en', e.target.value);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Enter dish description (English)"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
        <select 
          {...register('category', { required: true })}
          value={formData.category}
          onChange={(e) => {
            setFormData({ ...formData, category: e.target.value });
            setValue('category', e.target.value as 'main' | 'side' | 'dessert' | 'beverage');
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Chọn danh mục</option>
          {categories.map(category => (
            <option key={category._id || category.id} value={category._id || category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Giá (VND)</label>
        <input
          type="number"
          {...register('price', { required: true, min: 0 })}
          value={formData.price}
          onChange={(e) => {
            setFormData({ ...formData, price: Number(e.target.value) });
            setValue('price', Number(e.target.value));
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Nhập giá món ăn (VND)"
          min="0"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.price > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.price) : ''}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
            <input
              type="text"
          {...register('image')}
          value={formData.image}
          onChange={(e) => {
            setFormData({ ...formData, image: e.target.value });
            setValue('image', e.target.value);
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Nhập URL hình ảnh"
        />
        {formData.image && (
          <div className="mt-2">
            <Image 
              src={formData.image} 
              alt="Preview" 
              className="h-32 w-auto object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/placeholder-food.jpg';
              }}
            />
          </div>
          )}
        </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thông tin dinh dưỡng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              {...register('nutritionInfo.calories', { min: 0 })}
              value={formData.nutrition.calories}
              onChange={(e) => {
                handleNutritionChange('calories', Number(e.target.value));
                setValue('nutritionInfo.calories', Number(e.target.value));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Calories"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
            <input
              type="number"
              {...register('nutritionInfo.protein', { min: 0 })}
              value={formData.nutrition.protein}
              onChange={(e) => {
                handleNutritionChange('protein', Number(e.target.value));
                setValue('nutritionInfo.protein', Number(e.target.value));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Protein (g)"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
            <input
              type="number"
              {...register('nutritionInfo.carbs', { min: 0 })}
              value={formData.nutrition.carbs}
              onChange={(e) => {
                handleNutritionChange('carbs', Number(e.target.value));
                setValue('nutritionInfo.carbs', Number(e.target.value));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Carbs (g)"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
            <input
              type="number"
              {...register('nutritionInfo.fat', { min: 0 })}
              value={formData.nutrition.fat}
              onChange={(e) => {
                handleNutritionChange('fat', Number(e.target.value));
                setValue('nutritionInfo.fat', Number(e.target.value));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Fat (g)"
              min="0"
            />
          </div>
        </div>
            </div>
            
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thông tin bổ sung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Độ cay (0-5)</label>
                <input
                  type="number"
              value={formData.spicyLevel}
              onChange={(e) => setFormData({ ...formData, spicyLevel: Number(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Độ cay (0-5)"
                  min="0"
              max="5"
                />
              </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian chuẩn bị (phút)</label>
                <input
                  type="number"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Thời gian chuẩn bị (phút)"
                  min="0"
            />
            </div>
          </div>
        </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Tùy chọn chế độ ăn</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVegetarian"
              checked={formData.isVegetarian}
              onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="isVegetarian" className="ml-2 block text-sm text-gray-700">
              Món chay (Vegetarian)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVegan"
              checked={formData.isVegan}
              onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="isVegan" className="ml-2 block text-sm text-gray-700">
              Thuần chay (Vegan)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isGlutenFree"
              checked={formData.isGlutenFree}
              onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="isGlutenFree" className="ml-2 block text-sm text-gray-700">
              Không chứa gluten (Gluten-free)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              Còn món
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/menu')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : mode === 'edit' ? 'Cập nhật' : 'Thêm'}
        </button>
      </div>
    </form>
  );
} 