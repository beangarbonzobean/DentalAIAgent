# Crown Work Order System - Day 3 Integration

## Overview

The crown work order system has been successfully integrated into the Dental AI Agent API. This system manages internal crown production using the Ceramill workflow at Huntington Beach Dental Center.

## Database Setup Required

**⚠️ CRITICAL:** Before using the crown work order endpoints, you MUST update your Supabase database schema.

### Quick Setup (Recommended)

The database schema has been updated locally using `npm run db:push --force`. However, there's one critical step remaining:

**Update the Status Constraint in Supabase:**

1. Open your Supabase project at: https://supabase.com/dashboard/project/dpmwjmikdkcgjcmhdslc
2. Navigate to the **SQL Editor**
3. Copy and paste this SQL command:

```sql
-- Update status constraint to allow crown work order statuses
ALTER TABLE lab_slips DROP CONSTRAINT IF EXISTS lab_slips_status_check;
ALTER TABLE lab_slips ADD CONSTRAINT lab_slips_status_check CHECK (
  status IN (
    'draft', 'sent', 'received', 'completed', 'cancelled',
    'pending', 'scanned', 'designed', 'milling', 'sintering', 
    'finishing', 'qc', 'ready', 'seated', 'on_hold'
  )
);
```

4. Click "Run" to execute the SQL

This will allow both traditional lab slip statuses AND crown work order statuses.

### Alternative: Full Migration (If needed)

If you prefer to run the full migration that includes all changes:

1. Open your Supabase project at: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Open the migration file: `migrations/add_crown_work_order_fields.sql`
4. Copy and paste the entire SQL script into the Supabase SQL Editor
5. Click "Run" to execute the migration

**Note:** Most columns have already been added via `npm run db:push --force`, so the full migration is optional.

This migration will:
- Add new columns to the `lab_slips` table for crown work orders
- Update the status check constraint to allow crown work order statuses
- Create indexes for improved query performance
- Preserve all existing lab slip data

### What the Migration Does

The migration extends the existing `lab_slips` table to support both:
- **Traditional lab slips** (external lab work): statuses like `draft`, `sent`, `received`, `completed`
- **Crown work orders** (internal Ceramill workflow): statuses like `pending`, `scanned`, `designed`, `milling`, `sintering`, `finishing`, `qc`, `ready`, `seated`

New columns added:
- `opendental_patient_id`, `opendental_procedure_id` - References to Open Dental
- `patient_name`, `patient_dob` - Patient information
- `procedure_code`, `procedure_description`, `tooth_number` - Procedure details
- `lab_slip_data` - JSONB field containing full work order data
- `pdf_url`, `pdf_storage_path` - Generated PDF work order files
- Additional timestamps: `sent_at`, `completed_at`

## API Endpoints

### Base URL
All crown work order endpoints are under `/api/work-orders`

### 1. Create Work Order
```bash
POST /api/work-orders
```

**Request Body:**
```json
{
  "openDentalPatientId": 12345,
  "openDentalProcedureId": 67890,
  "openDentalAppointmentId": 11111,  // Optional
  "patient": {
    "id": 12345,
    "name": "John Smith",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1980-05-15"
  },
  "procedure": {
    "id": 67890,
    "code": "D2740",
    "description": "Crown - porcelain/ceramic substrate",
    "toothNumber": "14",
    "procedureDate": "2025-10-26",
    "provider": {
      "id": 1,
      "name": "Dr. Ben Young",
      "abbr": "BY"
    },
    "status": "C"
  },
  "crownSpecs": {
    "material": "Zirconia",
    "shade": "A2",
    "shadeSystem": "Vita Classical",
    "prepType": "Full Crown",
    "margin": "Chamfer",
    "occlusion": "Normal",
    "contacts": "Normal",
    "contour": "Anatomical"
  },
  "ceramillWorkflow": {
    "scanType": "Intraoral",
    "scannerUsed": "Medit i900",
    "designSoftware": "Ceramill Mind",
    "millingMachine": "Ceramill Motion 2"
  },
  "assignedTo": "Lab Tech",
  "priority": "routine",
  "specialInstructions": "Patient prefers lighter shade",
  "dueDate": "2025-10-27"  // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "workOrder": {
    "id": "uuid-here",
    "status": "pending",
    "patient_name": "John Smith",
    "procedure_code": "D2740",
    "tooth_number": "14",
    "shade": "A2",
    "created_at": "2025-10-26T20:30:17.694+00:00",
    ...
  }
}
```

### 2. Get Work Order by ID
```bash
GET /api/work-orders/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "workOrder": {
    "id": "uuid-here",
    "status": "pending",
    "patient_name": "John Smith",
    ...
  }
}
```

### 3. List Work Orders
```bash
GET /api/work-orders?status=pending&limit=50
```

