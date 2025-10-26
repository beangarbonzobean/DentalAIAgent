/**
 * Crown Work Order API Routes
 * Express routes for managing internal crown work orders
 * 
 * Day 3 - API Integration
 */

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkOrderQueries } from '../database/workOrderQueries.js';
import { CrownDetectionService } from '../services/crownDetection.js';
import { PDFGenerator } from '../services/pdfGenerator.js';
import {
  CrownWorkOrder,
  WorkOrderStatus,
  DEFAULT_PRACTICE_INFO,
  DEFAULT_CERAMILL_WORKFLOW,
  generateWorkOrderNumber,
  calculateAge
} from '../types/crownWorkOrder.js';

// ============================================
// ROUTE SETUP
// ============================================

export function createCrownWorkOrderRoutes(
  supabase: SupabaseClient,
  outputDir: string = '/tmp/work-orders'
): Router {
  const router = Router();
  const queries = new WorkOrderQueries(supabase);
  const detection = new CrownDetectionService();
  const pdfGenerator = new PDFGenerator();

  // ============================================
  // POST /api/work-orders - Create work order
  // ============================================
  router.post('/work-orders', async (req: Request, res: Response) => {
    try {
      const {
        openDentalPatientId,
        openDentalProcedureId,
        openDentalAppointmentId,
        patient,
        procedure,
        crownSpecs,
        specialInstructions,
        clinicalNotes,
        assignedTo = 'Lab Tech',
        priority = 'routine',
        dueDate
      } = req.body;

      // Validate required fields
      if (!openDentalPatientId || !openDentalProcedureId || !patient || !procedure) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['openDentalPatientId', 'openDentalProcedureId', 'patient', 'procedure']
        });
      }

      // Detect if it's a crown procedure
      const detectionResult = detection.detectCrownProcedure(procedure.code);
      if (!detectionResult.isCrown) {
        return res.status(400).json({
          error: 'Not a crown procedure',
          procedureCode: procedure.code
        });
      }

      // Check if work order already exists
      const exists = await queries.workOrderExistsForProcedure(openDentalProcedureId);
      if (exists) {
        return res.status(409).json({
          error: 'Work order already exists for this procedure',
          procedureId: openDentalProcedureId
        });
      }

      // Prepare work order data
      const workOrderData = {
        practice: DEFAULT_PRACTICE_INFO,
        patient: {
          ...patient,
          age: patient.age || calculateAge(new Date(patient.dateOfBirth))
        },
        procedure,
        crownSpecs: crownSpecs || detection.getDefaultCrownSpecs(procedure.code, procedure.shade || 'A2'),
        ceramillWorkflow: DEFAULT_CERAMILL_WORKFLOW,
        specialInstructions,
        clinicalNotes,
        priority,
        assignedTo
      };

      // Create work order in database
      const { data, error } = await queries.createWorkOrder({
        openDentalPatientId,
        openDentalProcedureId,
        openDentalAppointmentId,
        patientName: patient.name,
        patientDob: new Date(patient.dateOfBirth),
        procedureCode: procedure.code,
        procedureDescription: procedure.description,
        toothNumber: procedure.toothNumber,
        shade: crownSpecs?.shade || procedure.shade || 'A2',
        workOrderData,
        specialInstructions,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: 'pending'
      });

      if (error || !data) {
        return res.status(500).json({
          error: 'Failed to create work order',
          details: error
        });
      }

      res.status(201).json({
        success: true,
        workOrder: data
      });
    } catch (error) {
      console.error('Error creating work order:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // GET /api/work-orders/:id - Get work order by ID
  // ============================================
  router.get('/work-orders/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await queries.getWorkOrderById(id);

      if (error) {
        return res.status(500).json({
          error: 'Failed to fetch work order',
          details: error
        });
      }

      if (!data) {
        return res.status(404).json({
          error: 'Work order not found',
          id
        });
      }

      res.json({
        success: true,
        workOrder: data
      });
    } catch (error) {
      console.error('Error fetching work order:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // GET /api/work-orders - List work orders
  // ============================================
  router.get('/work-orders', async (req: Request, res: Response) => {
    try {
      const {
        status,
        assignedTo,
        patientId,
        procedureId,
        priority,
        limit = 50
      } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status as WorkOrderStatus;
      }

      if (assignedTo) {
        filters.assignedTo = assignedTo as string;
      }

      if (patientId) {
        filters.patientId = parseInt(patientId as string);
      }

      if (procedureId) {
        filters.procedureId = parseInt(procedureId as string);
      }

      if (priority) {
        filters.priority = priority as 'routine' | 'urgent' | 'asap';
      }

      const { data, error } = await queries.listWorkOrders(filters, parseInt(limit as string));

      if (error) {
        return res.status(500).json({
          error: 'Failed to list work orders',
          details: error
        });
      }

      res.json({
        success: true,
        workOrders: data,
        count: data.length
      });
    } catch (error) {
      console.error('Error listing work orders:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // PATCH /api/work-orders/:id/status - Update status
  // ============================================
  router.patch('/work-orders/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          error: 'Status is required'
        });
      }

      const { data, error } = await queries.updateWorkOrderStatus(id, status, notes);

      if (error) {
        return res.status(500).json({
          error: 'Failed to update work order status',
          details: error
        });
      }

      if (!data) {
        return res.status(404).json({
          error: 'Work order not found',
          id
        });
      }

      res.json({
        success: true,
        workOrder: data
      });
    } catch (error) {
      console.error('Error updating work order status:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // POST /api/work-orders/:id/pdf - Generate PDF
  // ============================================
  router.post('/work-orders/:id/pdf', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get work order
      const { data: workOrderRecord, error } = await queries.getWorkOrderById(id);

      if (error || !workOrderRecord) {
        return res.status(404).json({
          error: 'Work order not found',
          id
        });
      }

      // Convert database record to CrownWorkOrder
      const workOrder: CrownWorkOrder = {
        id: workOrderRecord.id,
        workOrderNumber: `CWO-${workOrderRecord.id.substring(0, 8)}`,
        openDentalPatientId: workOrderRecord.opendental_patient_id,
        openDentalProcedureId: workOrderRecord.opendental_procedure_id,
        openDentalAppointmentId: workOrderRecord.opendental_appointment_id,
        openDentalLabCaseId: workOrderRecord.opendental_lab_case_id,
        practice: workOrderRecord.lab_slip_data.practice,
        patient: workOrderRecord.lab_slip_data.patient,
        procedure: workOrderRecord.lab_slip_data.procedure,
        crownSpecs: workOrderRecord.lab_slip_data.crownSpecs,
        ceramillWorkflow: workOrderRecord.lab_slip_data.ceramillWorkflow,
        assignedTo: workOrderRecord.lab_slip_data.assignedTo,
        specialInstructions: workOrderRecord.lab_slip_data.specialInstructions,
        clinicalNotes: workOrderRecord.lab_slip_data.clinicalNotes,
        labNotes: workOrderRecord.lab_slip_data.labNotes,
        createdAt: new Date(workOrderRecord.created_at),
        updatedAt: new Date(workOrderRecord.updated_at),
        dueDate: workOrderRecord.due_date ? new Date(workOrderRecord.due_date) : undefined,
        completedAt: workOrderRecord.completed_at ? new Date(workOrderRecord.completed_at) : undefined,
        status: workOrderRecord.status,
        statusHistory: [],
        priority: workOrderRecord.lab_slip_data.priority,
        pdfUrl: workOrderRecord.pdf_url
      };

      // Generate PDF
      const outputPath = `${outputDir}/work-order-${workOrder.id}.html`;
      const result = await pdfGenerator.generatePDF(workOrder, outputPath);

      if (!result.success) {
        return res.status(500).json({
          error: 'Failed to generate PDF',
          details: result.error
        });
      }

      // Update work order with PDF path
      await queries.updateWorkOrder({
        id,
        pdfStoragePath: outputPath
      });

      res.json({
        success: true,
        pdfPath: result.filePath,
        metadata: result.metadata
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // GET /api/work-orders/stats - Get statistics
  // ============================================
  router.get('/work-orders/stats', async (req: Request, res: Response) => {
    try {
      const stats = await queries.getWorkOrderStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting work order stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ============================================
  // DELETE /api/work-orders/:id - Delete work order
  // ============================================
  router.delete('/work-orders/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { success, error } = await queries.deleteWorkOrder(id);

      if (error) {
        return res.status(500).json({
          error: 'Failed to delete work order',
          details: error
        });
      }

      if (!success) {
        return res.status(404).json({
          error: 'Work order not found',
          id
        });
      }

      res.json({
        success: true,
        message: 'Work order deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting work order:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

// ============================================
// EXPORT
// ============================================

export default createCrownWorkOrderRoutes;

