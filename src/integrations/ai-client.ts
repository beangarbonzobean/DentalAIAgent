import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger.js';

/**
 * AI Client Integration
 * Supports both Anthropic Claude and Google Gemini
 */

// Based on blueprint:javascript_anthropic
/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514";
// </important_do_not_delete>

// Based on blueprint:javascript_gemini
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Initialize Anthropic client
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
let anthropic: Anthropic | null = null;

if (anthropicApiKey) {
  anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });
  logger.info('Anthropic Claude client initialized successfully');
} else {
  logger.warning('ANTHROPIC_API_KEY not found - Claude features will be unavailable');
}

// Initialize Google Gemini client
const geminiApiKey = process.env.GEMINI_API_KEY;
let gemini: GoogleGenAI | null = null;

if (geminiApiKey) {
  gemini = new GoogleGenAI({ apiKey: geminiApiKey });
  logger.info('Google Gemini client initialized successfully');
} else {
  logger.warning('GEMINI_API_KEY not found - Gemini features will be unavailable');
}

/**
 * Message format for conversation history
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Chat with Claude AI
 * @param message - User message
 * @param conversationHistory - Optional conversation history for context
 * @returns AI response text
 */
export async function chatWithClaude(
  message: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized - check ANTHROPIC_API_KEY');
  }

  try {
    logger.debug('Sending message to Claude', { messageLength: message.length });

    // Build messages array with history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: DEFAULT_CLAUDE_MODEL,
      max_tokens: 2048,
      messages,
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    logger.debug('Received response from Claude', { 
      responseLength: responseText.length,
      tokensUsed: response.usage,
    });

    return responseText;
  } catch (error) {
    logger.error('Error calling Claude API', { error });
    throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Chat with Gemini AI
 * @param message - User message
 * @param conversationHistory - Optional conversation history for context
 * @returns AI response text
 */
export async function chatWithGemini(
  message: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
  if (!gemini) {
    throw new Error('Gemini client not initialized - check GEMINI_API_KEY');
  }

  try {
    logger.debug('Sending message to Gemini', { messageLength: message.length });

    // Build conversation context
    let prompt = message;
    if (conversationHistory && conversationHistory.length > 0) {
      const context = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      prompt = `${context}\n\nUser: ${message}`;
    }

    const response = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });

    const responseText = response.text || '';

    logger.debug('Received response from Gemini', { 
      responseLength: responseText.length,
    });

    return responseText;
  } catch (error) {
    logger.error('Error calling Gemini API', { error });
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process dental agent request using Claude with system prompt
 */
export async function processDentalAgentRequest(
  userMessage: string,
  conversationHistory?: ConversationMessage[]
): Promise<{
  response: string;
  intent: string;
  confidence: number;
}> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized - check ANTHROPIC_API_KEY');
  }

  try {
    const systemPrompt = `You are an intelligent dental practice assistant AI. You help dental professionals manage their practice by:
- Creating and managing lab slips for dental procedures
- Retrieving patient information
- Scheduling appointments
- Managing dental procedures and treatment plans
- Answering questions about dental practice management

When users make requests, identify the intent and respond helpfully. For requests to create lab slips or access patient data, provide clear confirmation of what action you're taking.

Common intents:
- create_lab_slip: User wants to create a new lab slip
- get_patient_info: User wants patient information
- schedule_appointment: User wants to schedule or check appointments
- manage_procedure: User wants to manage procedures
- general_query: General questions about the practice

Always be professional, clear, and helpful.`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory || []),
      { role: 'user', content: userMessage },
    ];

    const response = await anthropic.messages.create({
      model: DEFAULT_CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    // Extract intent from response (simplified - could be enhanced with structured output)
    let intent = 'general_query';
    let confidence = 0.7;

    const lowerResponse = responseText.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('lab slip') || lowerMessage.includes('create') && lowerMessage.includes('lab')) {
      intent = 'create_lab_slip';
      confidence = 0.9;
    } else if (lowerMessage.includes('patient') || lowerMessage.includes('get patient')) {
      intent = 'get_patient_info';
      confidence = 0.85;
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      intent = 'schedule_appointment';
      confidence = 0.85;
    } else if (lowerMessage.includes('procedure') || lowerMessage.includes('treatment')) {
      intent = 'manage_procedure';
      confidence = 0.8;
    }

    logger.info('Processed dental agent request', {
      intent,
      confidence,
      messageLength: userMessage.length,
      responseLength: responseText.length,
    });

    return {
      response: responseText,
      intent,
      confidence,
    };
  } catch (error) {
    logger.error('Error processing dental agent request', { error });
    throw new Error(`Dental agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { anthropic, gemini };