**Query Parameters:**
- `status` - Filter by status (pending, scanned, designed, etc.)
- `assignedTo` - Filter by assigned lab tech
- `patientId` - Filter by Open Dental patient ID
- `procedureId` - Filter by Open Dental procedure ID
- `priority` - Filter by priority (routine, urgent, asap)
- `limit` - Maximum number of results (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "workOrders": [...],
  "count": 1
}
```

### 4. Update Work Order Status
```bash
PATCH /api/work-orders/:id/status
```

**Request Body:**
```json
{
  "status": "scanned",
  "notes": "Intraoral scan completed with Medit i900"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "workOrder": {
    "id": "uuid-here",
    "status": "scanned",
    "updated_at": "2025-10-26T20:35:00.000+00:00",
    ...
  }
}
```

### 5. Generate PDF Work Order
```bash
POST /api/work-orders/:id/pdf
```

This endpoint generates a professional HTML work order document and saves it to the `output` directory.

**Response (200 OK):**
```json
{
  "success": true,
  "pdfPath": "./output/work-order-uuid-here.html",
  "metadata": {
    "workOrderNumber": "CWO-f573329e",
    "generatedAt": "2025-10-26T20:32:00.062Z"
  }
}
```

### 6. Get Work Order Statistics
```bash
GET /api/work-orders/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "byStatus": {
      "pending": 2,
      "scanned": 3,
      "milling": 2,
      "ready": 3
    },
    "byPriority": {
      "routine": 8,
      "urgent": 2
    }
  }
}
```

### 7. Delete Work Order
```bash
DELETE /api/work-orders/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Work order deleted successfully"
}
```

## Crown Work Order Workflow

The system supports the complete internal crown production workflow:

1. **pending** - Work order created, waiting to start
2. **scanned** - Intraoral scan completed
3. **designed** - Crown designed in Ceramill Mind
4. **milling** - Crown being milled in Ceramill Motion 2
5. **sintering** - Zirconia sintering (if applicable)
6. **finishing** - Polishing, glazing, adjustments
7. **qc** - Quality control check
8. **ready** - Ready for patient seating
9. **seated** - Crown seated in patient's mouth
10. **on_hold** - Work paused
11. **cancelled** - Work order cancelled

## Crown Procedure Codes

The system recognizes these crown procedure codes:
- `D2740` - Crown - porcelain/ceramic substrate
- `D2750` - Crown - porcelain fused to high noble metal
- `D2751` - Crown - porcelain fused to predominantly base metal
- `D2752` - Crown - porcelain fused to noble metal

## Crown Materials

Supported crown materials:
- Zirconia
- E-max
- Porcelain Fused to Metal
- Full Gold
- Porcelain
- Composite
- Other (with notes)

## Testing the System

### Quick Test
```bash
# 1. Create a test work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -d '{
    "openDentalPatientId": 12345,
    "openDentalProcedureId": 67890,
    "patient": {
      "id": 12345,
      "name": "Test Patient",
      "firstName": "Test",
      "lastName": "Patient",
      "dateOfBirth": "1980-01-01"
    },
    "procedure": {
      "id": 67890,
      "code": "D2740",
      "description": "Crown - porcelain/ceramic substrate",
      "toothNumber": "14",
      "procedureDate": "2025-10-26",
      "provider": {
        "id": 1,
        "name": "Dr. Ben Young",
        "abbr": "BY"
      },
      "status": "C"
    },
    "assignedTo": "Lab Tech",
    "priority": "routine"
  }'

# 2. List all work orders
curl http://localhost:5000/api/work-orders

# 3. Generate PDF (replace {id} with actual work order ID)
curl -X POST http://localhost:5000/api/work-orders/{id}/pdf

# 4. Update status
curl -X PATCH http://localhost:5000/api/work-orders/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "scanned", "notes": "Scan completed"}'
```

## File Structure

```
src/
├── api/
│   └── crownWorkOrderRoutes.ts    # Express routes
├── database/
│   └── workOrderQueries.ts        # Supabase queries
├── services/
│   ├── crownDetection.ts          # Crown procedure detection
│   └── pdfGenerator.ts            # PDF work order generation
└── types/
    └── crownWorkOrder.ts          # TypeScript types

output/                            # Generated PDF work orders
migrations/
└── add_crown_work_order_fields.sql # Database migration
```

## Next Steps

1. ✅ Run the database migration in Supabase Studio
2. Test the API endpoints with your Open Dental data
3. Integrate with your existing workflows
4. Customize the PDF template if needed
5. Set up automated triggers (e.g., auto-create work orders for crown procedures)

## Support

For questions or issues with the crown work order system:
- Check the server logs for detailed error messages
- Verify the database migration was applied correctly
- Ensure Supabase credentials are configured in environment variables
- Contact: ben.m.youngdds@gmail.com
