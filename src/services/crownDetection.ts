/**
 * Crown Procedure Detection Service
 * Monitors Open Dental procedures and detects crown cases
 * 
 * Day 3 - Task 2: Procedure Detection Logic
 */

import {
  CROWN_PROCEDURE_CODES,
  CrownProcedureCode,
  isCrownProcedure,
  getCrownDescription,
  ProcedureInfo,
  PatientInfo,
  CrownSpecs,
  CrownMaterial,
  PrepType,
  MarginType,
  OcclusionType,
  ContactsType,
  ContourType
} from '../types/crownWorkOrder.js';

// ============================================
// DETECTION INTERFACES
// ============================================

export interface DetectionResult {
  isCrown: boolean;
  procedureCode?: CrownProcedureCode;
  description?: string;
  confidence: number; // 0-1
  recommendedMaterial?: CrownMaterial;
  notes?: string;
}

export interface ProcedureDetectionConfig {
  monitoredCodes: string[];
  autoCreateWorkOrder: boolean;
  requiresApproval: boolean;
  defaultPriority: 'routine' | 'urgent' | 'asap';
}

// ============================================
// DEFAULT CONFIGURATION
// ============================================

export const DEFAULT_DETECTION_CONFIG: ProcedureDetectionConfig = {
  monitoredCodes: Object.keys(CROWN_PROCEDURE_CODES),
  autoCreateWorkOrder: true,
  requiresApproval: false,
  defaultPriority: 'routine'
};

// ============================================
// CROWN DETECTION SERVICE
// ============================================

export class CrownDetectionService {
  private config: ProcedureDetectionConfig;

  constructor(config: ProcedureDetectionConfig = DEFAULT_DETECTION_CONFIG) {
    this.config = config;
  }

  /**
   * Detect if a procedure is a crown procedure
   */
  detectCrownProcedure(procedureCode: string): DetectionResult {
    // Clean and normalize the code
    const normalizedCode = procedureCode.trim().toUpperCase();

    // Check if it's a monitored crown code
    if (this.config.monitoredCodes.includes(normalizedCode) && isCrownProcedure(normalizedCode)) {
      const material = this.recommendMaterialForCode(normalizedCode as CrownProcedureCode);
      
      return {
        isCrown: true,
        procedureCode: normalizedCode as CrownProcedureCode,
        description: getCrownDescription(normalizedCode),
        confidence: 1.0,
        recommendedMaterial: material,
        notes: `Detected ${normalizedCode} - ${getCrownDescription(normalizedCode)}`
      };
    }

    // Not a crown procedure
    return {
      isCrown: false,
      confidence: 0,
      notes: `Procedure code ${procedureCode} is not a monitored crown procedure`
    };
  }

  /**
   * Recommend crown material based on procedure code
   */
  private recommendMaterialForCode(code: CrownProcedureCode): CrownMaterial {
    const materialMap: Record<CrownProcedureCode, CrownMaterial> = {
      D2740: 'Zirconia', // Porcelain/ceramic substrate - typically zirconia
      D2750: 'Porcelain Fused to Metal', // PFM high noble
      D2751: 'Porcelain Fused to Metal', // PFM base metal
      D2752: 'Porcelain Fused to Metal'  // PFM noble metal
    };
    return materialMap[code];
  }

  /**
   * Batch detect crown procedures from multiple procedures
   */
  detectCrownProcedures(procedures: Array<{ code: string; id: number }>): Array<{ id: number; detection: DetectionResult }> {
    return procedures.map(proc => ({
      id: proc.id,
      detection: this.detectCrownProcedure(proc.code)
    })).filter(result => result.detection.isCrown);
  }

  /**
   * Check if a procedure should trigger automatic work order creation
   */
  shouldAutoCreateWorkOrder(procedureCode: string, procedureStatus: string): boolean {
    const detection = this.detectCrownProcedure(procedureCode);
    
    if (!detection.isCrown) {
      return false;
    }

    if (!this.config.autoCreateWorkOrder) {
      return false;
    }

    // Only auto-create for completed procedures
    // Open Dental status: C = Complete, TP = Treatment Planned
    const autoCreateStatuses = ['C', 'EC']; // Complete, Existing Complete
    return autoCreateStatuses.includes(procedureStatus);
  }

