import apiClient from "./apiClient";

export const userService = {
  // Profile
  async getProfile() {
    const res = await apiClient.get("/user/profile/full");
    return res.data;
  },
  async updateProfile(data: any) {
    const res = await apiClient.put("/user/profile", data);
    return res.data;
  },

  // Addresses
  async getAddresses() {
    const res = await apiClient.get("/user/addresses");
    return res.data;
  },
  async addAddress(data: any) {
    const res = await apiClient.post("/user/addresses", data);
    return res.data;
  },
  async updateAddress(addressId: string, data: any) {
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