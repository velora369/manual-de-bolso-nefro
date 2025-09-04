# Interactive Medical Manual - Transplant Protocol

## Overview

This is a React-based interactive medical infographic application designed for healthcare professionals to quickly reference transplant protocols. The app features a clean, modern UI with mobile-first responsive design, organized into collapsible sections covering the complete transplant process from pre-operative care through discharge and legal requirements.

The application displays medical protocols in an easily scannable format with interactive tables, search functionality, and PDF export capabilities. It's specifically tailored for transplant medicine with detailed medication dosing, contraindications, and step-by-step procedures.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA** with TypeScript for type safety and better development experience
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for lightweight client-side routing (single page with 404 fallback)
- **Mobile-first responsive design** using Tailwind CSS with custom medical color palette
- **Component-based architecture** with reusable medical components (MedicalSection, MedicalTable, etc.)

### UI Component System
- **shadcn/ui** component library built on Radix UI primitives for accessibility
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **Custom medical color scheme**: Primary green (#779d86), light gray (#e6e8e7), white backgrounds
- **Lucide React** icons for consistent iconography

### State Management
- **React hooks** for local component state management
- **TanStack Query** for server state management and caching (prepared for future API integration)
- **Local storage** patterns for user preferences and expanded section states

### Data Layer
- **PostgreSQL** database configured with Drizzle ORM for type-safe database operations
- **Neon Database** serverless PostgreSQL for cloud deployment
- **Database schema** with user management structure (currently minimal, extensible for medical data)
- **In-memory storage** fallback for development and testing

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **Session-based architecture** ready for user authentication
- **Modular route structure** with dedicated storage interface
- **Development/production environment** configuration with proper error handling

### Key Features
- **Collapsible sections** for better information organization and mobile experience
- **Interactive data tables** with CSV export functionality for medical data
- **Search functionality** to quickly locate medical terms and protocols
- **PDF generation** using jsPDF for printable reference materials
- **Responsive design** optimized for mobile devices used in clinical settings

### Development Workflow
- **TypeScript** throughout the stack for type safety
- **ESM modules** for modern JavaScript standards
- **Hot module replacement** in development for rapid iteration
- **Build optimization** with separate client and server bundling

### External Dependencies

- **@neondatabase/serverless** - Serverless PostgreSQL database connection
- **drizzle-orm** & **drizzle-kit** - Type-safe ORM for database operations
- **@tanstack/react-query** - Server state management and caching
- **@radix-ui/react-** - Accessible UI component primitives
- **tailwindcss** - Utility-first CSS framework
- **react-hook-form** - Form validation and management
- **jspdf** - PDF generation for printable medical references
- **date-fns** - Date manipulation utilities for medical scheduling
- **wouter** - Lightweight client-side routing
- **lucide-react** - Icon library for medical interface elements

The application is designed to be easily extensible with additional medical protocols and can integrate with hospital systems through its prepared API structure.