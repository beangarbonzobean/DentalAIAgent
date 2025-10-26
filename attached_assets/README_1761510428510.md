# Day 3: Internal Crown Work Order System

**Huntington Beach Dental Center - Dental AI Agent Development**

## 🎯 Overview

This module implements the **internal crown work order system** for Ceramill same-day crown production. It automatically detects crown procedures, generates professional work order PDFs, and tracks the complete workflow from scan to seating.

## ✅ What's Included

### **1. TypeScript Interfaces** (`src/types/crownWorkOrder.ts`)
- Complete type definitions for crown work orders
- Patient, procedure, and crown specification interfaces
- Ceramill workflow types
- Status tracking and history
- Helper functions for validation and formatting

### **2. Crown Detection Service** (`src/services/crownDetection.ts`)
- Automatic detection of crown procedures (D2740, D2750, D2751, D2752)
- Material recommendations based on procedure code
- Shade extraction from clinical notes
- Priority determination (routine, urgent, ASAP)
- Data validation

### **3. PDF Generator** (`src/services/pdfGenerator.ts`)
- Professional HTML-based work order generation
- Responsive design with print-friendly layout
- Customizable templates
- Practice branding (Huntington Beach Dental Center)
- Status badges and priority indicators

### **4. Database Queries** (`src/database/workOrderQueries.ts`)
- Complete CRUD operations for Supabase
- Work order creation, retrieval, update, and deletion
- Filtering by status, patient, procedure, date, priority
- Statistics and reporting
- Duplicate prevention

### **5. API Routes** (`src/api/crownWorkOrderRoutes.ts`)
- RESTful Express endpoints
- POST `/api/work-orders` - Create work order
- GET `/api/work-orders/:id` - Get work order
- GET `/api/work-orders` - List with filters
- PATCH `/api/work-orders/:id/status` - Update status
- POST `/api/work-orders/:id/pdf` - Generate PDF
- GET `/api/work-orders/stats` - Get statistics
- DELETE `/api/work-orders/:id` - Delete work order

### **6. Mock Data & Tests** (`mocks/` & `tests/`)
- Sample patients, procedures, and work orders
- Comprehensive end-to-end tests
- Crown detection validation
- PDF generation verification

---

## 📦 Installation

### **1. Copy Files to Your Replit Project**

```bash
# In your Replit project, create the necessary directories
mkdir -p src/types src/services src/database src/api

# Copy the files:
# - src/types/crownWorkOrder.ts → /src/types/
# - src/services/crownDetection.ts → /src/services/
# - src/services/pdfGenerator.ts → /src/services/
# - src/database/workOrderQueries.ts → /src/database/
# - src/api/crownWorkOrderRoutes.ts → /src/api/
```

### **2. Install Dependencies** (if not already installed)

```bash
npm install @supabase/supabase-js express
npm install --save-dev @types/express @types/node tsx typescript
```

### **3. Update Your Main Server File**

Add the crown work order routes to your Express server:

```typescript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import createCrownWorkOrderRoutes from './src/api/crownWorkOrderRoutes.js';

const app = express();
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Add crown work order routes
const crownRoutes = createCrownWorkOrderRoutes(supabase, './output/work-orders');
app.use('/api', crownRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🚀 Usage

### **Creating a Work Order**

```typescript
import { CrownDetectionService } from './src/services/crownDetection.js';
import { WorkOrderQueries } from './src/database/workOrderQueries.js';
import { DEFAULT_PRACTICE_INFO, DEFAULT_CERAMILL_WORKFLOW } from './src/types/crownWorkOrder.js';

// Initialize services
const detection = new CrownDetectionService();
const queries = new WorkOrderQueries(supabase);

// Detect if procedure is a crown
const detectionResult = detection.detectCrownProcedure('D2740');

