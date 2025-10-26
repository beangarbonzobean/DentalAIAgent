/**
 * PDF Generator Service
 * Creates professional PDF work orders for internal crown production
 * 
 * Day 3 - Task 3: PDF Generator
 */

import {
  CrownWorkOrder,
  PracticeInfo,
  PatientInfo,
  ProcedureInfo,
  CrownSpecs,
  CeramillWorkflow,
  getStatusLabel,
  formatDate,
  formatDateTime,
  calculateAge
} from '../types/crownWorkOrder.js';

// ============================================
// PDF GENERATION INTERFACES
// ============================================

export interface PDFGenerationOptions {
  includeBarcode?: boolean;
  includeQRCode?: boolean;
  includeLogo?: boolean;
  logoPath?: string;
  fontSize?: number;
  pageSize?: 'letter' | 'a4';
}

export interface PDFGenerationResult {
  success: boolean;
  filePath?: string;
  error?: string;
  metadata?: {
    workOrderNumber: string;
    generatedAt: Date;
    fileSize?: number;
  };
}

// ============================================
// HTML TEMPLATE GENERATOR
// ============================================

export class PDFGenerator {
  private options: PDFGenerationOptions;

  constructor(options: PDFGenerationOptions = {}) {
    this.options = {
      includeBarcode: false,
      includeQRCode: false,
      includeLogo: false,
      fontSize: 12,
      pageSize: 'letter',
      ...options
    };
  }

  /**
   * Generate HTML template for work order
   */
  generateHTML(workOrder: CrownWorkOrder): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crown Work Order - ${workOrder.workOrderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: ${this.options.fontSize}px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #2c3e50;
      padding: 30px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #3498db;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .header .subtitle {
      color: #7f8c8d;
      font-size: 14px;
      font-style: italic;
    }
    
    .work-order-number {
      background: #3498db;
      color: white;
      padding: 10px 20px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      border-radius: 5px;
      letter-spacing: 1px;
    }
    
    .section {
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid #ecf0f1;
      border-radius: 5px;
      background: #f8f9fa;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #3498db;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .info-item {
      padding: 8px;
      background: white;
      border-radius: 3px;
    }
    
