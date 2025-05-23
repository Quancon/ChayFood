'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiResponse<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  immediate = true,
  deps: any[] = [] // Add dependencies array
): ApiResponse<T | null> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if the component is mounted
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiCall, ...deps]); // Include custom dependencies

  // Initial fetch if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, immediate]);

  // Reset isMounted on re-mount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Return data, loading state, error, and refetch function
  return { 
    data, 
    loading, 
    error, 
    refetch: useCallback(() => {
      if (isMounted.current) {
        return fetchData();
      }
      return Promise.resolve();
    }, [fetchData])
  };
}

export default useApi; 