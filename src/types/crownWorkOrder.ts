/**
 * Crown Work Order Types
 * For internal Ceramill same-day crown workflow
 * Huntington Beach Dental Center
 * 
 * Day 3 - Task 1: Data Model Design
 */

// ============================================
// PRACTICE INFORMATION
// ============================================
export interface PracticeInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
}

// Default practice info
export const DEFAULT_PRACTICE_INFO: PracticeInfo = {
  name: 'Huntington Beach Dental Center',
  address: '17692 Beach Blvd STE 310',
  city: 'Huntington Beach',
  state: 'CA',
  zip: '92647',
  phone: '714-842-5035'
};

// ============================================
// PATIENT INFORMATION
// ============================================
export interface PatientInfo {
  id: number; // Open Dental PatNum
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age?: number;
  chartNumber?: string;
}

// ============================================
// PROCEDURE INFORMATION
// ============================================
export interface ProcedureInfo {
  id: number; // Open Dental ProcNum
  code: string; // D-code (D2740, D2750, D2751, D2752)
  description: string;
  toothNumber: string;
  surface?: string;
  appointmentId?: number;
  procedureDate: Date;
  provider: ProviderInfo;
  status: 'TP' | 'C' | 'EC' | 'EO' | 'R' | 'Cn'; // Open Dental ProcStatus
}

export interface ProviderInfo {
  id: number; // Open Dental ProvNum
  name: string;
  abbr?: string;
}

// ============================================
// CROWN SPECIFICATIONS
// ============================================
export interface CrownSpecs {
  material: CrownMaterial;
  shade: string; // Vita shade guide
  shadeSystem?: 'Vita Classical' | 'Vita 3D-Master' | 'Custom';
  prepType: PrepType;
  margin: MarginType;
  occlusion: OcclusionType;
  contacts: ContactsType;
  contour: ContourType;
}

export type CrownMaterial = 
  | 'Zirconia'
  | 'E-max'
  | 'Porcelain Fused to Metal'
  | 'Full Gold'
  | 'Porcelain'
  | 'Composite'
  | 'Other';

export type PrepType = 
  | 'Full Crown'
  | 'Onlay'
  | '3/4 Crown'
  | 'Veneer'
  | 'Other';

export type MarginType = 
  | 'Chamfer'
  | 'Shoulder'
  | 'Feather Edge'
  | 'Bevel'
  | 'Other';

export type OcclusionType = 
  | 'Heavy'
  | 'Normal'
  | 'Light'
  | 'Functional';

export type ContactsType = 
  | 'Heavy'
  | 'Normal'
  | 'Light';

export type ContourType = 
  | 'Full'
  | 'Reduced'
  | 'Anatomical';

// ============================================
// CERAMILL WORKFLOW
// ============================================
export interface CeramillWorkflow {
  scanType: 'Intraoral' | 'Model' | 'Impression';
  scannerUsed?: 'Medit i900' | 'Other';
  designSoftware: 'Ceramill Mind' | 'Other';
  millingMachine: 'Ceramill Motion 2' | 'Ceramill Motion 3' | 'Other';
  blockType?: string; // e.g., "Zirconia 98mm"
  blockShade?: string;
  sinteredSize?: string;
  estimatedMillTime?: number; // minutes
}

// Default Ceramill workflow
export const DEFAULT_CERAMILL_WORKFLOW: CeramillWorkflow = {
  scanType: 'Intraoral',
  scannerUsed: 'Medit i900',
  designSoftware: 'Ceramill Mind',
  millingMachine: 'Ceramill Motion 2'
};

// ============================================
// WORK ORDER STATUS
// ============================================
export type WorkOrderStatus = 
  | 'pending'      // Created, not started
  | 'scanned'      // Intraoral scan completed
  | 'designed'     // Crown designed in software
  | 'milling'      // Currently milling
  | 'sintering'    // Sintering (if zirconia)
  | 'finishing'    // Polishing, glazing, adjustments
  | 'qc'           // Quality control check
  | 'ready'        // Ready for seating
  | 'seated'       // Seated in patient's mouth
  | 'cancelled'    // Cancelled
  | 'on_hold';     // On hold

// ============================================
// MAIN WORK ORDER INTERFACE
// ============================================
export interface CrownWorkOrder {
  // Identifiers
  id: string; // UUID from Supabase
  workOrderNumber: string; // Human-readable (e.g., "CWO-20251026-001")
  
  // References
  openDentalPatientId: number;
  openDentalProcedureId: number;
  openDentalAppointmentId?: number;
  openDentalLabCaseId?: number;
  
  // Core Information
  practice: PracticeInfo;
  patient: PatientInfo;
  procedure: ProcedureInfo;
  crownSpecs: CrownSpecs;
  ceramillWorkflow: CeramillWorkflow;
  
  // Lab Assignment
  assignedTo: string; // "Lab Tech" or specific name
  
