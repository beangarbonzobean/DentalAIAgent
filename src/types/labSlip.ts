/**
 * Lab Slip Type Definitions
 * Shared types for lab slip operations across Day 3 and Day 4 modules
 */

// Lab slip information for AI commands and integrations
export interface LabSlipInfo {
  labSlipId: string;
  patientName: string;
  patientId?: number;
  toothNumber: string;
  procedureDate: Date;
  provider: string;
  crownType: string;
  shade?: string;
  status?: string;
  pdfPath?: string;
}

// AI Command types
export type CommandIntent = 
  | 'create_lab_slip'
  | 'list_lab_slips'
  | 'get_status'
  | 'update_status'
  | 'resend_email'
  | 'unknown';

export interface ParsedCommand {
  intent: CommandIntent;
  parameters: Record<string, any>;
  confidence: number;
  originalText: string;
}

export interface CommandExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

// Open Dental Document types
export interface OpenDentalDocument {
  patientId: number;
  fileName: string;
  description: string;
  category: string;
  dateCreated: Date;
  filePath?: string;
  documentId?: number;
}

export interface OpenDentalUploadResult {
  success: boolean;
  documentId?: number;
  message: string;
  error?: string;
}
