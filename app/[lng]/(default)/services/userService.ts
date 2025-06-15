import apiClient from "../../../lib/services/apiClient";

export interface UserAddress {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  postalCode: string;
  additionalInfo?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  addresses?: UserAddress[];
  dietaryPreferences?: string[];
}

export const userService = {
  // Profile
  async getProfile() {
    const res = await apiClient.get("/user/profile/full");
    return res.data;
  },
  async updateProfile(data: Record<string, unknown>) {
    const res = await apiClient.put("/user/profile", data);
    return res.data;
  },

  // Get user by ID (admin only)
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get(`/user/${userId}`);
      return res.data.data || res.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  },

  // Addresses
  async getAddresses() {
    const res = await apiClient.get("/user/addresses");
    return res.data;
  },
  async addAddress(data: Record<string, unknown>) {
    const res = await apiClient.post("/user/addresses", data);
    return res.data;
  },
  async updateAddress(addressId: string, data: Record<string, unknown>) {
    const res = await apiClient.put(`/user/addresses/${addressId}`, data);
    return res.data;
  },
  async deleteAddress(addressId: string) {
    const res = await apiClient.delete(`/user/addresses/${addressId}`);
    return res.data;
  },
  async setDefaultAddress(addressId: string) {
    const res = await apiClient.patch(`/user/addresses/${addressId}/default`);
    return res.data;
  },
}; 