  // Instructions & Notes
  specialInstructions?: string;
  clinicalNotes?: string;
  labNotes?: string;
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  seatedAt?: Date;
  
  // Status Tracking
  status: WorkOrderStatus;
  statusHistory: StatusHistoryEntry[];
  
  // Files & Media
  scanFiles?: string[]; // URLs to STL files
  designFiles?: string[]; // URLs to design files
  photos?: string[]; // Pre/post photos
  pdfUrl?: string; // Generated PDF work order
  
  // Metadata
  priority: 'routine' | 'urgent' | 'asap';
  isRedo?: boolean;
  originalWorkOrderId?: string;
}

// ============================================
// STATUS HISTORY
// ============================================
export interface StatusHistoryEntry {
  status: WorkOrderStatus;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

// ============================================
// WORK ORDER DATA (for Supabase storage)
// ============================================
export interface WorkOrderData {
  practice: PracticeInfo;
  patient: PatientInfo;
  procedure: ProcedureInfo;
  crownSpecs: CrownSpecs;
  ceramillWorkflow: CeramillWorkflow;
  specialInstructions?: string;
  clinicalNotes?: string;
  labNotes?: string;
  priority: 'routine' | 'urgent' | 'asap';
  assignedTo: string;
}

// ============================================
// DATABASE RECORD (matches Supabase schema)
// ============================================
export interface CrownWorkOrderRecord {
  id: string;
  lab_id?: string; // NULL for internal
  template_id?: string;
  
  // Open Dental References
  opendental_patient_id: number;
  opendental_procedure_id: number;
  opendental_appointment_id?: number;
  opendental_lab_case_id?: number;
  
  // Patient Information
  patient_name: string;
  patient_dob: Date;
  
  // Procedure Information
  procedure_code: string;
  procedure_description: string;
  tooth_number: string;
  shade: string;
  
  // Work Order Details (JSONB)
  lab_slip_data: WorkOrderData;
  special_instructions?: string;
  
  // Status
  status: WorkOrderStatus;
  
  // Files
  pdf_url?: string;
  pdf_storage_path?: string;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  due_date?: Date;
  completed_at?: Date;
}

// ============================================
// CROWN PROCEDURE CODES
// ============================================
export const CROWN_PROCEDURE_CODES = {
  D2740: 'Crown - porcelain/ceramic substrate',
  D2750: 'Crown - porcelain fused to high noble metal',
  D2751: 'Crown - porcelain fused to predominantly base metal',
  D2752: 'Crown - porcelain fused to noble metal'
} as const;

export type CrownProcedureCode = keyof typeof CROWN_PROCEDURE_CODES;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a procedure code is a crown procedure
 */
export function isCrownProcedure(code: string): code is CrownProcedureCode {
  return code in CROWN_PROCEDURE_CODES;
}

/**
 * Get crown procedure description
 */
export function getCrownDescription(code: string): string {
  if (isCrownProcedure(code)) {
    return CROWN_PROCEDURE_CODES[code];
  }
  return 'Unknown procedure';
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: WorkOrderStatus): string {
  const labels: Record<WorkOrderStatus, string> = {
    pending: 'Pending',
    scanned: 'Scanned',
    designed: 'Designed',
    milling: 'Milling',
    sintering: 'Sintering',
    finishing: 'Finishing',
    qc: 'Quality Control',
    ready: 'Ready for Seating',
    seated: 'Seated',
    cancelled: 'Cancelled',
    on_hold: 'On Hold'
  };
  return labels[status];
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: WorkOrderStatus): string {
  const colors: Record<WorkOrderStatus, string> = {
    pending: '#FFA500',      // Orange
    scanned: '#4169E1',      // Royal Blue
    designed: '#9370DB',     // Medium Purple
    milling: '#FF6347',      // Tomato
    sintering: '#FF4500',    // Orange Red
    finishing: '#FFD700',    // Gold
    qc: '#20B2AA',          // Light Sea Green
    ready: '#32CD32',       // Lime Green
    seated: '#228B22',      // Forest Green
    cancelled: '#DC143C',   // Crimson
    on_hold: '#808080'      // Gray
  };
  return colors[status];
}

/**
 * Check if work order is in progress
 */
export function isInProgress(status: WorkOrderStatus): boolean {
  return ['scanned', 'designed', 'milling', 'sintering', 'finishing', 'qc'].includes(status);
}

/**
 * Check if work order is complete
 */
export function isComplete(status: WorkOrderStatus): boolean {
  return status === 'seated';
}

/**
 * Check if work order is actionable
 */
export function isActionable(status: WorkOrderStatus): boolean {
  return !['cancelled', 'seated'].includes(status);
}

/**
 * Generate work order number
 */
export function generateWorkOrderNumber(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CWO-${year}${month}${day}-${random}`;
}

/**
 * Calculate patient age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

