import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe publishable key from environment variable
// Make sure to set this in your .env.local file
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Missing Stripe publishable key. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.');
}

// Initialize Stripe with the publishable key
export const getStripe = () => {
  return loadStripe(stripePublishableKey || '');
}; 