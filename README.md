# Aaroth Fresh Frontend

A modern React TypeScript frontend for the Aaroth Fresh B2B marketplace, connecting local vegetable vendors with restaurants.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 7+

### Installation

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd AarothFreshFrontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🛠️ Technology Stack

- **React 18** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Framer Motion** - Animation library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal)
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── common/         # Common components (LoadingSpinner, ErrorBoundary)
├── pages/              # Route-based page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard and features
│   ├── vendor/         # Vendor dashboard and features
│   ├── restaurant/     # Restaurant dashboard and features
│   └── public/         # Public pages (Home, About)
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # App constants and configuration
└── styles/             # Global styles and Tailwind config
```

## 🎨 Design System

The application follows a **"Minimalistic Futurism with Organic Touch"** design philosophy:

- **Organic Tech**: Natural curves and gradients with high-tech precision
- **Mobile-First**: Responsive design optimized for touch interactions
- **Glassmorphism**: Modern depth with backdrop blur effects
- **Custom Color Palette**: Earth-tech fusion colors
- **Accessibility**: WCAG 2.1 AA compliance

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript checks

# Testing
npm run test            # Run tests (to be implemented)
```

## 🌐 Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Aaroth Fresh
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true
```

## 🔐 Authentication

- **Phone-based login** (not email)
- **JWT tokens** with automatic refresh
- **Role-based access control**:
  - `admin` - Full system access
  - `vendor` - Manage listings and orders
  - `restaurantOwner` - Browse and order products
  - `restaurantManager` - Limited admin rights

## 📱 Mobile-First Approach

- **Touch targets**: Minimum 44px × 44px
- **Responsive breakpoints**: Tailwind CSS standard
- **Gesture support**: Swipe, pull-to-refresh
- **PWA-ready**: Service worker and offline support

## 🎯 Key Features

- **Responsive Design**: Works seamlessly on all devices
- **Real-time Updates**: Live data with TanStack Query
- **Form Validation**: Robust validation with Zod
- **Error Handling**: Graceful error recovery
- **Loading States**: Smooth loading experiences
- **Accessibility**: Screen reader and keyboard navigation support

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The `dist/` folder contains the production-ready files.

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Use conventional commit messages
3. Ensure TypeScript strict mode compliance
4. Write tests for new features
5. Update documentation as needed

## 📄 License

ISC License - see LICENSE file for details.

## 🔗 Related Projects

- [Aaroth Fresh Backend](../AarothFreshBackend) - Node.js API server
- [Aaroth Fresh Mobile](../AarothFreshMobile) - React Native mobile app