if (detectionResult.isCrown) {
  // Create work order
  const { data, error } = await queries.createWorkOrder({
    openDentalPatientId: 1001,
    openDentalProcedureId: 5001,
    patientName: 'John Smith',
    patientDob: new Date('1975-03-15'),
    procedureCode: 'D2740',
    procedureDescription: 'Crown - porcelain/ceramic substrate',
    toothNumber: '14',
    shade: 'A2',
    workOrderData: {
      practice: DEFAULT_PRACTICE_INFO,
      patient: patientInfo,
      procedure: procedureInfo,
      crownSpecs: detection.getDefaultCrownSpecs('D2740', 'A2'),
      ceramillWorkflow: DEFAULT_CERAMILL_WORKFLOW,
      assignedTo: 'Lab Tech',
      priority: 'routine'
    },
    specialInstructions: 'Please ensure proper occlusion',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  });
  
  console.log('Work order created:', data);
}
```

### **Generating a PDF**

```typescript
import { PDFGenerator } from './src/services/pdfGenerator.js';

const pdfGenerator = new PDFGenerator();

// Get work order from database
const { data: workOrder } = await queries.getWorkOrderById('work-order-id');

// Generate PDF
const result = await pdfGenerator.generatePDF(
  workOrder,
  './output/work-order-001.html'
);

if (result.success) {
  console.log('PDF generated:', result.filePath);
}
```

### **API Usage Examples**

#### Create Work Order
```bash
curl -X POST http://localhost:3000/api/work-orders \
  -H "Content-Type: application/json" \
  -d '{
    "openDentalPatientId": 1001,
    "openDentalProcedureId": 5001,
    "patient": {
      "id": 1001,
      "name": "John Smith",
      "firstName": "John",
      "lastName": "Smith",
      "dateOfBirth": "1975-03-15"
    },
    "procedure": {
      "id": 5001,
      "code": "D2740",
      "description": "Crown - porcelain/ceramic substrate",
      "toothNumber": "14",
      "procedureDate": "2025-10-26",
      "provider": {
        "id": 1,
        "name": "Dr. Ben Young"
      },
      "status": "C"
    },
    "crownSpecs": {
      "material": "Zirconia",
      "shade": "A2",
      "prepType": "Full Crown",
      "margin": "Chamfer",
      "occlusion": "Normal",
      "contacts": "Normal",
      "contour": "Anatomical"
    },
    "specialInstructions": "Rush case",
    "priority": "asap",
    "assignedTo": "Lab Tech"
  }'
```

#### List Work Orders
```bash
curl http://localhost:3000/api/work-orders?status=pending&limit=10
```

#### Update Status
```bash
curl -X PATCH http://localhost:3000/api/work-orders/{id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scanned",
    "notes": "Intraoral scan completed with Medit i900"
  }'
```

#### Generate PDF
```bash
curl -X POST http://localhost:3000/api/work-orders/{id}/pdf
```

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

This will:
- ✅ Test crown detection for all D-codes
- ✅ Validate helper functions
- ✅ Test shade extraction from notes
- ✅ Validate data integrity
- ✅ Generate sample PDF work orders
- ✅ Run complete end-to-end workflow

**Sample PDFs Generated:**
- `output/work-order-sample-001.html` - ASAP priority case
- `output/work-order-sample-002.html` - Routine case (scanned status)
- `output/work-order-sample-003.html` - Urgent case (milling status)

---

## 📊 Database Schema

The system uses the `lab_slips` table in Supabase:

```sql
CREATE TABLE lab_slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id UUID REFERENCES labs(id), -- NULL for internal
  template_id UUID REFERENCES lab_slip_templates(id),
  
  -- Open Dental References
  opendental_patient_id INTEGER NOT NULL,
  opendental_procedure_id INTEGER NOT NULL,
  opendental_appointment_id INTEGER,
  opendental_lab_case_id INTEGER,
  
  -- Patient Information
  patient_name TEXT NOT NULL,
  patient_dob DATE NOT NULL,
  
  -- Procedure Information
  procedure_code TEXT NOT NULL,
  procedure_description TEXT NOT NULL,
  tooth_number TEXT NOT NULL,
  shade TEXT NOT NULL,
  
  -- Work Order Details (JSONB)
  lab_slip_data JSONB NOT NULL,
  special_instructions TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Files
  pdf_url TEXT,
  pdf_storage_path TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

