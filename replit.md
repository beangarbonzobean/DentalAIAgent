# Dental AI Agent API

## Overview

This is a production-ready TypeScript Express API server for a Dental AI Agent system. The application integrates with multiple external services to provide AI-powered dental practice management capabilities. The backend exposes RESTful JSON endpoints for managing patient data, lab slips, automations, and AI-powered chat interactions.

The system is designed to bridge dental practice management software (Open Dental) with modern AI capabilities (Anthropic Claude and Google Gemini), while maintaining persistent data in Supabase PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Framework & Runtime**
- Express.js with TypeScript running on Node.js 18+
- ESM module system throughout
- Centralized error handling and logging with Winston
- Security hardening via Helmet and CORS middleware

**API Structure**
The API follows RESTful conventions with all endpoints prefixed under `/api`:
- `/api/health` - Health checks for API and connected services
- `/api/agent/chat` - AI-powered conversational interface using Claude/Gemini
- `/api/automation` - CRUD operations for automation records
- `/api/labslip` - Lab slip management endpoints

**Authentication & Security**
- Helmet.js for security headers
- CORS configured for cross-origin requests
- Service-level authentication for external APIs (Open Dental, Supabase)
- API keys managed via environment variables

**Error Handling**
- Centralized error handling middleware
- Winston logger with custom log levels (critical, error, warning, info, debug)
- Colored console output for development
- Structured JSON logging for production

### Data Storage

**Primary Database: Supabase (PostgreSQL)**
- Managed PostgreSQL database via Supabase
- Service role key authentication for server-side operations
- Schema managed with Drizzle ORM
- Tables include: `automations`, `lab_slips`, and `users`

**Graceful Degradation**
The application handles missing Supabase credentials gracefully:
- Logs warnings when database is not configured
- Returns 503 status codes with helpful messages
- Allows core API functionality to remain operational

**Schema Management**
- Drizzle Kit for migrations (stored in `/migrations`)
- Schema definitions in `shared/schema.ts`
- Type-safe database operations with Drizzle ORM

### External Dependencies

**Open Dental FHIR API**
- Integration for dental practice management data
- Custom Axios client with retry logic (3 retries, exponential backoff)
- FHIR R4 compliant resource types (Patient, Procedure, Appointment, LabCase)
- Request/response interceptors for logging
- Comprehensive service layer for CRUD operations

**Anthropic Claude API**
- Primary AI model: `claude-sonnet-4-20250514`
- Used for natural language processing and dental-related queries
- Conversation history management for context-aware responses
- Fallback handling when API key not configured

**Google Gemini API**
- Alternative AI provider using `gemini-2.5-flash` model
- Provides additional AI capabilities
- Optional integration alongside Claude

**AI Client Architecture**
- Unified AI client supporting both Anthropic and Google
- Conversation memory stored in-memory (production should use database)
- Structured message format with role-based conversation history
- Error handling for missing API keys with graceful degradation

### Frontend Architecture

**React + Vite SPA**
- React 18 with TypeScript
- Vite for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query for server state management

**UI Framework**
- Shadcn/ui component library (New York style)
- Radix UI primitives for accessibility
- Tailwind CSS for styling with custom design tokens
- Dark mode support via CSS variables

**Design System**
- Custom color scheme with HSL-based theming
- Responsive breakpoints and mobile-first design
- Consistent spacing and typography scales
- Hover and active state elevation effects

**Client-Server Communication**
- RESTful API calls to Express backend
- JSON request/response format
- Centralized API client with error handling
- Query invalidation and caching strategies

### Development & Deployment

**Build Process**
- TypeScript compilation with `tsc` for type checking
- Vite for frontend bundle optimization
- ESBuild for backend bundling
- Separate `dev`, `build`, and `start` scripts

**Environment Configuration**
- `.env` files for local development
- Replit Secrets for production credentials
- Required environment variables:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENDENTAL_API_URL`, `OPENDENTAL_DEVELOPER_KEY`, `OPENDENTAL_CUSTOMER_KEY`
  - `ANTHROPIC_API_KEY` and `GEMINI_API_KEY`
  - `PORT` and `NODE_ENV`

**Monorepo Structure**
- `/client` - React frontend application
- `/server` - Express server bootstrap and route definitions
- `/src` - Main API implementation (handlers, integrations, utilities)
- `/shared` - Shared TypeScript types and database schema
- `/migrations` - Drizzle database migrations

**Development Tools**
- Hot module replacement in development
- Morgan HTTP request logging
- TypeScript path aliases for clean imports
- Replit-specific plugins for enhanced development experience