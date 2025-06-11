import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to handle role-based redirects
 * @param adminRedirect - Path to redirect to when user is admin (optional, default: '/admin')
 * @param userRedirect - Path to redirect to when user is not admin (optional)
 * @param onlyOnRoot - Only apply redirect on root path '/' (optional, default: true)
 */
export function useRedirectByRole(options: {
  adminRedirect?: string;
  userRedirect?: string;
  onlyOnRoot?: boolean;
} = {}) {
  const { 
    adminRedirect = '/admin',
    userRedirect,
    onlyOnRoot = true
  } = options;
  
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (isLoading) return;
    
    // Check if we should only apply redirect on root path
    if (onlyOnRoot && typeof window !== 'undefined') {
      // Only apply on root path
      if (window.location.pathname !== '/') {
        return;
      }
    }
    
    // Redirect admin to admin page
    if (isAuthenticated && isAdmin && adminRedirect) {
      router.push(adminRedirect);
    } 
    // Redirect non-admin users (if userRedirect is provided)
    else if (isAuthenticated && !isAdmin && userRedirect) {
      router.push(userRedirect);
    }
  }, [isAuthenticated, isAdmin, isLoading, adminRedirect, userRedirect, onlyOnRoot, router]);
} 