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

## ✨ ChayFood Project Features

This project is a full-stack food ordering platform built with Next.js, featuring a comprehensive set of functionalities for both customers and administrators.

### 👤 Customer-Facing Features

*   **Multi-language Support (i18n)**: Fully localized for Vietnamese (vi) and English (en) with automatic language detection and a language switcher.
*   **Menu Browsing**: Users can browse menu items, which are organized into categories (Main Dishes, Side Dishes, Desserts, Beverages).
*   **Authentication**: Secure user sign-in and sign-up functionality. Includes a complete password reset flow via email.
*   **Shopping Cart System**:
    *   **Persistent Cart**: Cart state is saved on the server, allowing users to continue their order across sessions.
    *   **Real-time Updates**: Add, remove, and update item quantities with immediate feedback.
    *   **Item Notes**: Add special instructions for individual items in the cart.
*   **Checkout Process**: A streamlined process for users to place their orders.
*   **Account Management**: Users can view their profile, order history, and manage subscriptions.
*   **AI Chat Agent**: An integrated chatbot powered by a Hugging Face model to answer user questions about the menu.

### 🛠️ Admin Dashboard

A protected, role-based admin panel for managing the restaurant's operations.

*   **Comprehensive Analytics**:
    *   **Real-time Metrics**: Interactive charts displaying revenue, order volume, and new customer data.
    *   **Advanced Filtering**: Filter analytics by various date ranges (day, week, month, year) and by region.
    *   **Performance Tracking**: Identify best-selling items based on quantity and revenue.
*   **Menu Management (CRUD)**:
    *   Full control to create, view, update, and delete menu items.
    *   **Bilingual Content**: Manage item names and descriptions in both Vietnamese and English.
    *   **Detailed Item Attributes**: Manage price, categories, images, availability, ingredients, nutritional information, allergens, spicy level, and more.
*   **Order Management**: View and manage incoming orders with a detailed table view and status tracking.

### ⚙️ Technical Features

*   **Next.js 14 App Router**: Utilizes the latest features of Next.js for a modern, robust architecture, including Route Groups for layouts.
*   **Server Actions**: Implements mutations and data fetching using secure server-side logic.
*   **Role-Based Access Control (RBAC)**: Middleware protects admin routes, ensuring only authorized users can access the dashboard.
*   **API Integration**: The front-end communicates with a separate Node.js/Express backend for data persistence.
*   **Component-Based UI**: Built with React, TypeScript, and Tailwind CSS for a scalable and maintainable user interface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
