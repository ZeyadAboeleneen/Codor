require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Try to add missing columns via SQL
  const alterStatements = [
    "ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
    "ALTER TABLE brands ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
    "ALTER TABLE brands ADD COLUMN IF NOT EXISTS description_ar TEXT",
    "ALTER TABLE brands ADD COLUMN IF NOT EXISTS description_en TEXT",
  ];

  for (const sql of alterStatements) {
    const { error } = await s.rpc('exec_sql', { sql });
    if (error) {
      console.log('RPC exec_sql not available, will try Supabase dashboard SQL. Error:', error.message);
      console.log('\n=== PLEASE RUN THIS SQL IN SUPABASE DASHBOARD ===');
      console.log(alterStatements.join(';\n') + ';');
      console.log('=== END SQL ===\n');
      break;
    } else {
      console.log('OK:', sql.substring(0, 60));
    }
  }

  // Verify
  const { data, error } = await s.from('brands').select('*');
  console.log('\nBrands after fix:');
  console.log('Columns:', data?.[0] ? Object.keys(data[0]) : 'unknown');
  console.log('Count:', data?.length);
  if (data) {
    data.forEach(b => console.log(`  - ${b.name_en} | active: ${b.is_active} | sort: ${b.sort_order}`));
  }
}

run().catch(console.error);
