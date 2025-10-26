import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { processDentalAgentRequest, ConversationMessage } from '../integrations/ai-client.js';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * AI Agent chat endpoint
 * Processes natural language requests using Anthropic Claude
 */

const router = Router();

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().uuid().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

// In-memory conversation storage (in production, use database)
const conversations = new Map<string, ConversationMessage[]>();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = chatRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warning('Invalid agent chat request', { 
        errors: validationResult.error.errors 
      });
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { message, conversationId, conversationHistory } = validationResult.data;

    // Get or create conversation ID
    const convId = conversationId || randomUUID();
    
    // Get conversation history
    let history: ConversationMessage[] = conversationHistory || conversations.get(convId) || [];

    logger.info('Processing agent chat request', {
      conversationId: convId,
      messageLength: message.length,
      historyLength: history.length,
    });

    // Process the request with Claude
    const result = await processDentalAgentRequest(message, history);

    // Update conversation history
    const updatedHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: result.response },
    ];
    conversations.set(convId, updatedHistory);

    // Return response
    res.status(200).json({
      response: result.response,
      conversationId: convId,
      intent: result.intent,
      confidence: result.confidence,
    });

  } catch (error) {
    logger.error('Agent chat endpoint error', { error });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('not initialized') ? 503 : 500;
    
    res.status(statusCode).json({
      error: 'Failed to process request',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
    });
  }
});

// Get conversation history
router.get('/conversation/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const history = conversations.get(conversationId);
    
    if (!history) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      conversationId,
      history,
    });
  } catch (error) {
    logger.error('Get conversation endpoint error', { error });
    res.status(500).json({
      error: 'Failed to retrieve conversation',
      message: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
    });
  }
});

export default router;
