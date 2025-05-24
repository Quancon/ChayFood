'use server';

import { cookies } from 'next/headers';
import { getCurrentUser } from './serverAuth';
import { MenuItem } from '../services/types';

export interface CartItem {
  _id?: string; // Cart item ID from server
  menuItem: MenuItem | {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity: number;
  specialInstructions?: string;
  notes?: string; // Added to match backend model
}

// Lấy giỏ hàng từ API
export async function getCart() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { items: [], success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cookieStore = await cookies();
    
    // Check both cookie names for auth token
    let token = cookieStore.get('auth_token')?.value;
    if (!token) {
      token = cookieStore.get('authToken')?.value;
    }
    
    if (!token) {
      console.error('No auth token found in cookies');
      return { items: [], success: false, message: 'No authentication token found' };
    }

    // Đường dẫn GET /cart để lấy giỏ hàng
    const response = await fetch(`${apiUrl}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    console.log('GET cart response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    console.log('GET cart response data:', data);
    
    // Log detailed cart structure for debugging
    if (data && data.cart) {
      console.log('Cart structure:', {
        hasItems: Array.isArray(data.cart.items),
        itemCount: data.cart.items ? data.cart.items.length : 0,
        firstItem: data.cart.items && data.cart.items.length > 0 ? 
          JSON.stringify(data.cart.items[0], null, 2) : 'No items'
      });
    }
    
    // API trả về dữ liệu trong cấu trúc response.cart.items thay vì response.items
    if (data && data.cart && Array.isArray(data.cart.items)) {
      const normalizedItems = await normalizeCartItems(data.cart.items);
      return { 
        items: normalizedItems, 
        success: true 
      };
    } else {
      console.error('Unexpected cart data structure:', data);
      return { items: [], success: true };
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [], success: false, message: 'Failed to fetch cart' };
  }
}

// Helper function to get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  
  // Check both cookie names for auth token
  let token = cookieStore.get('auth_token')?.value;
  if (!token) {
    token = cookieStore.get('authToken')?.value;
  }
  
  return token;
}

// Thêm sản phẩm vào giỏ hàng
export async function addToCart(menuItem: MenuItem, quantity: number, specialInstructions?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('Unauthorized: No user found when adding to cart');
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = await getAuthToken();
    
    if (!token) {
      console.log('No auth_token cookie found');
      return { success: false, message: 'No authentication token found' };
    }

    // Log request details (for debugging)
    console.log('Adding to cart:', {
      menuItemId: menuItem._id,
      quantity,
      hasNotes: !!specialInstructions
    });

    // Đường dẫn POST /cart/items để thêm vào giỏ hàng
    const response = await fetch(`${apiUrl}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        menuItemId: menuItem._id,
        quantity,
        notes: specialInstructions || ''
      }),
      cache: 'no-store'
    });

    // Log the response status (for debugging)
    console.log('Add to cart response status:', response.status);

    if (!response.ok) {
      // Try to get error details if available
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        return { success: false, message: errorData.message || 'Failed to add item to cart' };
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        throw new Error(`Failed to add item to cart (Status: ${response.status})`);
      }
    }

    const data = await response.json();
    console.log('Add to cart successful, response data:', data);
    
    // Kiểm tra cấu trúc response và trả về dữ liệu đúng định dạng
    if (data && data.cart && Array.isArray(data.cart.items)) {
      const normalizedItems = await normalizeCartItems(data.cart.items);
      return { success: true, items: normalizedItems };
    } else {
      // Nếu cấu trúc không đúng, gọi getCart để lấy dữ liệu mới nhất
      console.log('Unexpected data structure, fetching cart');
      return await getCart();
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to add item to cart' };
  }
}

// Cập nhật sản phẩm trong giỏ hàng
export async function updateCartItem(itemId: string, quantity: number, specialInstructions?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    // Đường dẫn PUT /cart/items/:cartItemId để cập nhật giỏ hàng
    const response = await fetch(`${apiUrl}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity,
        notes: specialInstructions
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }

    const data = await response.json();
    console.log('Update cart item response:', data);
    
    // Kiểm tra cấu trúc response
    if (data && data.cart && Array.isArray(data.cart.items)) {
      const normalizedItems = await normalizeCartItems(data.cart.items);
      return { success: true, items: normalizedItems };
    } else {
      // Nếu cấu trúc không đúng, gọi getCart để lấy dữ liệu mới nhất
      console.log('Unexpected data structure, fetching cart');
      return await getCart();
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, message: 'Failed to update cart item' };
  }
}

// Xóa sản phẩm khỏi giỏ hàng
export async function removeFromCart(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    // Đường dẫn DELETE /cart/items/:cartItemId để xóa khỏi giỏ hàng
    const response = await fetch(`${apiUrl}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }

    const data = await response.json();
    console.log('Remove from cart response:', data);
    
    // Kiểm tra cấu trúc response
    if (data && data.cart && Array.isArray(data.cart.items)) {
      const normalizedItems = await normalizeCartItems(data.cart.items);
      return { success: true, items: normalizedItems };
    } else {
      // Nếu cấu trúc không đúng, gọi getCart để lấy dữ liệu mới nhất
      console.log('Unexpected data structure, fetching cart');
      return await getCart();
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

// Xóa toàn bộ giỏ hàng
export async function clearCart() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    // Đường dẫn DELETE /cart để xóa toàn bộ giỏ hàng
    const response = await fetch(`${apiUrl}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}

// Update the normalizeCartItems function to be async
export async function normalizeCartItems(items: unknown[]): Promise<CartItem[]> {
  if (!Array.isArray(items)) return [];
  
  return items.map((item: any) => {
    // Ensure we have a valid menuItem object
    const menuItem = item.menuItem || {};
    
    // Debug log to see the item structure
    console.log('Raw item data:', JSON.stringify(item, null, 2));
    
    // Check if we have a valid name or if it's "Unknown Item"
    let name = menuItem.name;
    if (!name || name === 'Unknown Item') {
      // Try to find name in alternate locations
      name = item.name || '';
      console.log('Replacing Unknown Item name with:', name);
    }
    
    return {
      _id: item._id || undefined,
      menuItem: {
        _id: menuItem._id || '',
        name: name || 'Sản phẩm', // Use default name in Vietnamese if all else fails
        price: typeof menuItem.price === 'number' ? menuItem.price : (typeof item.price === 'number' ? item.price : 0),
        image: menuItem.image || (item.image || ''),
        description: menuItem.description || (item.description || '')
      },
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      specialInstructions: item.notes || item.specialInstructions || '',
      notes: item.notes || ''
    };
  });
} 