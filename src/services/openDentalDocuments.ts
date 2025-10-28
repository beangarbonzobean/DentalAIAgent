/**
 * Open Dental Documents Service
 * Upload and manage documents in Open Dental via FHIR API
 * 
 * Day 4 - Open Dental Integration
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

    // Generate API key from developer and customer keys
    this.apiKey = this.generateApiKey();

    this.client = axios.create({
      baseURL: url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
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
   * Format: Base64(developerKey:customerKey)
   */
  private generateApiKey(): string {
    if (!this.developerKey || !this.customerKey) {
      return '';
    }
    const credentials = `${this.developerKey}:${this.customerKey}`;
    return Buffer.from(credentials).toString('base64');
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

      // Create document record via FHIR API
      const documentData = {
        resourceType: 'DocumentReference',
        status: 'current',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: '11488-4',
            display: category
          }]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        date: new Date().toISOString(),
        description: description,
        content: [{
          attachment: {
            contentType: 'application/pdf',
            data: fileBase64,
            title: fileName
          }
        }]
      };

      // Upload to Open Dental
      const response = await this.client.post('/DocumentReference', documentData);

      if (response.status === 201 || response.status === 200) {
        const documentId = response.data.id || response.data.identifier?.[0]?.value;
        
        logger.info('Document uploaded successfully', {
          patientId,
          documentId,
          fileName
        });

        return {
          success: true,
          documentId: documentId ? parseInt(documentId) : undefined,
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
   * Get document by ID
   */
  async getDocument(documentId: number): Promise<{ data: any | null; error: any }> {
    try {
      if (!this.apiKey) {
        return {
          data: null,
          error: { message: 'Open Dental API keys not configured' }
        };
      }

      const response = await this.client.get(`/DocumentReference/${documentId}`);
      
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
   * List documents for a patient
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

      let url = `/DocumentReference?subject=Patient/${patientId}`;
      
      if (category) {
        url += `&type=${encodeURIComponent(category)}`;
      }

      const response = await this.client.get(url);

      if (response.status === 200) {
        const documents = response.data.entry?.map((e: any) => e.resource) || [];
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
   * Delete a document
   */
  async deleteDocument(documentId: number): Promise<{ success: boolean; error?: any }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: { message: 'Open Dental API keys not configured' }
        };
      }

      const response = await this.client.delete(`/DocumentReference/${documentId}`);

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
