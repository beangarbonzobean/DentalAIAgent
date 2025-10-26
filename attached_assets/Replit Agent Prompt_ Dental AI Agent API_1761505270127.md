# Replit Agent Prompt: Dental AI Agent API

Build a production-ready TypeScript Express API server for a Dental AI Agent system that integrates with Supabase, Open Dental API, and AI services (Anthropic Claude and Google Gemini).

## Project Requirements

### Core Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **External APIs**: 
  - Open Dental FHIR API
  - Anthropic Claude API
  - Google Gemini API
- **Logging**: Winston
- **Security**: Helmet, CORS

### Project Structure

Create the following directory structure:

```
src/
├── index.ts                          # Main Express server
├── api/                              # API route handlers
│   ├── health.ts                    # Health check endpoint
│   ├── agent.ts                     # AI agent chat endpoint
│   ├── automation.ts                # Automation management
│   └── labslip.ts                   # Lab slip endpoints
├── integrations/
│   ├── opendental/
│   │   ├── client.ts                # Open Dental API client with retry logic
│   │   ├── types.ts                 # TypeScript interfaces for FHIR resources
│   │   └── services.ts              # Service methods for patients, procedures, etc.
│   └── ai-client.ts                 # Anthropic & Google AI client
├── database/
│   └── supabase.ts                  # Supabase client initialization
└── utils/
    └── logger.ts                    # Winston logger configuration
```

### Required Dependencies

**Production:**
- express
- @types/express
- typescript
- ts-node
- dotenv
- cors
- @types/cors
- helmet
- morgan
- winston
- @supabase/supabase-js
- @anthropic-ai/sdk
- @google/generative-ai
- axios
- zod (for validation)
- pdfkit (for PDF generation)
- nodemailer (for email)

**Development:**
- @types/node
- @types/morgan

### Environment Variables

The app should read these from Replit Secrets:

```typescript
SUPABASE_URL=<will be provided>
SUPABASE_SERVICE_ROLE_KEY=<will be provided>
ANTHROPIC_API_KEY=<will be provided>
GOOGLE_API_KEY=<will be provided>
OPENDENTAL_API_URL=https://api.opendental.com/api/v1
OPENDENTAL_DEVELOPER_KEY=<will be provided>
OPENDENTAL_CUSTOMER_KEY=<will be provided>
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Main Server (src/index.ts)

Create an Express server with:
- Helmet for security headers
- CORS enabled
- JSON body parsing
- Morgan for HTTP request logging (pipe to Winston)
- Error handling middleware
- Routes mounted at:
  - `/api/health` - Health check
  - `/api/agent` - AI agent endpoints
  - `/api/automation` - Automation management
  - `/api/labslip` - Lab slip endpoints
- Root endpoint `/` returning API info JSON

### Health Check Endpoint (src/api/health.ts)

```typescript
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-10-26T...",
  "services": {
    "api": "up",
    "database": "up",
    "openDental": "not_tested"
  }
}
```

Test Supabase connection and return status.

### AI Agent Endpoint (src/api/agent.ts)

```typescript
POST /api/agent/chat

Request:
{
  "message": "Create a lab slip for patient 12345",
  "conversationId": "optional-uuid"
}

Response:
{
  "response": "I'll create a lab slip...",
  "conversationId": "uuid",
  "intent": "create_lab_slip",
  "confidence": 0.95
}
```

Use Anthropic Claude API to process natural language requests.

### Automation Endpoints (src/api/automation.ts)

```typescript
GET /api/automation
POST /api/automation
PUT /api/automation/:id
DELETE /api/automation/:id
```

Basic CRUD for automation records (store in Supabase).

### Lab Slip Endpoints (src/api/labslip.ts)

```typescript
GET /api/labslip
POST /api/labslip
GET /api/labslip/:id
```

Manage lab slip records (store in Supabase).

### Winston Logger (src/utils/logger.ts)

Configure Winston with:
- Console transport with colorized output
- Log levels: debug, info, warning, error, critical
- Timestamp in ISO format
- Pretty-print for development
- Configurable log level from `LOG_LEVEL` env var

### Supabase Client (src/database/supabase.ts)

Initialize Supabase client with:
- URL from `SUPABASE_URL`
- Service role key from `SUPABASE_SERVICE_ROLE_KEY`
- Export initialized client
- Log successful initialization

### Open Dental Integration (src/integrations/opendental/)

#### client.ts
Create an Axios-based HTTP client with:
- Base URL from `OPENDENTAL_API_URL`
- Authentication headers with developer and customer keys
- Retry logic: 3 attempts with exponential backoff
- Request/response interceptors for logging
- Error handling for common HTTP status codes

#### types.ts
Define TypeScript interfaces for FHIR resources:
- Patient
- Procedure
- Appointment
- LabCase
- Laboratory
- Provider
- Document

#### services.ts
Export service object with methods:
- **Patients**: getPatient, searchPatients, createPatient, updatePatient
- **Procedures**: getProcedure, searchProcedures, getPatientProcedures, getCrownProcedures, createProcedure, updateProcedure
- **Appointments**: getAppointment, searchAppointments, createAppointment, updateAppointment
- **Lab Cases**: getLabCase, getPatientLabCases, createLabCase, updateLabCase
- **Laboratories**: getLaboratory, getAllLaboratories
- **Providers**: getProvider, getAllProviders
- **Documents**: getDocument, getPatientDocuments, createDocument, uploadDocument

### AI Client (src/integrations/ai-client.ts)

Initialize both:
- Anthropic SDK with API key
- Google Generative AI SDK with API key

Export functions:
- `chatWithClaude(message: string, conversationHistory?: any[])`
- `chatWithGemini(message: string, conversationHistory?: any[])`

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Error Handling

All endpoints should:
- Use try-catch blocks
- Log errors with Winston
- Return appropriate HTTP status codes
- Include error messages in development mode only

### Practice Information

Use these defaults when needed:
- Practice Name: Huntington Beach Dental Center
- Phone: 714-842-5035
- Email: ben.m.youngdds@gmail.com
- Address: 17692 Beach Blvd STE 310, Huntington Beach, CA 92647

### Success Criteria

The app should:
1. Start without errors when running `npm run dev`
2. Respond to `GET /` with API information
3. Respond to `GET /api/health` with health status
4. Successfully connect to Supabase (log confirmation)
5. Have all TypeScript types properly defined
6. Include comprehensive error handling
7. Log all important events with Winston
8. Be production-ready and well-structured

### Important Notes

- Use TypeScript strict mode
- All async functions should have proper error handling
- Log all API calls to external services
- Use environment variables for all configuration
- Follow RESTful API conventions
- Include JSDoc comments for all public functions
- Use proper HTTP status codes (200, 201, 400, 404, 500, etc.)

Build this entire application following these specifications exactly. Make it production-ready with clean, well-organized code.

