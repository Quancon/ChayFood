'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import OrderStatistics from '@/components/admin/analytics/OrderStatistics';
import CustomerStats from '@/components/admin/analytics/CustomerStats';
import PopularDishesChart from '@/components/admin/analytics/PopularDishesChart';
import OrderTrendsChart from '@/components/admin/analytics/OrderTrendsChart';
import RegionalOrdersMap from '@/components/admin/analytics/RegionalOrdersMap';
import { AnalyticsProvider, useAnalytics } from '@/context/AnalyticsContext';
import { analyticsService } from '@/services/analyticsService';

// Immediate debug logs at module-level
console.log('DEBUG: Analytics page is being imported');

// Force debug mode on
if (typeof window !== 'undefined') {
  window.localStorage.setItem('analyticsDebugMode', 'true');
  console.log('DEBUG: Forcing debug mode on');
}

function AnalyticsHeader() {
  // Immediate debug log
  console.log('DEBUG: AnalyticsHeader rendering');
  
  const { refreshData, isLoading, lastFetchTime } = useAnalytics();
  const [debugMode, setDebugMode] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Initialize debug mode state & check auth token
  useEffect(() => {
    console.log('DEBUG: AnalyticsHeader useEffect running');
    
    if (typeof window !== 'undefined') {
      const isDebug = analyticsService.isDebugMode();
      setDebugMode(isDebug);
      
      // Check auth token
      const token = localStorage.getItem('authToken');
      setAuthToken(token);
      
      if (!token) {
        console.error('DEBUG: No auth token found in localStorage');
      } else {
        console.log('DEBUG: Auth token found, length:', token.length);
        // Print the first and last 5 characters of the token for debugging
        console.log('DEBUG: Token preview:', token.substring(0, 5) + '...' + token.substring(token.length - 5));
      }
      
      // Force a data refresh after a short delay
      setTimeout(() => {
        console.log('DEBUG: Forcing data refresh');
        refreshData();
      }, 1000);
    }
  }, [refreshData]);
  
  // Test API connection
  const testApiConnection = async () => {
    setTestingApi(true);
    setApiStatus(null);
    
    try {
      console.log('DEBUG: Testing API connection...');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      
      if (response.ok) {
        console.log('DEBUG: API connection successful');
        setApiStatus({
          success: true,
          message: `API is online. Status: ${response.status} ${response.statusText}`
        });
      } else {
        console.error('DEBUG: API connection failed with status:', response.status);
        setApiStatus({
          success: false,
          message: `API returned error: ${response.status} ${response.statusText}`
        });
      }
    } catch (error: any) {
      console.error('DEBUG: API connection test failed:', error.message);
      setApiStatus({
        success: false,
        message: `API connection failed: ${error.message}`
      });
    } finally {
      setTestingApi(false);
    }
  };
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    analyticsService.setDebugMode(newMode);
    
    // Force refresh to show updated console logs
    if (newMode) {
      console.clear();
      console.info('🔍 Debug mode enabled. Check console for detailed API logs.');
    } else {
      console.info('Debug mode disabled.');
    }
  };
  
  // Format last fetch time
  const formatLastFetched = () => {
    if (!lastFetchTime) return '';
    
    return new Intl.RelativeTimeFormat('en', { 
      numeric: 'auto' 
    }).format(
      0, 
      'seconds'
    ) + ' (' + lastFetchTime.toLocaleTimeString() + ')';
  };
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={testApiConnection}
          disabled={testingApi}
          className="px-3 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-1"
          title="Test API connection"
        >
          {testingApi ? (
            <>
              <svg className="animate-spin h-3 w-3 text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test API</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-1"
          title="Refresh all analytics data"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3 w-3 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
        
        <button
          onClick={toggleDebugMode}
          className={`px-3 py-1 text-xs font-medium rounded ${
            debugMode 
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          title="Toggle API request/response logging in console"
        >
          {debugMode ? '🔍 Debug: ON' : '🔍 Debug: OFF'}
        </button>
        
        <div className="text-sm text-gray-500">
          {lastFetchTime && (
            <span title={`Last updated: ${lastFetchTime.toLocaleString()}`}>
              Updated {formatLastFetched()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const { error, isLoading } = useAnalytics();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Check auth token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setAuthToken(token);
    }
  }, []);
  
  // Test API connection function (shared with AnalyticsHeader)
  const testApiConnection = async () => {
    try {
      console.log('DEBUG: Testing API connection from content...');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      
      if (response.ok) {
        console.log('DEBUG: API connection successful');
        setApiStatus({
          success: true,
          message: `API is online. Status: ${response.status} ${response.statusText}`
        });
      } else {
        console.error('DEBUG: API connection failed with status:', response.status);
        setApiStatus({
          success: false,
          message: `API returned error: ${response.status} ${response.statusText}`
        });
      }
    } catch (error: any) {
      console.error('DEBUG: API connection test failed:', error.message);
      setApiStatus({
        success: false,
        message: `API connection failed: ${error.message}`
      });
    }
  };
  
  // Run test on initial load
  useEffect(() => {
    testApiConnection();
  }, []);
  
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      
      <div className="bg-white p-6 rounded-lg shadow">
        <AnalyticsFilters />
      </div>
      
      {/* API status message */}
      {apiStatus && (
        <div className={`${apiStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg p-4 text-sm`}>
          <div className="font-medium mb-1">{apiStatus.success ? 'API Connection Successful' : 'API Connection Problem'}</div>
          <p>{apiStatus.message}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <div className="font-medium mb-1">Warning</div>
          <p>{error}</p>
        </div>
      )}
      
      {/* Auth token warning if missing */}
      {authToken === null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <div className="font-medium mb-1">Authentication Error</div>
          <p>No authentication token found. Please try logging in again.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Order Statistics</h2>
            <OrderStatistics />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Customer Stats</h2>
            <CustomerStats />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Popular Dishes</h2>
            <PopularDishesChart />
          </div>
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Order Trends</h2>
            <OrderTrendsChart />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Regional Orders</h2>
            <RegionalOrdersMap />
          </div>
        </Suspense>
      </div>
      
      {analyticsService.isDebugMode() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <div className="font-medium text-blue-800 mb-2">Debug Mode Active</div>
          <p className="text-blue-700">
            Detailed API request/response logs are now visible in your browser console (F12).
            Check the console after interacting with filters to see all API activity.
          </p>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    }>
      <AnalyticsProvider>
        <AnalyticsContent />
      </AnalyticsProvider>
    </Suspense>
  )
} 