'use client';

import { useCart } from '../hooks/useCart';
import { useState } from 'react';

export default function CartDebug() {
  const cart = useCart();
  const [isVisible, setIsVisible] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: isVisible ? '400px' : '40px',
        overflow: 'auto',
        transition: 'max-height 0.3s ease-in-out'
      }}
    >
      <div 
        onClick={() => setIsVisible(!isVisible)}
        style={{ 
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '5px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        Cart Debug: {cart.totalItems} items {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalAmount)}
        <span>{isVisible ? '▲' : '▼'}</span>
      </div>
      
      {isVisible && (
        <div>
          <div style={{ marginBottom: '8px', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => cart.refresh()}
              style={{
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
            
            <button 
              onClick={() => cart.clearCart()}
              style={{
                backgroundColor: '#e24a4a',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Cart
            </button>
            
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              style={{
                backgroundColor: '#4a4ae2',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload
            </button>
          </div>
          
          {cart.error && (
            <div 
              style={{ 
                backgroundColor: 'rgba(255,0,0,0.2)',
                padding: '4px',
                marginBottom: '8px',
                borderRadius: '4px'
              }}
            >
              Error: {cart.error}
            </div>
          )}
          
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify({
              totalItems: cart.totalItems,
              totalAmount: cart.totalAmount,
              items: cart.items
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 