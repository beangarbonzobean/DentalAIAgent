import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

// Import API routes
import healthRouter from './api/health.js';
import agentRouter from './api/agent.js';
import automationRouter from './api/automation.js';
import labslipRouter from './api/labslip.js';
import { createCrownWorkOrderRoutes } from './api/crownWorkOrderRoutes.js';
import { getSupabase } from './database/supabase.js';

// Load environment variables
dotenv.config();

/**
 * Dental AI Agent API Server
 * Production-ready Express TypeScript API with Supabase, Open Dental, and AI integrations
 */

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ MIDDLEWARE ============

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // In production, configure specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging with Morgan piped to Winston
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
));

// ============ ROUTES ============

/**
 * Root endpoint - API information
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Dental AI Agent API',
    version: '1.0.0',
    description: 'Production-ready TypeScript Express API for dental practice management',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      agent: '/api/agent',
      automation: '/api/automation',
      labslip: '/api/labslip',
      workOrders: '/api/work-orders',
    },
    practice: {
      name: 'Huntington Beach Dental Center',
      phone: '714-842-5035',
      email: 'ben.m.youngdds@gmail.com',
      address: '17692 Beach Blvd STE 310, Huntington Beach, CA 92647',
    },
  });
});

/**
 * Mount API routes
 */
app.use('/api/health', healthRouter);
app.use('/api/agent', agentRouter);
app.use('/api/automation', automationRouter);
app.use('/api/labslip', labslipRouter);

// Crown Work Order routes (Day 3)
try {
  const supabase = getSupabase();
  const crownWorkOrderRouter = createCrownWorkOrderRoutes(supabase, './output');
  app.use('/api', crownWorkOrderRouter);
  logger.info('✅ Crown Work Order routes mounted successfully');
} catch (error) {
  logger.warning('Crown Work Order routes not mounted - Supabase not configured');
}

// ============ ERROR HANDLING ============

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  logger.warning('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
});

// ============ SERVER STARTUP ============

/**
 * Start the server
 */
function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 Dental AI Agent API Server started successfully`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`🤖 AI Agent: http://localhost:${PORT}/api/agent`);
      logger.info(`⚙️  Automation: http://localhost:${PORT}/api/automation`);
      logger.info(`🔬 Lab Slips: http://localhost:${PORT}/api/labslip`);
      logger.info(`👑 Crown Work Orders: http://localhost:${PORT}/api/work-orders`);
      
      // Log configuration status
      const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
      const hasGemini = !!process.env.GEMINI_API_KEY;
      const hasOpenDental = !!process.env.OPENDENTAL_DEVELOPER_KEY;

      logger.info('🔧 Service Configuration:');
      logger.info(`   Supabase: ${hasSupabase ? '✅ Configured' : '❌ Missing credentials'}`);
      logger.info(`   Anthropic Claude: ${hasAnthropic ? '✅ Configured' : '❌ Missing API key'}`);
      logger.info(`   Google Gemini: ${hasGemini ? '✅ Configured' : '⚠️  Optional - not configured'}`);
      logger.info(`   Open Dental: ${hasOpenDental ? '✅ Configured' : '⚠️  Optional - not configured'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;
