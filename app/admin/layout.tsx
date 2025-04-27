'use client'

import { ReactNode } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* CSS to hide navbar and footer in admin section */}
      <style jsx global>{`
        /* Remove top padding from main content in admin area */
        main.pt-20 {
          padding-top: 0 !important;
        }
        
        /* Hide the main site header and footer in admin section */
        body > div > header,
        body > div > footer {
          display: none !important;
        }
      `}</style>
      
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
} 