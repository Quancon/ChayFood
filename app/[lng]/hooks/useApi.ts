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
  deps: unknown[] = [] // Add dependencies array, type unknown[]
): ApiResponse<T | null> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if the component is mounted
  const isMounted = useRef(true);

  // WARNING: Dynamic dependencies (deps) are not statically checked by React linter.
  //          Make sure to pass all necessary dependencies manually.
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
  }, [apiCall]); // Only apiCall is statically checked. Dynamic deps are handled in useEffect below.

  // Initial fetch if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, immediate, ...deps]); // Dynamic deps are spread here for runtime effect

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