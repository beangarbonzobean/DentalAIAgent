/**
 * Work Order Database Queries
 * Supabase queries for crown work order management
 * 
 * Day 3 - Database Integration
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  CrownWorkOrder,
  CrownWorkOrderRecord,
  WorkOrderData,
  WorkOrderStatus,
  generateWorkOrderNumber
} from '../types/crownWorkOrder.js';

// ============================================
// QUERY INTERFACES
// ============================================

export interface CreateWorkOrderParams {
  openDentalPatientId: number;
  openDentalProcedureId: number;
  openDentalAppointmentId?: number;
  patientName: string;
  patientDob: Date;
  procedureCode: string;
  procedureDescription: string;
  toothNumber: string;
  shade: string;
  workOrderData: WorkOrderData;
  specialInstructions?: string;
  dueDate?: Date;
  status?: WorkOrderStatus;
}

export interface UpdateWorkOrderParams {
  id: string;
  status?: WorkOrderStatus;
  labNotes?: string;
  pdfUrl?: string;
  pdfStoragePath?: string;
  completedAt?: Date;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus | WorkOrderStatus[];
  assignedTo?: string;
  patientId?: number;
  procedureId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  priority?: 'routine' | 'urgent' | 'asap';
}

// ============================================
// WORK ORDER QUERIES CLASS
// ============================================

export class WorkOrderQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new work order
   */
  async createWorkOrder(params: CreateWorkOrderParams): Promise<{ data: CrownWorkOrderRecord | null; error: any }> {
    try {
      const workOrderNumber = generateWorkOrderNumber();
      
      const record: Partial<CrownWorkOrderRecord> = {
        // Open Dental References
        opendental_patient_id: params.openDentalPatientId,
        opendental_procedure_id: params.openDentalProcedureId,
        opendental_appointment_id: params.openDentalAppointmentId,
        
        // Patient Information
        patient_name: params.patientName,
        patient_dob: params.patientDob,
        
        // Procedure Information
        procedure_code: params.procedureCode,
        procedure_description: params.procedureDescription,
        tooth_number: params.toothNumber,
        shade: params.shade,
        
        // Work Order Data
        lab_slip_data: params.workOrderData,
        special_instructions: params.specialInstructions,
        
        // Status
        status: params.status || 'pending',
        
        // Timestamps
        due_date: params.dueDate,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lab_slips')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception creating work order:', error);
      return { data: null, error };
    }
  }

  /**
   * Get work order by ID
   */
  async getWorkOrderById(id: string): Promise<{ data: CrownWorkOrderRecord | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('lab_slips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching work order:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching work order:', error);
      return { data: null, error };
    }
  }

  /**
   * Get work order by procedure ID
   */
  async getWorkOrderByProcedureId(procedureId: number): Promise<{ data: CrownWorkOrderRecord | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('lab_slips')
        .select('*')
        .eq('opendental_procedure_id', procedureId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Not found is not an error in this case
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Error fetching work order by procedure:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception fetching work order by procedure:', error);
      return { data: null, error };
    }
  }

  /**
   * List work orders with filters
   */
  async listWorkOrders(filters: WorkOrderFilters = {}, limit: number = 50): Promise<{ data: CrownWorkOrderRecord[]; error: any }> {
    try {
      let query = this.supabase
        .from('lab_slips')
        .select('*')
        .is('lab_id', null); // Internal work orders only

      // Apply filters
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters.assignedTo) {
        query = query.eq('lab_slip_data->>assignedTo', filters.assignedTo);
      }

      if (filters.patientId) {
        query = query.eq('opendental_patient_id', filters.patientId);
      }

      if (filters.procedureId) {
        query = query.eq('opendental_procedure_id', filters.procedureId);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      if (filters.priority) {
        query = query.eq('lab_slip_data->>priority', filters.priority);
      }

      // Order and limit
      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error listing work orders:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Exception listing work orders:', error);
      return { data: [], error };
    }
  }

  /**
   * Update work order
   */
  async updateWorkOrder(params: UpdateWorkOrderParams): Promise<{ data: CrownWorkOrderRecord | null; error: any }> {
    try {
      const updates: Partial<CrownWorkOrderRecord> = {
        updated_at: new Date()
      };

      if (params.status !== undefined) {
        updates.status = params.status;
      }

      if (params.pdfUrl !== undefined) {
        updates.pdf_url = params.pdfUrl;
      }

      if (params.pdfStoragePath !== undefined) {
        updates.pdf_storage_path = params.pdfStoragePath;
      }

      if (params.completedAt !== undefined) {
        updates.completed_at = params.completedAt;
      }

      // Update lab notes in JSONB
      if (params.labNotes !== undefined) {
        const { data: current } = await this.getWorkOrderById(params.id);
        if (current) {
          updates.lab_slip_data = {
            ...current.lab_slip_data,
            labNotes: params.labNotes
          };
        }
      }

      const { data, error } = await this.supabase
        .from('lab_slips')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating work order:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception updating work order:', error);
      return { data: null, error };
    }
  }

  /**
   * Update work order status
   */
  async updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus,
    notes?: string
  ): Promise<{ data: CrownWorkOrderRecord | null; error: any }> {
    const updates: UpdateWorkOrderParams = {
      id,
      status
    };

    if (notes) {
      updates.labNotes = notes;
    }

    if (status === 'seated') {
      updates.completedAt = new Date();
    }

    return this.updateWorkOrder(updates);
  }

  /**
   * Delete work order
   */
  async deleteWorkOrder(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.supabase
        .from('lab_slips')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting work order:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Exception deleting work order:', error);
      return { success: false, error };
    }
  }

  /**
   * Get work orders by status
   */
  async getWorkOrdersByStatus(status: WorkOrderStatus): Promise<{ data: CrownWorkOrderRecord[]; error: any }> {
    return this.listWorkOrders({ status });
  }

  /**
   * Get pending work orders
   */
  async getPendingWorkOrders(): Promise<{ data: CrownWorkOrderRecord[]; error: any }> {
    return this.listWorkOrders({ status: 'pending' });
  }

  /**
   * Get in-progress work orders
   */
  async getInProgressWorkOrders(): Promise<{ data: CrownWorkOrderRecord[]; error: any }> {
    return this.listWorkOrders({
      status: ['scanned', 'designed', 'milling', 'sintering', 'finishing', 'qc']
    });
  }

  /**
   * Get ready work orders
   */
  async getReadyWorkOrders(): Promise<{ data: CrownWorkOrderRecord[]; error: any }> {
    return this.listWorkOrders({ status: 'ready' });
  }

  /**
   * Check if work order exists for procedure
   */
  async workOrderExistsForProcedure(procedureId: number): Promise<boolean> {
    const { data } = await this.getWorkOrderByProcedureId(procedureId);
    return data !== null;
  }

  /**
   * Get work order statistics
   */
  async getWorkOrderStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    ready: number;
    completed: number;
  }> {
    try {
      const { data: all } = await this.listWorkOrders({}, 1000);
      
      const stats = {
        total: all.length,
        pending: all.filter(wo => wo.status === 'pending').length,
        inProgress: all.filter(wo => ['scanned', 'designed', 'milling', 'sintering', 'finishing', 'qc'].includes(wo.status)).length,
        ready: all.filter(wo => wo.status === 'ready').length,
        completed: all.filter(wo => wo.status === 'seated').length
      };

      return stats;
    } catch (error) {
      console.error('Exception getting work order stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        ready: 0,
        completed: 0
      };
    }
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Create work order queries instance
 */
export function createWorkOrderQueries(supabase: SupabaseClient): WorkOrderQueries {
  return new WorkOrderQueries(supabase);
}

