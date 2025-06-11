"use client";
import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { userService } from "@/lib/services/userService";
import { UserIcon, MapPinIcon, GiftIcon, CreditCardIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  picture?: string | null;
}

interface Address {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  additionalInfo?: string;
  isDefault?: boolean;
}

interface AddAddressModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  address?: Address | null;
}

function AddAddressModal({ show, onClose, onSuccess, address }: AddAddressModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: address?.name || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    phone: address?.phone || "",
    additionalInfo: address?.additionalInfo || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!address;

  useEffect(() => {
    if (address) {
      setForm({
        name: address.name || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        phone: address.phone || "",
        additionalInfo: address.additionalInfo || "",
      });
    } else {
      setForm({
        name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
        additionalInfo: "",
      });
    }
    setError(null);
  }, [address, show]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && address?._id) {
        await userService.updateAddress(address._id, form);
        onSuccess(t("profile.address_update_success"));
      } else {
        await userService.addAddress(form);
        onSuccess(t("profile.address_add_success"));
      }
      onClose();
    } catch (error: unknown) {
      void error; // Explicitly mark as unused
      setError(t("profile.address_save_failure"));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-2 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label={t("close_button_label")}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4 text-center flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-blue-500" />
          {isEdit ? t("profile.edit_address") : t("profile.add_new_address")}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.recipient_name_placeholder")}
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="street"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.street_address_placeholder")}
            value={form.street}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.city_placeholder")}
            value={form.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.state_placeholder")}
            value={form.state}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="postalCode"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.postal_code_placeholder")}
            value={form.postalCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.phone_number_placeholder")}
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="additionalInfo"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder={t("profile.additional_info_placeholder")}
            value={form.additionalInfo}
            onChange={handleChange}
          />
          {error && <div className="text-red-600 text-center text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
              onClick={onClose}
            >
              {t("close_button_label")}
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
              disabled={loading}
            >
              {loading ? t("saving_button_label") : isEdit ? t("profile.save_changes_button_label") : t("profile.save_address_button_label")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfilePageClient() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    setError(null);
    setSuccess(null);
    try {
      const userRes = await userService.getProfile();
      setProfile(userRes.data || userRes);
      const addrRes = await userService.getAddresses();
      setAddresses(addrRes.data || addrRes);
    } catch (error: unknown) {
      void error; // Explicitly mark as unused
      setError(t("profile.fetch_data_failure"));
    } finally {
      setLoadingProfile(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle avatar file select
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle avatar change logic - now properly typed
    }
  };

  // Handle address actions
  const handleAddAddress = () => {
    setEditAddress(null);
    setShowAddAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditAddress(address);
    setShowAddAddressModal(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm(t("profile.confirm_delete_address"))) return;
    // Implement delete logic here
    try {
      await userService.deleteAddress(id);
      setSuccess(t("profile.address_delete_success"));
      fetchData(); // Refresh addresses after deletion
    } catch (error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError(t("profile.address_delete_failure"));
    }
  };

  // Helper function to format address for display
  const formatAddress = (addr: Address) => {
    return [addr.street, addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ");
  };

  if (loadingProfile && !profile && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen-content">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen-content bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white text-center">
          <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-white shadow-md">
            {profile?.picture ? (
              <Image
                src={profile.picture}
                alt={t("profile.avatar_alt_text")}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            ) : (
              <UserIcon className="w-full h-full text-gray-300 bg-gray-700 p-2" />
            )}
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-75 p-1 rounded-full cursor-pointer hover:bg-opacity-100 transition-all duration-300">
              <PencilIcon className="w-4 h-4 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <h2 className="text-2xl font-bold">{profile?.name || t("profile.guest_user")}</h2>
          <p className="text-sm text-blue-200">{profile?.email}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">{t("error_prefix")}</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">{t("success_prefix")}</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
          )}

          {/* Profile Section */}
          <section className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-500">
              <UserIcon className="w-5 h-5 text-purple-500" />
              {t("profile.personal_info_title")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-500">{t("profile.name_label")}</p>
                <p className="text-base">{profile?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t("profile.email_label")}</p>
                <p className="text-base">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t("profile.role_label")}</p>
                <p className="text-base">{profile?.role || t("profile.default_role")}</p>
              </div>
            </div>
          </section>

          {/* Addresses Section */}
          <section className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-500">
              <MapPinIcon className="w-5 h-5 text-orange-500" />
              {t("profile.my_addresses_title")}
            </h3>
            {addresses.length === 0 ? (
              <p className="text-gray-500">{t("profile.no_addresses_message")}</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr._id} className="border border-gray-100 rounded-md p-4 bg-gray-50 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="text-sm text-gray-600">{formatAddress(addr)}</p>
                      {addr.isDefault && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full mt-1 inline-block">
                          {t("profile.default_address_label")}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title={t("profile.edit_address_button_title")}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title={t("profile.delete_address_button_title")}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleAddAddress}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-5 h-5" />
              {t("profile.add_new_address_button_label")}
            </button>
          </section>

          {/* Other sections (Placeholder for now) */}
          <section className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-500">
              <GiftIcon className="w-5 h-5 text-green-500" />
              {t("profile.my_promotions_title")}
            </h3>
            <p className="text-gray-500">{t("profile.no_promotions_message")}</p>
          </section>

          <section className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-500">
              <CreditCardIcon className="w-5 h-5 text-teal-500" />
              {t("profile.payment_methods_title")}
            </h3>
            <p className="text-gray-500">{t("profile.no_payment_methods_message")}</p>
          </section>
        </div>
      </div>
      <AddAddressModal
        show={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSuccess={(msg) => { setSuccess(msg); fetchData(); }}
        address={editAddress}
      />
    </div>
  );
}
