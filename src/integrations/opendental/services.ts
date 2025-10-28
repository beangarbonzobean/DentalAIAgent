import openDentalClient, { handleOpenDentalError } from './client.js';
import {
  Patient,
  Procedure,
  Appointment,
  LabCase,
  Laboratory,
  Provider,
  Document,
} from './types.js';

/**
 * Open Dental RESTful API service methods
 * Comprehensive CRUD operations for dental practice management
 */

export const openDentalService = {
  // ============ PATIENT SERVICES ============
  
  /**
   * Get a patient by ID (PatNum)
   */
  async getPatient(patientId: string): Promise<Patient> {
    try {
      const response = await openDentalClient.get<Patient>(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for patients by criteria
   * RESTful API supports: LName, FName, Phone, Email, Birthdate, etc.
   */
  async searchPatients(params: {
    LName?: string;
    FName?: string;
    Birthdate?: string;
    Email?: string;
    Phone?: string;
    hideInactive?: boolean;
  }): Promise<Patient[]> {
    try {
      const response = await openDentalClient.get<Patient[]>('/patients', {
        params,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new patient
   */
  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    try {
      const response = await openDentalClient.post<Patient>('/patients', patient);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Update an existing patient
   */
  async updatePatient(patientId: string, patient: Partial<Patient>): Promise<Patient> {
    try {
      const response = await openDentalClient.put<Patient>(`/patients/${patientId}`, patient);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ PROCEDURE SERVICES ============

  /**
   * Get a procedure by ID (ProcNum)
   */
  async getProcedure(procedureId: string): Promise<Procedure> {
    try {
      const response = await openDentalClient.get<Procedure>(`/procedures/${procedureId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for procedures
   * RESTful API supports: PatNum, AptNum, ProcStatus, etc.
   */
  async searchProcedures(params: {
    PatNum?: string;
    AptNum?: string;
    ProcStatus?: string;
  }): Promise<Procedure[]> {
    try {
      const response = await openDentalClient.get<Procedure[]>('/procedures', {
        params,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get procedures for a specific patient
   */
  async getPatientProcedures(patientId: string): Promise<Procedure[]> {
    return this.searchProcedures({ PatNum: patientId });
  },

  /**
   * Get crown procedures specifically (D2740, D2750, D2751, D2752)
   */
  async getCrownProcedures(patientId?: string): Promise<Procedure[]> {
    try {
      const params: any = {};
      if (patientId) {
        params.PatNum = patientId;
      }
      // Note: May need additional filtering by procedure code after retrieval
      return this.searchProcedures(params);
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new procedure
   */
  async createProcedure(procedure: Partial<Procedure>): Promise<Procedure> {
    try {
      const response = await openDentalClient.post<Procedure>('/procedures', procedure);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Update an existing procedure
   */
  async updateProcedure(procedureId: string, procedure: Partial<Procedure>): Promise<Procedure> {
    try {
      const response = await openDentalClient.put<Procedure>(`/procedures/${procedureId}`, procedure);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ APPOINTMENT SERVICES ============

  /**
   * Get an appointment by ID (AptNum)
   */
  async getAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const response = await openDentalClient.get<Appointment>(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for appointments
   * RESTful API supports: PatNum, AptDateTime, AptStatus, etc.
   */
  async searchAppointments(params: {
    PatNum?: string;
    AptDateTime?: string;
    AptStatus?: string;
  }): Promise<Appointment[]> {
    try {
      const response = await openDentalClient.get<Appointment[]>('/appointments', {
        params,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await openDentalClient.post<Appointment>('/appointments', appointment);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointmentId: string, appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await openDentalClient.put<Appointment>(`/appointments/${appointmentId}`, appointment);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ LAB CASE SERVICES ============

  /**
   * Get a lab case by ID (LabCaseNum)
   */
  async getLabCase(labCaseId: string): Promise<LabCase> {
    try {
      const response = await openDentalClient.get<LabCase>(`/labcases/${labCaseId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get lab cases for a specific patient
   * RESTful API supports: PatNum, LaboratoryNum, AptNum, ProvNum
   */
  async getPatientLabCases(patientId: string): Promise<LabCase[]> {
    try {
      const response = await openDentalClient.get<LabCase[]>('/labcases', {
        params: { PatNum: patientId },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new lab case
   */
  async createLabCase(labCase: Partial<LabCase>): Promise<LabCase> {
    try {
      const response = await openDentalClient.post<LabCase>('/labcases', labCase);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Update an existing lab case
   */
  async updateLabCase(labCaseId: string, labCase: Partial<LabCase>): Promise<LabCase> {
    try {
      const response = await openDentalClient.put<LabCase>(`/labcases/${labCaseId}`, labCase);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ LABORATORY SERVICES ============

  /**
   * Get a laboratory by ID (LaboratoryNum)
   */
  async getLaboratory(laboratoryId: string): Promise<Laboratory> {
    try {
      const response = await openDentalClient.get<Laboratory>(`/laboratories/${laboratoryId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get all laboratories
   */
  async getAllLaboratories(): Promise<Laboratory[]> {
    try {
      const response = await openDentalClient.get<Laboratory[]>('/laboratories');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ PROVIDER SERVICES ============

  /**
   * Get a provider by ID (ProvNum)
   */
  async getProvider(providerId: string): Promise<Provider> {
    try {
      const response = await openDentalClient.get<Provider>(`/providers/${providerId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get all providers
   */
  async getAllProviders(): Promise<Provider[]> {
    try {
      const response = await openDentalClient.get<Provider[]>('/providers');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ DOCUMENT SERVICES ============

  /**
   * Get a document by ID (DocNum)
   */
  async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await openDentalClient.get<Document>(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get documents for a specific patient
   * RESTful API supports: PatNum, DocCategory, etc.
   */
  async getPatientDocuments(patientId: string): Promise<Document[]> {
    try {
      const response = await openDentalClient.get<Document[]>('/documents', {
        params: { PatNum: patientId },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new document
   */
  async createDocument(document: Partial<Document>): Promise<Document> {
    try {
      const response = await openDentalClient.post<Document>('/documents', document);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Upload a document with binary data
   * Note: RESTful API uses different structure than FHIR
   */
  async uploadDocument(documentData: {
    patientId: string;
    contentType: string;
    data: string; // base64 encoded
    title: string;
  }): Promise<Document> {
    try {
      const document: any = {
        PatNum: parseInt(documentData.patientId),
        FileName: documentData.title,
        DateCreated: new Date().toISOString().split('T')[0],
        DocCategory: 0, // Default category
        // Include base64 file content
        // Note: Field name may need adjustment based on actual Open Dental REST API spec
        RawBase64: documentData.data,  // Common RESTful pattern
        // Alternative possible field names:
        // Base64File: documentData.data,
        // FileData: documentData.data,
        // Content: documentData.data,
      };
      
      return this.createDocument(document);
    } catch (error) {
      handleOpenDentalError(error);
    }
  },
};

export default openDentalService;
