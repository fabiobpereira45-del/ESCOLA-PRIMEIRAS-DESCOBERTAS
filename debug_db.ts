import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdm92cHd6cHhzbHlhZXpxdmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA1NzQ3OSwiZXhwIjoyMDkzNjMzNDc5fQ.hd0DWO2jhKuc88IKN1mS_3I2o7CxKErDBQeoTWjRL7s';

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey);

async function run() {
  console.log('Checking database content...');
  
  const { data, error } = await supabase.from('school_info').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Database Rows:', JSON.stringify(data, null, 2));
    
    // Force update ALL rows to be safe
    for (const row of data) {
      await supabase.from('school_info').update({
        name: 'Escola Primeiras Descobertas (EPD)',
        logo_url: '/logo.png'
      }).eq('id', row.id);
    }
    console.log('Force updated all rows.');
  }
}

run();
