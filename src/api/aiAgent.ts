/**
 * AI Agent Endpoints
 * Natural language command processing for lab slip operations
 * 
 * Day 4 - AI Command Integration
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSupabase } from '../database/supabase.js';
import { WorkOrderQueries } from '../database/workOrderQueries.js';
import { createAICommandExecutor } from '../services/aiCommands.js';
import logger from '../utils/logger.js';

const router = Router();

// Validation schema for AI command requests
const commandSchema = z.object({
  command: z.string().min(1, 'Command text is required'),
  context: z.record(z.any()).optional()
});

/**
 * POST /api/ai-agent/command
 * Process a natural language command using Claude
 */
router.post('/command', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = commandSchema.safeParse(req.body);
    
    if (!validation.success) {
      logger.warning('Invalid AI command request', {
        errors: validation.error.errors
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors
      });
    }

    const { command } = validation.data;
    
    logger.info('Processing AI command', { command });

    // Check if Supabase is configured
    let supabase;
    try {
      supabase = getSupabase();
    } catch (error) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'AI commands require Supabase. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      });
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: 'AI service not configured',
        message: 'AI commands require Anthropic API key. Please add ANTHROPIC_API_KEY to environment.'
      });
    }

    // Create AI command executor
    const queries = new WorkOrderQueries(supabase);
    const executor = createAICommandExecutor(queries);

    // Execute the command
    const { result, response } = await executor.executeCommand(command);

    // Log result
    if (result.success) {
      logger.info('AI command executed successfully', {
        command,
        intent: result.data?.intent
      });
    } else {
      logger.warning('AI command failed', {
        command,
        error: result.error
      });
    }

    // Return response
    res.status(result.success ? 200 : 400).json({
      success: result.success,
      response,
      data: result.data,
      error: result.error
    });

  } catch (error) {
    logger.error('AI command endpoint error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error'
    });
  }
});

/**
 * GET /api/ai-agent/status
 * Check AI agent availability
 */
router.get('/status', (req: Request, res: Response) => {
  const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;
  const supabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  res.json({
    available: anthropicConfigured && supabaseConfigured,
    services: {
      anthropic: anthropicConfigured ? 'configured' : 'not configured',
      supabase: supabaseConfigured ? 'configured' : 'not configured'
    },
    supportedCommands: [
      'List pending lab slips',
      'Show all lab slips',
      'What is the status of lab slip [id]?',
      'Mark lab slip [id] as completed',
      'Update status of lab slip [id] to [status]'
    ]
  });
});

export default router;
