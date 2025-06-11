import { Suspense } from 'react';
import OrderSuccessPageClient from './OrderSuccessPageClient';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading order details...</div>}>
      <OrderSuccessPageClient />
    </Suspense>
  );
} 