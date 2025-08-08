# Overview

KeyPanel is a professional license key management system built with React (frontend) and Express.js (backend). The application provides secure access control and API integration for managing users, generating license keys, and tracking usage. It features role-based authentication with admin and user roles, comprehensive dashboard analytics, and a modern UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control
- **Middleware**: Custom authentication and authorization middleware

## Database Schema
- **Users Table**: Stores user accounts with roles (admin/user) and status
- **License Keys Table**: Manages license keys with types (basic/premium/lifetime) and expiration
- **API Logs Table**: Tracks API usage and requests for analytics

## Authentication & Authorization
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Role-based Access**: Admin and user roles with different permission levels
- **Password Security**: bcrypt hashing for secure password storage
- **Protected Routes**: Middleware-based route protection on both frontend and backend

## Build & Development
- **Development**: Concurrent frontend (Vite) and backend (tsx) development servers
- **Production**: Bundled frontend served as static files, Node.js backend
- **TypeScript**: Full TypeScript support across the entire stack
- **Hot Reload**: Development environment with hot module replacement

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database service
- **Connection**: Configured via DATABASE_URL environment variable
- **Migrations**: Drizzle Kit for database schema management

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Special handling for Replit development environment
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Authentication
- **bcrypt**: Password hashing library
- **jsonwebtoken**: JWT token generation and verification

## State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation