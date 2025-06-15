import { Suspense } from 'react';
import ResetPasswordPageClient from '../ResetPasswordPageClient';

export default async function ResetPasswordWithTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <Suspense fallback={<div>Loading reset password form...</div>}>
      <ResetPasswordPageClient token={token} />
    </Suspense>
  );
} 