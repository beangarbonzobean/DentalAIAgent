import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSupabase } from '../database/supabase.js';
import logger from '../utils/logger.js';

/**
 * Automation management endpoints
 * CRUD operations for automation records in Supabase
 */

const router = Router();

// Validation schemas
const createAutomationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  trigger: z.string().min(1, 'Trigger is required'),
  action: z.string().min(1, 'Action is required'),
  enabled: z.boolean().default(true),
  config: z.record(z.any()).optional(),
});

const updateAutomationSchema = createAutomationSchema.partial();

/**
 * GET /api/automation
 * List all automation records
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.debug('Fetching all automations');
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      logger.warning('Automation endpoint unavailable - Supabase not configured');
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Automation features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch automations', { error });
      return res.status(500).json({
        error: 'Failed to fetch automations',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info(`Fetched ${data?.length || 0} automations`);
    res.status(200).json(data || []);
  } catch (error) {
    logger.error('Get automations endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * GET /api/automation/:id
 * Get a specific automation by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.debug('Fetching automation', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Automation features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warning('Automation not found', { id });
        return res.status(404).json({ error: 'Automation not found' });
      }
      
      logger.error('Failed to fetch automation', { error, id });
      return res.status(500).json({
        error: 'Failed to fetch automation',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    res.status(200).json(data);
  } catch (error) {
    logger.error('Get automation endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * POST /api/automation
 * Create a new automation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = createAutomationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warning('Invalid automation creation request', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const automationData = validationResult.data;
    logger.info('Creating automation', { name: automationData.name });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Automation features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('automations')
      .insert([automationData])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create automation', { error });
      return res.status(500).json({
        error: 'Failed to create automation',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Automation created successfully', { id: data.id });
    res.status(201).json(data);
  } catch (error) {
    logger.error('Create automation endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * PUT /api/automation/:id
 * Update an existing automation
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = updateAutomationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warning('Invalid automation update request', {
        errors: validationResult.error.errors,
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const automationData = validationResult.data;
    logger.info('Updating automation', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Automation features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { data, error } = await supabase
      .from('automations')
      .update(automationData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warning('Automation not found for update', { id });
        return res.status(404).json({ error: 'Automation not found' });
      }
      
      logger.error('Failed to update automation', { error, id });
      return res.status(500).json({
        error: 'Failed to update automation',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Automation updated successfully', { id });
    res.status(200).json(data);
  } catch (error) {
    logger.error('Update automation endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/automation/:id
 * Delete an automation
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting automation', { id });
    
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Automation features require Supabase. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment.',
      });
    }

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete automation', { error, id });
      return res.status(500).json({
        error: 'Failed to delete automation',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      });
    }

    logger.info('Automation deleted successfully', { id });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete automation endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

export default router;
