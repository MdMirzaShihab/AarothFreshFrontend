# Aaroth Fresh Frontend - Claude Code Instructions

This file provides guidance to Claude Code when working with the Aaroth Fresh B2B marketplace frontend.

## Project Overview

React TypeScript frontend for Aaroth Fresh B2B marketplace - connecting local vegetable vendors with restaurants. Built with modern stack focusing on mobile-first design and performance.

## Technology Stack

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first approach)
- **State Management**: Zustand (global state) + TanStack Query (server state)
- **Routing**: React Router v6 with role-based protection
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite with PWA plugin
- **Testing**: Vitest + React Testing Library

## Development Commands

- **Start development server**: `npm run dev` (Vite dev server with HMR)
- **Build for production**: `npm run build` (TypeScript check + Vite build)
- **Preview production build**: `npm run preview`
- **Run tests**: `npm run test` (Vitest)
- **Run tests with coverage**: `npm run test:coverage`
- **Lint code**: `npm run lint` (ESLint)
- **Format code**: `npm run format` (Prettier)
- **Type check**: `npm run type-check` (TypeScript compiler)

## Backend Integration

### API Configuration
- **Backend Base URL**: `http://localhost:5000/api/v1` (development)
- **Production URL**: To be configured in environment variables
- **Authentication**: JWT tokens with phone-based login (NOT email-based)
- **Content Type**: JSON for all API requests
- **CORS**: Configured in backend for frontend domains

### Authentication Flow
- **Login Method**: Phone number + password (not email)
- **Phone Format**: Must include country code (e.g., `+8801234567890`)
- **Token Storage**: localStorage for persistence, memory for active session
- **Token Refresh**: Automatic refresh on 401 responses
- **Role-based Access**: Routes and features based on user role

### User Roles & Permissions
- **admin**: Full system access, manage users/products/categories
- **vendor**: Create/manage listings, process orders, view analytics
- **restaurantOwner**: Browse products, place orders, manage restaurant
- **restaurantManager**: Same as restaurantOwner but with limited admin rights

## Important Notes for Claude Code

### Authentication Context
- **CRITICAL**: This app uses PHONE-based authentication, not email
- **Phone Format**: Always include country code validation
- **Backend Compatibility**: Ensure frontend auth matches backend exactly
- **Role System**: Four distinct roles with different permissions

### Mobile Priority
- **Mobile-First**: Always prioritize mobile user experience
- **Touch Optimization**: All interactions must be touch-friendly
- **Performance**: Mobile users have slower connections and less powerful devices
- **Offline Support**: Consider offline functionality for critical features

### Development Workflow
- **Use TodoWrite**: For complex multi-step tasks
- **Follow Architecture**: Adhere to the folder structure and patterns
- **Test Early**: Write tests alongside feature development
- **Performance First**: Consider performance implications of every decision

### Backend Integration
- **API Consistency**: Match backend data structures exactly
- **Error Handling**: Handle backend errors gracefully
- **Loading States**: Provide feedback for all async operations
- **Caching Strategy**: Use TanStack Query for efficient data management