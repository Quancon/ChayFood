import { Metadata } from 'next';
import MenuItemForm from '../../../../components/admin/menu/MenuItemForm';

export const metadata: Metadata = {
  title: 'Create Menu Item | ChayFood Admin',
};

export default function CreateMenuItemPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Create Menu Item</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <MenuItemForm mode="create" />
      </div>
    </div>
  );
} 