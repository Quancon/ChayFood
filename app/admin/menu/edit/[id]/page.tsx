import { Metadata } from 'next';
import MenuItemForm from '../../../../components/admin/menu/MenuItemForm';

export const metadata: Metadata = {
  title: 'Edit Menu Item | ChayFood Admin',
};

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EditMenuItemPage(props: PageProps) {
  const { id } = props.params;
  
  // Add async operation to satisfy Promise requirement
  await new Promise(resolve => setTimeout(resolve, 0));
  
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