  /**
   * Get default crown specifications based on procedure code
   */
  getDefaultCrownSpecs(procedureCode: string, shade: string = 'A2'): CrownSpecs {
    const detection = this.detectCrownProcedure(procedureCode);
    
    return {
      material: detection.recommendedMaterial || 'Zirconia',
      shade: shade,
      shadeSystem: 'Vita Classical',
      prepType: 'Full Crown',
      margin: 'Chamfer',
      occlusion: 'Normal',
      contacts: 'Normal',
      contour: 'Anatomical'
    };
  }

  /**
   * Extract shade information from procedure notes
   */
  extractShade(notes: string): string {
    // Common shade patterns
    const shadePatterns = [
      /shade[:\s]+([A-D]\d{1,2})/i,
      /([A-D]\d{1,2})\s+shade/i,
      /color[:\s]+([A-D]\d{1,2})/i,
      /\b([A-D]\d{1,2})\b/
    ];

    for (const pattern of shadePatterns) {
      const match = notes.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    // Default shade if not found
    return 'A2';
  }

  /**
   * Extract tooth number from procedure
   */
  extractToothNumber(toothNum: string | number): string {
    // Convert to string and clean
    const cleaned = String(toothNum).trim();
    
    // Validate tooth number (1-32 for permanent teeth)
    const num = parseInt(cleaned);
    if (num >= 1 && num <= 32) {
      return cleaned;
    }

    // Handle letter designations for primary teeth (A-T)
    if (/^[A-T]$/i.test(cleaned)) {
      return cleaned.toUpperCase();
    }

    return cleaned;
  }

  /**
   * Determine priority based on procedure and patient context
   */
  determinePriority(
    procedureDate: Date,
    appointmentDate?: Date,
    notes?: string
  ): 'routine' | 'urgent' | 'asap' {
    // Check for urgent keywords in notes
    if (notes) {
      const urgentKeywords = ['urgent', 'asap', 'rush', 'emergency', 'same day'];
      const notesLower = notes.toLowerCase();
      
      if (urgentKeywords.some(keyword => notesLower.includes(keyword))) {
        return 'asap';
      }
    }

    // Check if appointment is soon (within 3 days)
    if (appointmentDate) {
      const daysUntilAppointment = Math.ceil(
        (appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilAppointment <= 1) {
        return 'asap';
      } else if (daysUntilAppointment <= 3) {
        return 'urgent';
      }
    }

    return this.config.defaultPriority;
  }

  /**
   * Validate procedure data for work order creation
   */
  validateProcedureData(procedure: Partial<ProcedureInfo>, patient: Partial<PatientInfo>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate procedure
    if (!procedure.code) {
      errors.push('Procedure code is required');
    } else if (!isCrownProcedure(procedure.code)) {
      errors.push(`Procedure code ${procedure.code} is not a valid crown procedure`);
    }

    if (!procedure.toothNumber) {
      errors.push('Tooth number is required');
    }

    if (!procedure.id) {
      errors.push('Procedure ID is required');
    }

    // Validate patient
    if (!patient.id) {
      errors.push('Patient ID is required');
    }

    if (!patient.name && !(patient.firstName && patient.lastName)) {
      errors.push('Patient name is required');
    }

    if (!patient.dateOfBirth) {
      errors.push('Patient date of birth is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProcedureDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ProcedureDetectionConfig {
    return { ...this.config };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const crownDetectionService = new CrownDetectionService();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick check if procedure code is a crown
 */
export function isDetectedCrown(procedureCode: string): boolean {
  return crownDetectionService.detectCrownProcedure(procedureCode).isCrown;
}

/**
 * Get recommended material for procedure code
 */
export function getRecommendedMaterial(procedureCode: string): CrownMaterial | undefined {
  return crownDetectionService.detectCrownProcedure(procedureCode).recommendedMaterial;
}

/**
 * Extract shade from notes
 */
export function extractShadeFromNotes(notes: string): string {
  return crownDetectionService.extractShade(notes);
}

/**
 * Validate procedure for work order
 */
export function validateForWorkOrder(
  procedure: Partial<ProcedureInfo>,
  patient: Partial<PatientInfo>
): { isValid: boolean; errors: string[] } {
  return crownDetectionService.validateProcedureData(procedure, patient);
}