    .info-label {
      font-weight: bold;
      color: #7f8c8d;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      color: #2c3e50;
      font-size: 14px;
      font-weight: 500;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    
    .highlight-box {
      background: #fff3cd;
      border: 2px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    
    .highlight-box .label {
      font-weight: bold;
      color: #856404;
      font-size: 13px;
      margin-bottom: 5px;
    }
    
    .highlight-box .value {
      font-size: 18px;
      color: #856404;
      font-weight: bold;
    }
    
    .instructions {
      background: white;
      border-left: 4px solid #e74c3c;
      padding: 15px;
      margin: 15px 0;
      min-height: 80px;
    }
    
    .instructions-title {
      font-weight: bold;
      color: #e74c3c;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .instructions-content {
      color: #2c3e50;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
      font-size: 11px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .status-pending {
      background: #ffeaa7;
      color: #d63031;
    }
    
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .priority-routine {
      background: #dfe6e9;
      color: #2d3436;
    }
    
    .priority-urgent {
      background: #fdcb6e;
      color: #2d3436;
    }
    
    .priority-asap {
      background: #d63031;
      color: white;
    }
    
    .practice-info {
      text-align: center;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    
    .practice-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .practice-details {
      font-size: 11px;
      color: #7f8c8d;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .container {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${this.generatePracticeHeader(workOrder.practice)}
    ${this.generateWorkOrderHeader(workOrder)}
    ${this.generatePatientSection(workOrder.patient)}
    ${this.generateProcedureSection(workOrder.procedure)}
    ${this.generateCrownSpecsSection(workOrder.crownSpecs)}
    ${this.generateCeramillSection(workOrder.ceramillWorkflow)}
    ${this.generateInstructionsSection(workOrder)}
    ${this.generateFooter(workOrder)}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate practice header
   */
  private generatePracticeHeader(practice: PracticeInfo): string {
    return `
    <div class="practice-info">
      <div class="practice-name">${practice.name}</div>
      <div class="practice-details">
        ${practice.address}, ${practice.city}, ${practice.state} ${practice.zip}<br>
        Phone: ${practice.phone}${practice.email ? ` | Email: ${practice.email}` : ''}
      </div>
    </div>
    `;
  }

  /**
   * Generate work order header
   */
  private generateWorkOrderHeader(workOrder: CrownWorkOrder): string {
    const priorityClass = `priority-${workOrder.priority}`;
    const statusClass = `status-${workOrder.status}`;
    
    return `
    <div class="header">
      <h1>Internal Crown Work Order</h1>
      <div class="subtitle">Ceramill Same-Day Crown Production</div>
    </div>
    
    <div class="work-order-number">
      Work Order #${workOrder.workOrderNumber}
    </div>
    
    <div style="text-align: center; margin: 15px 0;">
      <span class="priority-badge ${priorityClass}">${workOrder.priority.toUpperCase()}</span>
      <span class="status-badge ${statusClass}">${getStatusLabel(workOrder.status)}</span>
    </div>
    
    <div class="info-grid" style="margin: 20px 0;">
      <div class="info-item">
        <div class="info-label">Assigned To</div>
        <div class="info-value">${workOrder.assignedTo}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Created</div>
        <div class="info-value">${formatDateTime(workOrder.createdAt)}</div>
      </div>
      ${workOrder.dueDate ? `
      <div class="info-item">
        <div class="info-label">Due Date</div>
        <div class="info-value" style="color: #e74c3c; font-weight: bold;">${formatDate(workOrder.dueDate)}</div>
      </div>
      ` : ''}
    </div>
    `;
  }

  /**
   * Generate patient section
   */
  private generatePatientSection(patient: PatientInfo): string {
    const age = patient.age || calculateAge(patient.dateOfBirth);
    
    return `
    <div class="section">
      <div class="section-title">Patient Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Patient Name</div>
          <div class="info-value">${patient.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Patient ID</div>
          <div class="info-value">#${patient.id}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-value">${formatDate(patient.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Age</div>
          <div class="info-value">${age} years</div>
        </div>
        ${patient.chartNumber ? `
        <div class="info-item">
          <div class="info-label">Chart Number</div>
          <div class="info-value">${patient.chartNumber}</div>
        </div>
        ` : ''}
      </div>
    </div>
    `;
  }

  /**
   * Generate procedure section
   */
  private generateProcedureSection(procedure: ProcedureInfo): string {
    return `
    <div class="section">
      <div class="section-title">Procedure Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Procedure Code</div>
          <div class="info-value" style="font-weight: bold; color: #3498db;">${procedure.code}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Procedure ID</div>
          <div class="info-value">#${procedure.id}</div>
        </div>
        <div class="info-item full-width">
          <div class="info-label">Description</div>
          <div class="info-value">${procedure.description}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Provider</div>
          <div class="info-value">${procedure.provider.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Procedure Date</div>
          <div class="info-value">${formatDate(procedure.procedureDate)}</div>
        </div>
      </div>
      
      <div class="highlight-box" style="margin-top: 15px;">
        <div class="label">Tooth Number</div>
        <div class="value" style="font-size: 36px;">#${procedure.toothNumber}</div>
      </div>
    </div>
    `;
  }

  /**
   * Generate crown specifications section
   */
  private generateCrownSpecsSection(specs: CrownSpecs): string {
    return `
    <div class="section">
      <div class="section-title">Crown Specifications</div>
      
      <div class="highlight-box">
        <div class="label">Shade</div>
        <div class="value">${specs.shade} (${specs.shadeSystem || 'Vita Classical'})</div>
      </div>
      
      <div class="specs-grid">
        <div class="info-item">
          <div class="info-label">Material</div>
          <div class="info-value">${specs.material}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Prep Type</div>
          <div class="info-value">${specs.prepType}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Margin</div>
          <div class="info-value">${specs.margin}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Occlusion</div>
          <div class="info-value">${specs.occlusion}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Contacts</div>
          <div class="info-value">${specs.contacts}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Contour</div>
          <div class="info-value">${specs.contour}</div>
        </div>
      </div>
    </div>
    `;
  }

  /**
   * Generate Ceramill workflow section
   */
  private generateCeramillSection(workflow: CeramillWorkflow): string {
    return `
    <div class="section">
      <div class="section-title">Ceramill Workflow</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Scan Type</div>
          <div class="info-value">${workflow.scanType}</div>
        </div>
        ${workflow.scannerUsed ? `
        <div class="info-item">
          <div class="info-label">Scanner</div>
          <div class="info-value">${workflow.scannerUsed}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Design Software</div>
          <div class="info-value">${workflow.designSoftware}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Milling Machine</div>
          <div class="info-value">${workflow.millingMachine}</div>
        </div>
        ${workflow.blockType ? `
        <div class="info-item">
          <div class="info-label">Block Type</div>
          <div class="info-value">${workflow.blockType}</div>
        </div>
        ` : ''}
        ${workflow.blockShade ? `
        <div class="info-item">
          <div class="info-label">Block Shade</div>
          <div class="info-value">${workflow.blockShade}</div>
        </div>
        ` : ''}
        ${workflow.estimatedMillTime ? `
        <div class="info-item">
          <div class="info-label">Est. Mill Time</div>
          <div class="info-value">${workflow.estimatedMillTime} minutes</div>
        </div>
        ` : ''}
      </div>
    </div>
    `;
  }

  /**
   * Generate instructions section
   */
  private generateInstructionsSection(workOrder: CrownWorkOrder): string {
    let html = '';
    
    if (workOrder.specialInstructions) {
      html += `
      <div class="instructions">
        <div class="instructions-title">⚠️ Special Instructions</div>
        <div class="instructions-content">${workOrder.specialInstructions}</div>
      </div>
      `;
    }
    
    if (workOrder.clinicalNotes) {
      html += `
      <div class="instructions">
        <div class="instructions-title">📋 Clinical Notes</div>
        <div class="instructions-content">${workOrder.clinicalNotes}</div>
      </div>
      `;
    }
    
    if (workOrder.labNotes) {
      html += `
      <div class="instructions">
        <div class="instructions-title">🔬 Lab Notes</div>
        <div class="instructions-content">${workOrder.labNotes}</div>
      </div>
      `;
    }
    
    return html;
  }

  /**
   * Generate footer
   */
  private generateFooter(workOrder: CrownWorkOrder): string {
    return `
    <div class="footer">
      <p><strong>Huntington Beach Dental Center</strong> - Internal Crown Production</p>
      <p>Work Order: ${workOrder.workOrderNumber} | Generated: ${formatDateTime(new Date())}</p>
      <p style="margin-top: 10px; font-style: italic;">
        This work order is for internal use only. Please verify all specifications before proceeding.
      </p>
    </div>
    `;
  }

  /**
   * Generate PDF from work order (returns HTML for now, can be converted to PDF)
   */
  async generatePDF(workOrder: CrownWorkOrder, outputPath: string): Promise<PDFGenerationResult> {
    try {
      const html = this.generateHTML(workOrder);
      
      // For now, we'll save as HTML
      // In production, you would use a library like puppeteer or wkhtmltopdf
      const fs = await import('fs');
      await fs.promises.writeFile(outputPath, html, 'utf-8');
      
      return {
        success: true,
        filePath: outputPath,
        metadata: {
          workOrderNumber: workOrder.workOrderNumber,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating PDF'
      };
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const pdfGenerator = new PDFGenerator();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick generate PDF from work order
 */
export async function generateWorkOrderPDF(
  workOrder: CrownWorkOrder,
  outputPath: string
): Promise<PDFGenerationResult> {
  return pdfGenerator.generatePDF(workOrder, outputPath);
}

/**
 * Generate HTML preview
 */
export function generateWorkOrderHTML(workOrder: CrownWorkOrder): string {
  return pdfGenerator.generateHTML(workOrder);
}

