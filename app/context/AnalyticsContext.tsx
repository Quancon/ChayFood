'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { analyticsService } from '@/services/analyticsService';
import { OrderStats, CustomerStats, PopularDish, OrderTrend, RegionalOrder } from '@/services/analyticsService';

// Force debug logs
console.log('DEBUG: AnalyticsContext is being imported');

interface AnalyticsContextType {
  isLoading: boolean;
  error: string | null;
  orderStats: OrderStats | null;
  customerStats: CustomerStats | null;
  popularDishes: PopularDish[] | null;
  orderTrends: OrderTrend[] | null;
  regionalData: RegionalOrder[] | null;
  refreshData: () => Promise<void>;
  lastFetchTime: Date | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  console.log('DEBUG: AnalyticsProvider rendering');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [popularDishes, setPopularDishes] = useState<PopularDish[] | null>(null);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[] | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalOrder[] | null>(null);

  // Get URL parameter values
  const timeRange = searchParams.get('range') || 'month';
  const region = searchParams.get('region') || 'all';
  const category = searchParams.get('category') || 'all';
  
  // Process date parameters
  const rawStartDate = searchParams.get('start');
  const rawEndDate = searchParams.get('end');
  
  // Format dates properly if they exist and timeRange is 'custom'
  let startDate: string | null = null;
  let endDate: string | null = null;
  
  if (timeRange === 'custom' && rawStartDate && rawEndDate) {
    try {
      // Validate dates and format them as ISO strings
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);
      
      if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
        startDate = startDateObj.toISOString();
        endDate = endDateObj.toISOString();
        console.log('DEBUG: Using custom date range:', { startDate, endDate });
      } else {
        console.error('DEBUG: Invalid date format in URL parameters');
      }
    } catch (err) {
      console.error('DEBUG: Error parsing date parameters:', err);
    }
  } else if (timeRange === 'custom') {
    console.log('DEBUG: Custom timeRange selected but missing start/end dates');
    
    // Default to last 7 days if custom is selected but no dates provided
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    startDate = start.toISOString();
    endDate = end.toISOString();
    console.log('DEBUG: Using default 7-day range for custom timeRange:', { startDate, endDate });
  } else {
    // For non-custom ranges, let the backend handle date calculation
    console.log('DEBUG: Using backend date calculation for timeRange:', timeRange);
    startDate = null;
    endDate = null;
  }
  
  console.log('DEBUG: AnalyticsProvider params:', { timeRange, region, category, startDate, endDate });

  // Track individual loading states for better debugging
  const [loadingStates, setLoadingStates] = useState({
    orderStats: false,
    customerStats: false, 
    popularDishes: false,
    orderTrends: false,
    regionalData: false
  });

  // Use useCallback to prevent re-creating function on each render
  const fetchData = useCallback(async () => {
    console.log('DEBUG: fetchData called');
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    
    // Reset all data at the beginning of each fetch to avoid showing old data on error
    setOrderStats(null);
    setCustomerStats(null);
    setPopularDishes(null);
    setOrderTrends(null);
    setRegionalData(null);
    
    // Reset individual loading states
    setLoadingStates({
      orderStats: true,
      customerStats: true,
      popularDishes: true,
      orderTrends: true,
      regionalData: true
    });

    // Debug info
    console.log('DEBUG: Starting analytics data fetch with parameters:',
      { timeRange, region, category, startDate, endDate });
    
    // Check auth token first
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('DEBUG: Auth token available:', !!token);
      if (!token) {
        console.error('DEBUG: No auth token found, API calls will likely fail');
        setError('Authentication error: No token found. Please log in again.');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      console.log('DEBUG: Making API requests...');
      
      // Fetch all analytics data in parallel with individual error handling
      const results = await Promise.allSettled([
        analyticsService.getOrderStats(timeRange, region, category, startDate, endDate),
        analyticsService.getCustomerStats(timeRange, region, startDate, endDate),
        analyticsService.getPopularDishes(timeRange, region, category, startDate, endDate),
        analyticsService.getOrderTrends(timeRange, region, category, startDate, endDate),
        analyticsService.getRegionalOrders(timeRange, category, startDate, endDate)
      ]);
      
      console.log('DEBUG: API requests completed');
      
      // Process results - handle partial failures
      if (results[0].status === 'fulfilled') {
        console.log('DEBUG: Order stats request succeeded');
        setOrderStats(results[0].value);
      } else {
        console.error('DEBUG: Error fetching order stats:', results[0].reason);
        setOrderStats(null);
      }
      
      if (results[1].status === 'fulfilled') {
        console.log('DEBUG: Customer stats request succeeded');
        setCustomerStats(results[1].value);
      } else {
        console.error('DEBUG: Error fetching customer stats:', results[1].reason);
        setCustomerStats(null);
      }
      
      if (results[2].status === 'fulfilled') {
        console.log('DEBUG: Popular dishes request succeeded');
        setPopularDishes(results[2].value);
      } else {
        console.error('DEBUG: Error fetching popular dishes:', results[2].reason);
        setPopularDishes(null);
      }
      
      if (results[3].status === 'fulfilled') {
        console.log('DEBUG: Order trends request succeeded');
        setOrderTrends(results[3].value);
      } else {
        console.error('DEBUG: Error fetching order trends:', results[3].reason);
        setOrderTrends(null);
      }
      
      if (results[4].status === 'fulfilled') {
        console.log('DEBUG: Regional data request succeeded');
        setRegionalData(results[4].value);
      } else {
        console.error('DEBUG: Error fetching regional data:', results[4].reason);
        setRegionalData(null);
      }
      
      // Check if any requests failed
      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length > 0) {
        console.error(`DEBUG: ${failedRequests.length} out of ${results.length} data requests failed`);
        
        // Get more detailed error messages from each failed request
        const errorDetails = failedRequests.map((result: any) => {
          const err = result.reason;
          // Extract detailed error message from API response if available
          if (err.response && err.response.data && err.response.data.message) {
            return err.response.data.message;
          } else if (err.message) {
            return err.message;
          }
          return 'Unknown error';
        }).join('; ');
        
        setError(`API Error: ${errorDetails}`);
      } else {
        console.log('DEBUG: All requests succeeded');
        setError(null);
      }
      
      // Update last fetch timestamp
      setLastFetchTime(new Date());
      
    } catch (err: any) {
      console.error('DEBUG: Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data. Please try again later.');
    } finally {
      // Update loading states
      setLoadingStates({
        orderStats: false,
        customerStats: false,
        popularDishes: false,
        orderTrends: false,
        regionalData: false
      });
      setIsLoading(false);
      
      // Log performance
      const endTime = performance.now();
      console.log(`DEBUG: Analytics data fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
    }
  }, [timeRange, region, category, startDate, endDate]); // Dependencies

  // useEffect will call fetchData when any dependency changes
  useEffect(() => {
    console.log('DEBUG: AnalyticsProvider useEffect running, calling fetchData');
    fetchData();
  }, [fetchData]);

  // Package values to pass down to child components
  const value = {
    isLoading,
    error,
    orderStats,
    customerStats,
    popularDishes,
    orderTrends,
    regionalData,
    refreshData: fetchData,
    lastFetchTime
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook to use the context
export function useAnalytics() {
  console.log('DEBUG: useAnalytics hook called');
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    console.error('DEBUG: useAnalytics must be used within an AnalyticsProvider');
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
} 