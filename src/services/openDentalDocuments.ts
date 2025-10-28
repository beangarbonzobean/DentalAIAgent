/**
 * Open Dental Documents Service
 * Upload and manage documents in Open Dental via RESTful API
 * 
 * Day 4 - Open Dental Integration (Updated to RESTful API)
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger.js';
import { OpenDentalDocument, OpenDentalUploadResult } from '../types/labSlip.js';

// ============================================
// OPEN DENTAL DOCUMENT CLIENT
// ============================================

export class OpenDentalDocumentClient {
  private client: AxiosInstance;
  private apiKey: string;
  private developerKey: string;
  private customerKey: string;

  constructor(
    apiUrl?: string,
    developerKey?: string,
    customerKey?: string
  ) {
    const url = apiUrl || process.env.OPENDENTAL_API_URL;
    this.developerKey = developerKey || process.env.OPENDENTAL_DEVELOPER_KEY || '';
    this.customerKey = customerKey || process.env.OPENDENTAL_CUSTOMER_KEY || '';

    if (!url) {
      throw new Error('Open Dental API URL is required');
    }

    if (!this.developerKey || !this.customerKey) {
      logger.warning('Open Dental API keys not configured - document upload will not work');
    }

    // Generate API key in ODFHIR format
    this.apiKey = this.generateApiKey();

    this.client = axios.create({
      baseURL: url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey
      }
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Open Dental API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Open Dental request error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Open Dental API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Open Dental response error', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate API key from developer and customer keys
   * Format: ODFHIR {DeveloperKey}/{CustomerKey}
   */
  private generateApiKey(): string {
    if (!this.developerKey || !this.customerKey) {
      return '';
    }
    return `ODFHIR ${this.developerKey}/${this.customerKey}`;
  }

  /**
   * Upload a PDF document to Open Dental
   */
  async uploadDocument(
    patientId: number,
    filePath: string,
    description: string,
    category: string = 'Lab Prescription'
  ): Promise<OpenDentalUploadResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: 'Open Dental API keys not configured',
          error: 'Missing OPENDENTAL_DEVELOPER_KEY or OPENDENTAL_CUSTOMER_KEY'
        };
      }

      logger.info('Uploading document to Open Dental', {
        patientId,
        filePath,
        category
      });

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'File not found',
          error: `File does not exist: ${filePath}`
        };
      }

      // Read file as base64
      const fileBuffer = fs.readFileSync(filePath);
      const fileBase64 = fileBuffer.toString('base64');
      const fileName = path.basename(filePath);

      // Create document record via RESTful API
      // Note: RESTful API documentation doesn't clearly specify the exact format for file upload
      // This implementation attempts common patterns - may need adjustment based on API response
      const documentData = {
        PatNum: patientId,
        FileName: fileName,
        DateCreated: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        Description: description,
        DocCategory: 0, // Default category
        // Attempting to include base64 content - field name may need adjustment
        RawBase64: fileBase64,  // Common RESTful pattern
        // Alternative possible field names:
        // Base64File: fileBase64,
        // FileData: fileBase64,
        // Content: fileBase64,
      };

      // Upload to Open Dental
      const response = await this.client.post('/documents', documentData);

      if (response.status === 201 || response.status === 200) {
        // RESTful API returns PascalCase fields (DocNum, not id)
        const documentId = response.data.DocNum || response.data.DocID || response.data.DocumentNum;
        
        logger.info('Document uploaded successfully', {
          patientId,
          documentId,
          fileName
        });

        // Return document ID as-is (typically a number in RESTful API)
        let finalDocumentId: string | number | undefined = undefined;
        if (documentId !== undefined && documentId !== null) {
          if (typeof documentId === 'number') {
            finalDocumentId = documentId;
          } else if (typeof documentId === 'string') {
            // Try to parse as number, but keep as string if it fails
            const parsed = parseInt(documentId, 10);
            finalDocumentId = !isNaN(parsed) && parsed.toString() === documentId ? parsed : documentId;
          }
        }

        return {
          success: true,
          documentId: finalDocumentId,
          message: 'Document uploaded successfully'
        };
      }

      return {
        success: false,
        message: 'Unexpected response from Open Dental',
        error: `Status: ${response.status}`
      };

    } catch (error) {
      logger.error('Error uploading document to Open Dental', {
        error,
        patientId,
        filePath
      });

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: 'Failed to upload document',
          error: error.response?.data?.message || error.message
        };
      }

      return {
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload a lab slip PDF to Open Dental
   * Convenience method with lab slip-specific defaults
   */
  async uploadLabSlipPDF(
    patientId: number,
    labSlipId: string,
    pdfPath: string
  ): Promise<OpenDentalUploadResult> {
    const description = `Lab Slip - Work Order ${labSlipId}`;
    const category = 'Lab Prescription';

    return this.uploadDocument(patientId, pdfPath, description, category);
  }

  /**
   * Get document by ID (RESTful API)
   */
  async getDocument(documentId: number | string): Promise<{ data: any | null; error: any }> {
    try {
      if (!this.apiKey) {
        return {
          data: null,
          error: { message: 'Open Dental API keys not configured' }
        };
      }

      const response = await this.client.get(`/documents/${documentId}`);
      
      if (response.status === 200) {
        return { data: response.data, error: null };
      }

      return {
        data: null,
        error: { message: `Unexpected status: ${response.status}` }
      };

    } catch (error) {
      logger.error('Error fetching document', { error, documentId });
      
      if (axios.isAxiosError(error)) {
        return {
          data: null,
          error: { message: error.response?.data?.message || error.message }
        };
      }

      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * List documents for a patient (RESTful API)
   */
  async listPatientDocuments(
    patientId: number,
    category?: string
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      if (!this.apiKey) {
        return {
          data: null,
          error: { message: 'Open Dental API keys not configured' }
        };
      }

      const params: any = { PatNum: patientId };
      
      if (category) {
        params.DocCategory = category;
      }

      const response = await this.client.get('/documents', { params });

      if (response.status === 200) {
        // RESTful API returns direct array (not FHIR bundle)
        const documents = Array.isArray(response.data) ? response.data : [];
        return { data: documents, error: null };
      }

      return {
        data: null,
        error: { message: `Unexpected status: ${response.status}` }
      };

    } catch (error) {
      logger.error('Error listing patient documents', { error, patientId });
      
      if (axios.isAxiosError(error)) {
        return {
          data: null,
          error: { message: error.response?.data?.message || error.message }
        };
      }

      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Delete a document (RESTful API)
   */
  async deleteDocument(documentId: number | string): Promise<{ success: boolean; error?: any }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: { message: 'Open Dental API keys not configured' }
        };
      }

      const response = await this.client.delete(`/documents/${documentId}`);

      if (response.status === 204 || response.status === 200) {
        logger.info('Document deleted successfully', { documentId });
        return { success: true };
      }

      return {
        success: false,
        error: { message: `Unexpected status: ${response.status}` }
      };

    } catch (error) {
      logger.error('Error deleting document', { error, documentId });
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: { message: error.response?.data?.message || error.message }
        };
      }

      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

/**
 * Factory function to create Open Dental document client
 */
export function createOpenDentalDocumentClient(
  apiUrl?: string,
  developerKey?: string,
  customerKey?: string
): OpenDentalDocumentClient {
  return new OpenDentalDocumentClient(apiUrl, developerKey, customerKey);
}

/**
 * Convenience function to upload a lab slip PDF to Open Dental
 */
export async function uploadLabSlipToOpenDental(
  labSlipId: string,
  patientId: number,
  pdfPath: string
): Promise<OpenDentalUploadResult> {
  const client = createOpenDentalDocumentClient();
  return client.uploadLabSlipPDF(patientId, labSlipId, pdfPath);
}
