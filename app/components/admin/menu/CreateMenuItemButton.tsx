'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreateMenuItemButton() {
  return (
    <Link 
      href="/admin/menu/create"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
      Create New Item
    </Link>
  );
} 