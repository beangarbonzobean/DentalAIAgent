# Day 4: Lab Slip Automation (Part 2) - Backend Only

**Version:** Claude-Powered Backend  
**Date:** October 28, 2025

## Overview

This is the **backend-only version** of Day 4 deliverables, designed for your API-only Replit project. It includes three core modules that extend the Day 3 crown work order system with external integrations and AI-powered natural language commands.

## What's Included

### 1. Open Dental Document Integration (`openDentalDocuments.ts`)

Automatically uploads generated lab slip PDFs to the Open Dental document management system.

**Features:**
- API-based authentication (token or API key)
- Automatic PDF upload with proper categorization
- Document linking to patient records and procedures
- Error handling and retry logic
- Document retrieval and management

**Important:** Uses only the Open Dental API (no direct database writes) to ensure data integrity.

### 2. Email Automation Service (`emailService.ts`)

Sends professional lab slip emails with PDF attachments to lab technicians.

**Features:**
- Multi-provider support (SendGrid and SMTP)
- Professional HTML email templates with HBDC branding
- PDF attachment handling
- Plain text fallback for compatibility
- Email delivery verification
- Configurable sender information

### 3. AI Agent Commands (`aiCommands.ts`)

Enables natural language command processing using **Anthropic Claude** (not OpenAI).

**Features:**
- Natural language parsing with Claude 3.5 Sonnet
- Intent recognition for five command types
- Parameter extraction from user input
- Confidence scoring for command validation
- Natural language response generation

**Supported Commands:**
- "Create a lab slip for John Doe's crown on tooth 14"
- "Show me all pending lab slips"
- "What's the status of lab slip abc123?"
- "Mark lab slip xyz789 as completed"
- "Resend the email for patient 12345's lab slip"

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

(Other dependencies like `axios` and `nodemailer` are already in your project)

### 2. Configure Environment Variables

```env
# Open Dental
OPEN_DENTAL_API_URL=http://your-server:8080
OPEN_DENTAL_API_KEY=your_api_key

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_key
EMAIL_FROM=noreply@hbdc.com
LAB_TECH_EMAIL=labtech@hbdc.com

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Copy Files to Your Project

```bash
cp src/*.ts /path/to/your/replit/src/
cp -r src/types /path/to/your/replit/src/
```

### 4. Integrate with Your Lab Slip Service

See `INTEGRATION_GUIDE.md` for detailed integration instructions.

## File Structure

```
day-4-backend-only/
├── src/
│   ├── types/
│   │   └── labSlip.ts           # TypeScript type definitions
│   ├── aiCommands.ts            # AI command processing (Claude)
│   ├── emailService.ts          # Email automation
│   └── openDentalDocuments.ts   # Open Dental integration
├── docs/
│   └── (additional documentation)
├── tests/
│   └── (test files)
├── INTEGRATION_GUIDE.md         # Detailed integration steps
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Code Statistics

| Module                      | Lines of Code |
| --------------------------- | ------------- |
| Open Dental Integration     | 370           |
| Email Service               | 450           |
| AI Commands (Claude)        | 420           |
| Type Definitions            | 60            |
| **Total**                   | **1,300**     |

## Key Differences from Full Version

This backend-only version:

- ✅ Uses **Anthropic Claude** instead of OpenAI
- ✅ Includes **only backend modules** (no React/Next.js UI)
- ✅ Requires **only one new dependency** (`@anthropic-ai/sdk`)
- ✅ Integrates directly with your **existing API**

## Integration Flow

```
User/AI Command
    ↓
Lab Slip Service (Day 3)
    ↓
PDF Generator (Day 3)
    ↓
┌─────────────────────────────┐
│ Day 4 Backend Modules       │
├─────────────────────────────┤
│ 1. Upload PDF to Open Dental│
│ 2. Send Email with PDF      │
│ 3. Update Status to 'sent'  │
└─────────────────────────────┘
```

## Environment Variables

| Variable                 | Required | Description                          |
| ------------------------ | -------- | ------------------------------------ |
| `OPEN_DENTAL_API_URL`    | Yes      | Open Dental API endpoint             |
| `OPEN_DENTAL_API_KEY`    | Yes      | API key for authentication           |
| `EMAIL_PROVIDER`         | Yes      | `sendgrid` or `smtp`                 |
| `SENDGRID_API_KEY`       | If SG    | SendGrid API key                     |
| `SMTP_HOST`              | If SMTP  | SMTP server hostname                 |
| `SMTP_PORT`              | If SMTP  | SMTP server port                     |
| `SMTP_USER`              | If SMTP  | SMTP username                        |
| `SMTP_PASSWORD`          | If SMTP  | SMTP password                        |
| `EMAIL_FROM`             | Yes      | Sender email address                 |
| `EMAIL_FROM_NAME`        | No       | Sender display name                  |
| `LAB_TECH_EMAIL`         | Yes      | Lab technician email address         |
| `ANTHROPIC_API_KEY`      | Yes      | Anthropic API key for Claude         |

## Testing

### Test Open Dental Upload

```typescript
import { uploadLabSlipToOpenDental } from './openDentalDocuments';

const result = await uploadLabSlipToOpenDental(
  'test-123',
  12345,
  '/path/to/test.pdf'
);
console.log(result);
```

### Test Email Sending

```typescript
import { sendLabSlipEmailAuto } from './emailService';

const result = await sendLabSlipEmailAuto(
  'test@example.com',
  {
    labSlipId: 'test-123',
    patientName: 'Test Patient',
    toothNumber: '14',
    procedureDate: new Date(),
    provider: 'Dr. Test',
    crownType: 'Ceramill - Full Zirconia',
  },
  '/path/to/test.pdf'
);
console.log(result);
```

### Test AI Commands

```typescript
import { createAICommandExecutor } from './aiCommands';
import { labSlipService } from './services/labSlipService';

const executor = createAICommandExecutor(labSlipService);
const { result, response } = await executor.executeCommand(
  "Create a lab slip for John Doe's crown on tooth 14"
);
console.log(response);
```

## Success Criteria

- ✅ PDFs upload to Open Dental Documents
- ✅ Emails send with attachments to lab tech
- ✅ AI agent processes natural language commands using Claude
- ✅ All operations integrate with existing Day 3 code

## Troubleshooting

### Open Dental Connection Issues
- Verify API URL and credentials
- Check network connectivity
- Review Open Dental API logs

### Email Not Sending
- Verify email provider credentials
- Check SMTP settings
- Test with simple email first

### AI Commands Not Working
- Verify Anthropic API key
- Check API credits/limits
- Review command confidence scores

See `INTEGRATION_GUIDE.md` for detailed troubleshooting steps.

## Next Steps

After integrating Day 4 backend modules:

1. Test each module individually
2. Test complete lab slip creation flow
3. Verify all success criteria
4. Proceed to Day 5: Week 1 Integration & Testing

## Support

For detailed integration instructions, see `INTEGRATION_GUIDE.md`.

For questions or issues:
- Review inline code comments
- Check environment variables
- Test components individually
- Review error logs

---

**Prepared by:** Manus AI  
**Date:** October 28, 2025  
**Version:** Backend-Only with Claude

