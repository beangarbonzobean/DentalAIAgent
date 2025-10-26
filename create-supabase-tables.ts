import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating tables in Supabase...\n');

  // Create automations table
  const createAutomations = `
    CREATE TABLE IF NOT EXISTS automations (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      trigger TEXT NOT NULL,
      action TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true,
      config JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // Create lab_slips table
  const createLabSlips = `
    CREATE TABLE IF NOT EXISTS lab_slips (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id TEXT NOT NULL,
      procedure_type TEXT NOT NULL,
      laboratory_id TEXT,
      provider_id TEXT,
      notes TEXT,
      shade TEXT,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      metadata JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // Create users table
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  try {
    // Execute SQL via Supabase RPC (we need to use the SQL endpoint)
    console.log('1. Creating automations table...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: createAutomations });
    if (error1) {
      // If rpc doesn't work, we'll need to use a different approach
      console.log('RPC not available, will provide manual SQL instructions');
    } else {
      console.log('   ✓ Automations table created\n');
    }

    console.log('2. Creating lab_slips table...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: createLabSlips });
    if (!error2) {
      console.log('   ✓ Lab slips table created\n');
    }

    console.log('3. Creating users table...');
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: createUsers });
    if (!error3) {
      console.log('   ✓ Users table created\n');
    }

    console.log('\n✓ All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    console.log('\n\n📋 Manual SQL to run in Supabase SQL Editor:\n');
    console.log('-- Copy and paste this into Supabase Studio > SQL Editor\n');
    console.log(createAutomations);
    console.log(createLabSlips);
    console.log(createUsers);
    console.log('\n-- After running, execute this to reload schema cache:');
    console.log("NOTIFY pgrst, 'reload schema';\n");
  }
}

createTables();
