# Artium Web - Frontend

This directory contains the frontend application for Artium, built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Headless primitives), [Shadcn UI](https://ui.shadcn.com/) patterns
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/), [Heroicons](https://heroicons.com/)

## 📋 Prerequisites

- **Node.js**: v18.18.0 or higher (v20+ Recommended for Next.js 16)
- **Package Manager**: npm (v9+) or yarn

## 🚀 Installation

1. Navigate to the frontend directory:

   ```bash
   cd FE/artium-web
   ```

2. Install dependencies:

   ```bash
   npm install
   # or if using yarn
   yarn install
   ```

   > **Note**: If you encounter dependency conflicts (common with React 19/Next 16 in some environments), you can try:
   >
   > ```bash
   > npm install --legacy-peer-deps
   > ```

## ⚙️ Environment Configuration

Create a `.env` file in the root of `FE/artium-web`. You can refer to the following template:

```env
# 🌐 Network & API
NEXT_PUBLIC_API_URL=http://localhost:3001      # URL of your NestJS backend gateway
NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3000 # URL of this frontend application

# 🔐 Authentication & Cookies
NEXT_PUBLIC_COOKIE_DOMAIN=localhost

# 💳 Payments (If applicable)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 🗺️ Third Party Services
# GOOGLE_MAPS_API_KEY=...
# GOOGLE_ANALYTICS_GA4=...

# 🛠️ Internal Flags
NEXT_PUBLIC_App_ENV=development
```

## 🏃 Running the Application

### Development Server

Start the development server with hot-reloading:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

To build the application for production:

```bash
npm run build
```

To start the production server after building:

```bash
npm run start
```

### Linting

To check for code quality issues:

```bash
npm run lint
```

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components and specific feature widgets.
- `src/lib`: Utility functions, helpers, and configurations.
- `src/hooks`: Custom React hooks.
- `src/store`: Zustand state stores for global state management.
- `public`: Static assets (images, fonts, robots.txt).
