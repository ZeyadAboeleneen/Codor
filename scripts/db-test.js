require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runCheck() {
  console.log('🔗 Connecting to Supabase:', supabaseUrl);
  
  const tables = [
    'users',
    'products',
    'categories',
    'brands',
    'orders',
    'order_items',
    'reviews',
    'carts',
    'homepage_sections',
    'settings',
    'contact_messages',
    'offers',
    'discount_codes'
  ];

  console.log('\n--- Table Checks ---');
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ Table "${table}": Error ->`, error.message);
      } else {
        console.log(`✅ Table "${table}": Accessible -> Count: ${count}`);
      }
    } catch (e) {
      console.log(`❌ Table "${table}": Exception ->`, e.message);
    }
  }

  console.log('\n--- Product Table Schema Check ---');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying products:', error.message);
    } else if (products && products.length > 0) {
      console.log('✅ Found product columns:', Object.keys(products[0]));
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
    } else {
      console.log('ℹ️ Products table is empty.');
      
      const testCols = ['category_id', 'brand_id', 'model_name', 'category', 'sizes'];
      for (const col of testCols) {
        const { error: colErr } = await supabase.from('products').select(col).limit(1);
        console.log(`Column "${col}": ${colErr ? '❌ Not Found' : '✅ Exists'}`);
      }
    }
  } catch (e) {
    console.error('❌ Exception checking product schema:', e.message);
  }
}

runCheck();
