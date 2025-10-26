import { Router, Request, Response } from 'express';
import { testSupabaseConnection, isSupabaseConfigured } from '../database/supabase.js';
import logger from '../utils/logger.js';

/**
 * Health check endpoint
 * Tests API, database, and external service connectivity
 */

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    logger.debug('Health check requested');

    const timestamp = new Date().toISOString();
    const apiStatus = 'up';
    
    // Test Supabase connection
    let databaseStatus: string;
    if (!isSupabaseConfigured()) {
      databaseStatus = 'not_configured';
      logger.debug('Database health check skipped - not configured');
    } else {
      try {
        const isConnected = await testSupabaseConnection();
        databaseStatus = isConnected ? 'up' : 'down';
      } catch (error) {
        logger.error('Database health check failed', { error });
        databaseStatus = 'down';
      }
    }

    // Open Dental is not tested in health check to avoid unnecessary API calls
    const openDentalStatus = 'not_tested';

    const healthStatus = {
      status: 'healthy',
      timestamp,
      services: {
        api: apiStatus,
        database: databaseStatus,
        openDental: openDentalStatus,
      },
    };

    // Determine overall status
    if (databaseStatus === 'down') {
      healthStatus.status = 'degraded';
      logger.warning('Health check: degraded - database is down');
      return res.status(503).json(healthStatus);
    } else if (databaseStatus === 'not_configured') {
      healthStatus.status = 'operational_degraded';
      logger.info('Health check: operational with limited features - database not configured');
      return res.status(200).json(healthStatus);
    }

    logger.info('Health check: all systems operational');
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check endpoint error', { error });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

export default router;
