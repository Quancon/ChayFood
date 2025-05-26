"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("vi");
  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-2xl font-bold mb-6">Cài đặt ngôn ngữ</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block mb-2 font-medium">Chọn ngôn ngữ:</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
        <p className="mt-4 text-gray-600">(Chức năng này là demo, cần kết nối với hệ thống i18n thực tế.)</p>
      </div>
    </div>
  );
} 