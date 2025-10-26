# Design Guidelines - Not Applicable

## Project Type: Backend API Server

This project is a **backend-only TypeScript Express API server** with no frontend user interface. The specifications provided detail:

- REST API endpoints and routes
- Database integration (Supabase PostgreSQL)
- External API integrations (Open Dental FHIR, Anthropic Claude, Google Gemini)
- Server architecture and error handling
- TypeScript type definitions and interfaces

## No Visual Design Required

Since this is purely a backend service that:
- Exposes JSON REST API endpoints
- Processes HTTP requests and returns JSON responses
- Integrates with external services
- Manages database operations

**Visual design guidelines (typography, layout, colors, components, spacing) are not applicable.**

## API Design Principles (If Helpful)

If you're planning to build a frontend dashboard or UI to interact with this API later, that would be a separate project requiring its own design guidelines. 

For the current backend implementation:
- Follow RESTful conventions (already specified)
- Use proper HTTP status codes (already specified)
- Return consistent JSON response structures (already specified)
- Implement comprehensive error handling (already specified)

## Next Steps

Proceed with implementing the backend API according to the detailed technical specifications provided. If you later need to create a frontend interface (admin dashboard, agent chat UI, lab slip management interface, etc.), we can generate appropriate design guidelines for that separate frontend project.