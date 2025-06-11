// chayfood/app/checkout/payment/[orderId]/components/PaymentMethodCard.tsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PaymentMethodCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  method: string;
  isSelected: boolean;
  onSelect: (method: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  icon,
  label,
  description,
  method,
  isSelected,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(method)}
    className={`border-2 rounded-xl p-5 w-full text-left transition-all duration-200 relative
      ${
        isSelected 
          ? 'border-green-600 bg-green-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`${isSelected ? 'text-green-600' : 'text-gray-600'}`}>
        {icon}
      </div>
      <span className={`font-semibold text-lg ${isSelected ? 'text-green-700' : 'text-gray-800'}`}>{label}</span>
      {isSelected && (
        <div className="absolute right-4 top-4 text-green-600">
          <CheckCircle className="h-6 w-6" />
        </div>
      )}
    </div>
    <div className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>{description}</div>
  </button>
);