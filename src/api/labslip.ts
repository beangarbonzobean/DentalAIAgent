import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSupabase } from '../database/supabase.js';
import logger from '../utils/logger.js';

/**
 * Lab slip management endpoints
 * Manage lab slip records in Supabase
 */

const router = Router();

// Validation schemas
const createLabSlipSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  procedure_type: z.string().min(1, 'Procedure type is required'),
  laboratory_id: z.string().optional(),
  provider_id: z.string().optional(),
  notes: z.string().optional(),
  shade: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'in_progress', 'completed', 'cancelled']).default('draft'),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/labslip
 * List all lab slips with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patient_id, status, limit = '50' } = req.query;
    
    logger.debug('Fetching lab slips', { patient_id, status, limit });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      logger.warning('Lab slip endpoint unavailable - Supabase not configured');
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Lab slip features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    let query = supabase
      .from('lab_slips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string, 10));

    // Apply filters
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch lab slips', { error });
      return res.status(500).json({
        error: 'Failed to fetch lab slips',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info(`Fetched ${data?.length || 0} lab slips`);
    res.status(200).json(data || []);
  } catch (error) {
    logger.error('Get lab slips endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * GET /api/labslip/:id
 * Get a specific lab slip by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.debug('Fetching lab slip', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Lab slip features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('lab_slips')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warning('Lab slip not found', { id });
        return res.status(404).json({ error: 'Lab slip not found' });
      }
      
      logger.error('Failed to fetch lab slip', { error, id });
      return res.status(500).json({
        error: 'Failed to fetch lab slip',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    res.status(200).json(data);
  } catch (error) {
    logger.error('Get lab slip endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * POST /api/labslip
 * Create a new lab slip
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createLabSlipSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warning('Invalid lab slip creation request', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const labSlipData = validationResult.data;
    logger.info('Creating lab slip', { 
      patient_id: labSlipData.patient_id,
      procedure_type: labSlipData.procedure_type,
    });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Lab slip features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('lab_slips')
      .insert([labSlipData])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create lab slip', { error });
      return res.status(500).json({
        error: 'Failed to create lab slip',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Lab slip created successfully', { id: data.id });
    res.status(201).json(data);
  } catch (error) {
    logger.error('Create lab slip endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * PUT /api/labslip/:id
 * Update an existing lab slip
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body (partial update)
    const validationResult = createLabSlipSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warning('Invalid lab slip update request', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const labSlipData = validationResult.data;
    logger.info('Updating lab slip', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Lab slip features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('lab_slips')
      .update(labSlipData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warning('Lab slip not found for update', { id });
        return res.status(404).json({ error: 'Lab slip not found' });
      }
      
      logger.error('Failed to update lab slip', { error, id });
      return res.status(500).json({
        error: 'Failed to update lab slip',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Lab slip updated successfully', { id });
    res.status(200).json(data);
  } catch (error) {
    logger.error('Update lab slip endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/labslip/:id
 * Delete a lab slip
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting lab slip', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Lab slip features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { error } = await supabase
      .from('lab_slips')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete lab slip', { error, id });
      return res.status(500).json({
        error: 'Failed to delete lab slip',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Lab slip deleted successfully', { id });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete lab slip endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

export default router;
