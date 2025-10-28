/**
 * AI Commands Service
 * Natural language command processing using Anthropic Claude
 * 
 * Day 4 - AI Integration
 */

import Anthropic from '@anthropic-ai/sdk';
import { WorkOrderQueries } from '../database/workOrderQueries.js';
import logger from '../utils/logger.js';
import {
  CommandIntent,
  ParsedCommand,
  CommandExecutionResult
} from '../types/labSlip.js';

// ============================================
// AI COMMAND EXECUTOR
// ============================================

export class AICommandExecutor {
  private anthropic: Anthropic;
  private queries: WorkOrderQueries;

  constructor(queries: WorkOrderQueries, apiKey?: string) {
    this.queries = queries;
    
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY is required for AI commands');
    }
    
    this.anthropic = new Anthropic({ apiKey: key });
  }

  /**
   * Parse natural language command using Claude
   */
  async parseCommand(userInput: string): Promise<ParsedCommand> {
    try {
      logger.info('Parsing AI command', { userInput });

      const systemPrompt = `You are a dental practice AI assistant. Parse user commands related to lab slip management.

Identify the user's intent from these options:
- create_lab_slip: Create a new lab slip (e.g., "Create a lab slip for John's crown")
- list_lab_slips: List or query lab slips (e.g., "Show pending lab slips")
- get_status: Check status of a specific lab slip (e.g., "What's the status of lab slip xyz")
- update_status: Update lab slip status (e.g., "Mark lab slip abc as completed")
- resend_email: Resend lab slip email (e.g., "Resend email for patient 12345")
- unknown: Cannot determine intent

Extract relevant parameters like:
- patient_name, patient_id, tooth_number, procedure_code
- lab_slip_id, status
- filters (pending, completed, etc.)

Respond ONLY with valid JSON in this exact format:
{
  "intent": "intent_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "confidence": 0.95
}

Do not include any explanation, just the JSON.`;

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userInput
          }
        ]
      });

      // Extract JSON from response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(content.text);
      } catch (e) {
        logger.error('Failed to parse Claude response as JSON', { response: content.text });
        throw new Error('Invalid JSON response from AI');
      }

      const result: ParsedCommand = {
        intent: parsed.intent || 'unknown',
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0,
        originalText: userInput
      };

      logger.info('Command parsed successfully', result);
      return result;

    } catch (error) {
      logger.error('Error parsing command with Claude', { error });
      return {
        intent: 'unknown',
        parameters: {},
        confidence: 0,
        originalText: userInput
      };
    }
  }

  /**
   * Execute a parsed command
   */
  async executeCommand(userInput: string): Promise<{
    result: CommandExecutionResult;
    response: string;
  }> {
    try {
      // Parse the command
      const parsed = await this.parseCommand(userInput);

      // Check confidence threshold
      if (parsed.confidence < 0.6) {
        return {
          result: {
            success: false,
            message: 'Could not understand command',
            error: 'Low confidence in command interpretation'
          },
          response: "I'm not sure I understood that correctly. Could you rephrase your request?"
        };
      }

      // Execute based on intent
      let result: CommandExecutionResult;
      
      switch (parsed.intent) {
        case 'list_lab_slips':
          result = await this.handleListLabSlips(parsed.parameters);
          break;
          
        case 'get_status':
          result = await this.handleGetStatus(parsed.parameters);
          break;
          
        case 'update_status':
          result = await this.handleUpdateStatus(parsed.parameters);
          break;
          
        case 'create_lab_slip':
          result = {
            success: false,
            message: 'Lab slip creation requires structured data. Please use the API endpoint.',
            error: 'Not supported via natural language'
          };
          break;
          
        case 'resend_email':
          result = {
            success: false,
            message: 'Email resending is not yet implemented',
            error: 'Feature pending'
          };
          break;
          
        default:
          result = {
            success: false,
            message: 'Unknown command',
            error: 'Could not determine intent'
          };
      }

      // Generate natural language response
      const response = await this.generateResponse(parsed, result);

      return { result, response };

    } catch (error) {
      logger.error('Error executing command', { error });
      return {
        result: {
          success: false,
          message: 'Error executing command',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        response: 'Sorry, I encountered an error processing your request.'
      };
    }
  }

  /**
   * Handle list lab slips command
   */
  private async handleListLabSlips(params: Record<string, any>): Promise<CommandExecutionResult> {
    try {
      const filters: any = {};
      
      // Normalize parameter names from snake_case to camelCase
      if (params.status) {
        filters.status = params.status;
      }
      if (params.patient_id || params.patientId) {
        const patientId = params.patient_id || params.patientId;
        filters.patientId = parseInt(patientId);
      }
      if (params.assigned_to || params.assignedTo) {
        filters.assignedTo = params.assigned_to || params.assignedTo;
      }

      const { data, error } = await this.queries.listWorkOrders(filters, params.limit || 50);

      if (error) {
        return {
          success: false,
          message: 'Failed to fetch lab slips',
          error: error.message || 'Database error'
        };
      }

      return {
        success: true,
        data: data || [],
        message: `Found ${data?.length || 0} lab slip(s)`
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error fetching lab slips',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle get status command
   */
  private async handleGetStatus(params: Record<string, any>): Promise<CommandExecutionResult> {
    try {
      const labSlipId = params.lab_slip_id || params.id;
      
      if (!labSlipId) {
        return {
          success: false,
          message: 'Lab slip ID is required',
          error: 'Missing lab_slip_id parameter'
        };
      }

      const { data, error } = await this.queries.getWorkOrderById(labSlipId);

      if (error || !data) {
        return {
          success: false,
          message: 'Lab slip not found',
          error: error?.message || 'Not found'
        };
      }

      return {
        success: true,
        data,
        message: `Lab slip status: ${data.status}`
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error fetching lab slip status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle update status command
   */
  private async handleUpdateStatus(params: Record<string, any>): Promise<CommandExecutionResult> {
    try {
      // Normalize parameter names - support both status and new_status
      const labSlipId = params.lab_slip_id || params.labSlipId || params.id;
      const status = params.status || params.new_status || params.newStatus;
      const notes = params.notes || params.note;
      
      if (!labSlipId || !status) {
        return {
          success: false,
          message: 'Lab slip ID and status are required',
          error: 'Missing required parameters'
        };
      }

      const { data, error } = await this.queries.updateWorkOrderStatus(
        labSlipId,
        status,
        notes
      );

      if (error || !data) {
        return {
          success: false,
          message: 'Failed to update lab slip status',
          error: error?.message || 'Update failed'
        };
      }

      return {
        success: true,
        data,
        message: `Lab slip status updated to: ${status}`
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error updating lab slip status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate natural language response using Claude
   */
  private async generateResponse(
    parsed: ParsedCommand,
    result: CommandExecutionResult
  ): Promise<string> {
    try {
      const systemPrompt = `You are a helpful dental practice AI assistant. Generate a brief, professional response to the user based on their command and the result.

Keep responses:
- Concise (1-2 sentences)
- Professional and friendly
- Clear about success or failure
- Helpful with next steps if needed

Do not use JSON. Just respond naturally.`;

      const userPrompt = `User asked: "${parsed.originalText}"
Intent: ${parsed.intent}
Result: ${result.success ? 'Success' : 'Failed'}
Message: ${result.message}
Data: ${result.data ? JSON.stringify(result.data, null, 2) : 'None'}

Generate a natural response:`;

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.trim();
      }

      return result.message;

    } catch (error) {
      logger.error('Error generating response', { error });
      return result.message;
    }
  }
}

/**
 * Factory function to create AI command executor
 */
export function createAICommandExecutor(queries: WorkOrderQueries, apiKey?: string): AICommandExecutor {
  return new AICommandExecutor(queries, apiKey);
}
