"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { userService } from "../../lib/services/userService";
import { UserIcon, MapPinIcon, GiftIcon, CreditCardIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

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
        onSuccess("Cập nhật địa chỉ thành công!");
      } else {
        await userService.addAddress(form);
        onSuccess("Thêm địa chỉ thành công!");
      }
      onClose();
    } catch  {
      setError("Lưu địa chỉ thất bại");
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
          aria-label="Đóng"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-4 text-center flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-blue-500" />
          {isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Tên người nhận"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="street"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Địa chỉ (street)"
            value={form.street}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="city"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Thành phố (city)"
            value={form.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="state"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Tỉnh/Bang (state)"
            value={form.state}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="postalCode"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Mã bưu điện (postal code)"
            value={form.postalCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="additionalInfo"
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
            placeholder="Thông tin bổ sung (không bắt buộc)"
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
              Đóng
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu địa chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const userRes = await userService.getProfile();
      setUser(userRes.data || userRes);
      const addrRes = await userService.getAddresses();
      setAddresses(addrRes.data || addrRes);
    } catch  {
      setError("Không thể tải thông tin người dùng hoặc địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle avatar file select
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    setAvatarLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("picture", avatarFile);
      await userService.updateProfile(formData); // updateProfile phải hỗ trợ FormData
      setSuccess("Cập nhật ảnh đại diện thành công!");
      setAvatarFile(null);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Cập nhật ảnh đại diện thất bại");
      } else {
        setError("Cập nhật ảnh đại diện thất bại");
      }
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-2 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar + Info */}
        <div className="md:col-span-1 flex flex-col items-center bg-white rounded-3xl shadow-xl p-8 relative">
          <div className="relative group">
            <Image
              src={user?.picture || "/default-avatar.png"}
              alt="avatar"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover transition-transform group-hover:scale-105"
            />
            <form onSubmit={handleAvatarUpload} className="absolute bottom-0 right-0">
              <label className="bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition flex items-center">
                <PencilIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarFile && (
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                  disabled={avatarLoading}
                >
                  {avatarLoading ? "Đang tải..." : "Tải lên ảnh"}
                </button>
              )}
            </form>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-base">{user?.email}</p>
          {user?.role && <span className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{user.role}</span>}
        </div>
        {/* Info Cards */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Địa chỉ giao hàng */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-blue-500" /> Địa chỉ giao hàng
              </h3>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 flex items-center gap-1 text-sm shadow-md"
                onClick={() => { setEditAddress(null); setShowAddressModal(true); }}
              >
                <PlusIcon className="w-5 h-5" /> Thêm địa chỉ
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Chưa có địa chỉ nào.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr._id} className="border rounded-2xl p-4 bg-gray-50 flex flex-col gap-1 relative shadow-sm hover:shadow-lg transition-shadow">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-400" /> {addr.name}
                      <button
                        className="ml-auto p-1 text-gray-400 hover:text-blue-600"
                        title="Chỉnh sửa địa chỉ"
                        onClick={() => { setEditAddress(addr); setShowAddressModal(true); }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1 ml-1 ${addr.isDefault ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-600 text-gray-400'}`}
                        title={addr.isDefault ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ"}
                        disabled={addr.isDefault}
                        onClick={async () => {
                          if (addr.isDefault) return;
                          if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
                            try {
                              await userService.deleteAddress(addr._id);
                              setSuccess("Đã xóa địa chỉ thành công!");
                              fetchData();
                            } catch {
                              setError("Xóa địa chỉ thất bại");
                            }
                          }
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-gray-700 text-sm flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 text-gray-400" /> {addr.street}, {addr.city}, {addr.state}, {addr.postalCode}
                    </div>
                    {addr.phone && <div className="text-sm text-gray-500 flex items-center gap-1"><span className="font-medium">SĐT:</span> {addr.phone}</div>}
                    {addr.additionalInfo && <div className="text-xs text-gray-400 italic">{addr.additionalInfo}</div>}
                    {addr.isDefault && <span className="absolute top-2 right-2 text-green-600 text-xs font-semibold">Mặc định</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Subscription section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center gap-4">
            <CreditCardIcon className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Gói đăng ký (Subscription)</h3>
              <p className="text-gray-500">(Thông tin gói đăng ký sẽ hiển thị ở đây)</p>
            </div>
          </div>
          {/* Promotion section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center gap-4">
            <GiftIcon className="w-8 h-8 text-pink-500" />
            <div>
              <h3 className="text-lg font-semibold">Ưu đãi & Khuyến mãi</h3>
              <p className="text-gray-500">(Các mã giảm giá, ưu đãi sẽ hiển thị ở đây)</p>
            </div>
          </div>
        </div>
      </div>
      {/* Modal thêm/sửa địa chỉ */}
      <AddAddressModal
        show={showAddressModal}
        onClose={() => { setShowAddressModal(false); setEditAddress(null); }}
        onSuccess={(msg) => {
          setSuccess(msg);
          setEditAddress(null);
          setShowAddressModal(false);
          fetchData();
        }}
        address={editAddress}
      />
      {/* Thông báo */}
      <div className="fixed left-1/2 -translate-x-1/2 top-4 z-50">
        {loading && <div className="bg-white px-6 py-3 rounded-xl shadow text-gray-600">Đang tải thông tin...</div>}
        {error && <div className="bg-red-100 text-red-700 px-6 py-3 rounded-xl shadow mb-2">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl shadow mb-2">{success}</div>}
      </div>
    </div>
  );
} 