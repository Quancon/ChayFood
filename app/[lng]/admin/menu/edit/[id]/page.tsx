"use client"
import { useParams } from 'next/navigation';
import MenuItemForm from '../../../../../components/admin/menu/MenuItemForm';

// No Metadata export for client components

// No PageProps interface needed for client components with useParams

export default function EditMenuItemPage() {
  const params = useParams();
  const { id } = params as { id: string };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Edit Menu Item</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <MenuItemForm menuItemId={id} mode="edit" />
      </div>
    </div>
  );
} 