import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

/**
 * Supabase client initialization
 * Uses service role key for server-side operations
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  logger.warning('Supabase credentials not found - database features will be unavailable');
  logger.warning('Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Replit Secrets');
} else {
  try {
    supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    logger.info('Supabase client initialized successfully', {
      url: supabaseUrl,
    });
  } catch (error) {
    logger.error('Failed to initialize Supabase client', { error });
  }
}

/**
 * Get Supabase client instance
 * Throws error if not configured
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase client not initialized - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabase;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    logger.warning('Cannot test Supabase connection - client not initialized');
    return false;
  }

  try {
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    
    // If the table doesn't exist, that's okay - connection is still valid
    if (error && !error.message.includes('does not exist')) {
      logger.error('Supabase connection test failed', { error: error.message });
      return false;
    }
    
    logger.debug('Supabase connection test passed');
    return true;
  } catch (error) {
    logger.error('Supabase connection test error', { error });
    return false;
  }
}

// Export the instance directly (can be null)
export { supabase };
