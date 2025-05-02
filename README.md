This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ChayFood Front-end Features

### Shopping Cart System
- **Server-side Cart Storage**: All cart data is stored on the server for persistence and data integrity
- **Robust Error Handling**: The cart handles edge cases including server errors and item validation
- **Real-time Cart Updates**: Cart changes are reflected immediately across the application
- **Notes Feature**: Users can add special instructions to individual items
- **Vietnamese Localization**: Cart interface supports Vietnamese language
- **Currency Formatting**: Prices display correctly in Vietnamese Dong (VND)

### Cart API Integration
The front-end connects to the ChayFood API for cart operations:
- `GET /cart`: Retrieve user's cart
- `POST /cart/items`: Add items to cart
- `PUT /cart/items/:cartItemId`: Update cart items
- `DELETE /cart/items/:cartItemId`: Remove items from cart
- `DELETE /cart`: Clear entire cart

The cart system uses server actions and React hooks for state management.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