---

## 🔄 Workflow States

The work order progresses through these statuses:

1. **pending** - Created, not started
2. **scanned** - Intraoral scan completed
3. **designed** - Crown designed in Ceramill Mind
4. **milling** - Currently milling
5. **sintering** - Sintering (if zirconia)
6. **finishing** - Polishing, glazing, adjustments
7. **qc** - Quality control check
8. **ready** - Ready for seating
9. **seated** - Seated in patient's mouth (complete)
10. **cancelled** - Cancelled
11. **on_hold** - On hold

---

## 🎨 Customization

### **Change Practice Information**

Edit `DEFAULT_PRACTICE_INFO` in `src/types/crownWorkOrder.ts`:

```typescript
export const DEFAULT_PRACTICE_INFO: PracticeInfo = {
  name: 'Your Practice Name',
  address: 'Your Address',
  city: 'Your City',
  state: 'ST',
  zip: '12345',
  phone: '555-1234',
  email: 'info@yourpractice.com'
};
```

### **Customize PDF Styling**

Modify the CSS in `src/services/pdfGenerator.ts` within the `generateHTML()` method.

### **Add More Crown Procedure Codes**

Update `CROWN_PROCEDURE_CODES` in `src/types/crownWorkOrder.ts`:

```typescript
export const CROWN_PROCEDURE_CODES = {
  D2740: 'Crown - porcelain/ceramic substrate',
  D2750: 'Crown - porcelain fused to high noble metal',
  D2751: 'Crown - porcelain fused to predominantly base metal',
  D2752: 'Crown - porcelain fused to noble metal',
  D2790: 'Crown - full cast high noble metal', // Add custom codes
} as const;
```

---

## 🔐 Environment Variables

Required in Replit Secrets:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional (for future Open Dental integration):

```
OPENDENTAL_DEVELOPER_KEY=your-developer-key
OPENDENTAL_CUSTOMER_KEY=your-customer-key
```

---

## 📝 Next Steps (Day 4+)

1. **Connect to Open Dental API** - Automatically detect crown procedures from Open Dental
2. **Add webhook integration** - Trigger work order creation on procedure completion
3. **Implement status tracking** - Update work order status from lab workflow
4. **Add email notifications** - Notify lab tech when new work orders are created
5. **Build dashboard UI** - Visual interface for managing work orders
6. **Add file attachments** - Store STL files, design files, and photos

---

## 🐛 Troubleshooting

### **TypeScript Errors**

Make sure you have the correct module resolution in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### **Supabase Connection Errors**

Verify your environment variables are set correctly in Replit Secrets.

### **PDF Generation Issues**

The current implementation generates HTML files. To convert to PDF, install a library like `puppeteer` or `wkhtmltopdf`.

---

## 📚 Documentation

- **Type Definitions**: See `src/types/crownWorkOrder.ts` for complete interfaces
- **API Documentation**: See `src/api/crownWorkOrderRoutes.ts` for endpoint details
- **Database Schema**: See `supabase_schema.sql` in project root

---

## ✅ Day 3 Completion Checklist

- [x] TypeScript interfaces designed
- [x] Crown detection logic implemented
- [x] PDF generator created
- [x] Database queries written
- [x] API endpoints built
- [x] Mock data created
- [x] End-to-end tests passing
- [x] Sample PDFs generated
- [x] Documentation complete

---

## 🎉 Success!

You now have a complete internal crown work order system ready to integrate with your Replit project. The system can:

✅ Automatically detect crown procedures  
✅ Generate professional work order PDFs  
✅ Track workflow from scan to seating  
✅ Store all data in Supabase  
✅ Provide RESTful API access  

**Ready for Day 4: Lab Slip Automation & Email Integration!**

---

**Questions?** Contact: Dr. Ben Young | Huntington Beach Dental Center

