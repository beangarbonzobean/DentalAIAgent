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
 * Open Dental FHIR API service methods
 * Comprehensive CRUD operations for dental practice management
 */

export const openDentalService = {
  // ============ PATIENT SERVICES ============
  
  /**
   * Get a patient by ID
   */
  async getPatient(patientId: string): Promise<Patient> {
    try {
      const response = await openDentalClient.get<Patient>(`/Patient/${patientId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for patients by criteria
   */
  async searchPatients(params: {
    name?: string;
    birthdate?: string;
    identifier?: string;
  }): Promise<Patient[]> {
    try {
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Patient }> }>('/Patient', {
        params,
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new patient
   */
  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    try {
      const response = await openDentalClient.post<Patient>('/Patient', patient);
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
      const response = await openDentalClient.put<Patient>(`/Patient/${patientId}`, patient);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ PROCEDURE SERVICES ============

  /**
   * Get a procedure by ID
   */
  async getProcedure(procedureId: string): Promise<Procedure> {
    try {
      const response = await openDentalClient.get<Procedure>(`/Procedure/${procedureId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for procedures
   */
  async searchProcedures(params: {
    patient?: string;
    code?: string;
    date?: string;
  }): Promise<Procedure[]> {
    try {
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Procedure }> }>('/Procedure', {
        params,
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get procedures for a specific patient
   */
  async getPatientProcedures(patientId: string): Promise<Procedure[]> {
    return this.searchProcedures({ patient: patientId });
  },

  /**
   * Get crown procedures specifically
   */
  async getCrownProcedures(patientId?: string): Promise<Procedure[]> {
    try {
      const params: any = {
        code: 'crown', // This would be the proper FHIR code for crown procedures
      };
      if (patientId) {
        params.patient = patientId;
      }
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
      const response = await openDentalClient.post<Procedure>('/Procedure', procedure);
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
      const response = await openDentalClient.put<Procedure>(`/Procedure/${procedureId}`, procedure);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ APPOINTMENT SERVICES ============

  /**
   * Get an appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment> {
    try {
      const response = await openDentalClient.get<Appointment>(`/Appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Search for appointments
   */
  async searchAppointments(params: {
    patient?: string;
    date?: string;
    status?: string;
  }): Promise<Appointment[]> {
    try {
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Appointment }> }>('/Appointment', {
        params,
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await openDentalClient.post<Appointment>('/Appointment', appointment);
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
      const response = await openDentalClient.put<Appointment>(`/Appointment/${appointmentId}`, appointment);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ LAB CASE SERVICES ============

  /**
   * Get a lab case by ID
   */
  async getLabCase(labCaseId: string): Promise<LabCase> {
    try {
      const response = await openDentalClient.get<LabCase>(`/ServiceRequest/${labCaseId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get lab cases for a specific patient
   */
  async getPatientLabCases(patientId: string): Promise<LabCase[]> {
    try {
      const response = await openDentalClient.get<{ entry?: Array<{ resource: LabCase }> }>('/ServiceRequest', {
        params: { subject: patientId },
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new lab case
   */
  async createLabCase(labCase: Partial<LabCase>): Promise<LabCase> {
    try {
      const response = await openDentalClient.post<LabCase>('/ServiceRequest', labCase);
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
      const response = await openDentalClient.put<LabCase>(`/ServiceRequest/${labCaseId}`, labCase);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ LABORATORY SERVICES ============

  /**
   * Get a laboratory by ID
   */
  async getLaboratory(laboratoryId: string): Promise<Laboratory> {
    try {
      const response = await openDentalClient.get<Laboratory>(`/Organization/${laboratoryId}`);
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
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Laboratory }> }>('/Organization', {
        params: { type: 'laboratory' },
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ PROVIDER SERVICES ============

  /**
   * Get a provider by ID
   */
  async getProvider(providerId: string): Promise<Provider> {
    try {
      const response = await openDentalClient.get<Provider>(`/Practitioner/${providerId}`);
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
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Provider }> }>('/Practitioner');
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  // ============ DOCUMENT SERVICES ============

  /**
   * Get a document by ID
   */
  async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await openDentalClient.get<Document>(`/DocumentReference/${documentId}`);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Get documents for a specific patient
   */
  async getPatientDocuments(patientId: string): Promise<Document[]> {
    try {
      const response = await openDentalClient.get<{ entry?: Array<{ resource: Document }> }>('/DocumentReference', {
        params: { subject: patientId },
      });
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Create a new document reference
   */
  async createDocument(document: Partial<Document>): Promise<Document> {
    try {
      const response = await openDentalClient.post<Document>('/DocumentReference', document);
      return response.data;
    } catch (error) {
      handleOpenDentalError(error);
    }
  },

  /**
   * Upload a document with binary data
   */
  async uploadDocument(documentData: {
    patientId: string;
    contentType: string;
    data: string; // base64 encoded
    title: string;
  }): Promise<Document> {
    try {
      const document: Partial<Document> = {
        resourceType: 'DocumentReference',
        status: 'current',
        subject: {
          reference: `Patient/${documentData.patientId}`,
        },
        content: [{
          attachment: {
            contentType: documentData.contentType,
            data: documentData.data,
            title: documentData.title,
          },
        }],
      };
      
      return this.createDocument(document);
    } catch (error) {
      handleOpenDentalError(error);
    }
  },
};

export default openDentalService;
