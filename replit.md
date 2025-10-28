# Dental AI Agent API

## Overview

This is a production-ready TypeScript Express API server for a Dental AI Agent system. The application integrates with multiple external services to provide AI-powered dental practice management capabilities. The backend exposes RESTful JSON endpoints for managing patient data, lab slips, automations, and AI-powered chat interactions.

The system is designed to bridge dental practice management software (Open Dental) with modern AI capabilities (Anthropic Claude and Google Gemini), while maintaining persistent data in Supabase PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Day 4 (October 28, 2025) - AI Commands & Open Dental Integration

**AI-Powered Natural Language Commands**
- Implemented AI command processing using Anthropic Claude 3.5 Sonnet
- Natural language interface for lab slip management via `/api/ai-agent/command`
- Supports commands like "Show me all pending lab slips", "What's the status of lab slip xyz?"
- Automatic intent recognition with confidence scoring
- Natural language response generation for user-friendly interactions

**Open Dental Document Integration**
- Created Open Dental document upload service for PDF lab slips
- FHIR-compliant DocumentReference API integration
- Automatic PDF upload to patient records in Open Dental
- Document management with categorization and metadata

**New Modules Added**:
- `src/services/aiCommands.ts` - AI command executor with Claude integration (420 LOC)
- `src/services/openDentalDocuments.ts` - Open Dental document client (370 LOC)
- `src/types/labSlip.ts` - Shared type definitions for Day 4 features
- `src/api/aiAgent.ts` - AI command API endpoint

### Day 3 (October 26, 2025) - Crown Work Order System

**Crown Work Order System Integration**
- Integrated internal crown work order management system for Ceramill same-day crown production
- Extended `lab_slips` table to support crown work orders alongside traditional lab slips
- Added crown procedure detection service (recognizes D2740, D2750, D2751, D2752)
- Implemented PDF work order generation service for printable lab documentation
- Created comprehensive REST API endpoints under `/api/work-orders`
- **Database Migration Required**: Run `migrations/add_crown_work_order_fields.sql` in Supabase Studio
- See `CROWN_WORK_ORDER_README.md` for complete documentation and API usage examples

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
- `/api/work-orders` - Crown work order management for internal Ceramill production (Day 3)
- `/api/ai-agent` - Natural language command processing with Claude (Day 4)

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
- Tables include: `automations`, `lab_slips` (extended for crown work orders), and `users`

**Graceful Degradation**
The application handles missing Supabase credentials gracefully:
- Logs warnings when database is not configured
- Returns 503 status codes with helpful messages
- Allows core API functionality to remain operational

**Schema Management**
- Drizzle Kit for migrations (stored in `/migrations`)
- Schema definitions in `shared/schema.ts`
- Type-safe database operations with Drizzle ORM
- **Day 3 Update**: The `lab_slips` table has been extended to support both traditional lab slips and internal crown work orders
  - New columns added for Open Dental integration, patient/procedure data, and crown specifications
  - Status constraint updated to support crown workflow statuses (pending → scanned → designed → milling → sintering → finishing → qc → ready → seated)
  - See `migrations/add_crown_work_order_fields.sql` for the full migration script
  - **IMPORTANT**: Run this migration in Supabase Studio before using crown work order features

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
- **Day 4**: AI command processing for lab slip operations via natural language
- Intent recognition, parameter extraction, and response generation
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
  - `/src/api` - Express route handlers
  - `/src/database` - Supabase query modules
  - `/src/services` - Business logic (crown detection, PDF generation)
  - `/src/types` - TypeScript type definitions
  - `/src/integrations` - External API clients (Open Dental, AI)
  - `/src/utils` - Logging and utilities
- `/shared` - Shared TypeScript types and database schema
- `/migrations` - Database migration scripts
- `/output` - Generated PDF work orders (crown work order system)

**Development Tools**
- Hot module replacement in development
- Morgan HTTP request logging
- TypeScript path aliases for clean imports
- Replit-specific plugins for enhanced development experience