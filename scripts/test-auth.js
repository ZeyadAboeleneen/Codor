require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runTest() {
  const email = 'test_login_auth@example.com';
  const password = 'Password123!';
  const name = 'Test Auth User';

  console.log('🔄 Cleaning up any existing test user...');
  await supabaseAdmin.from('users').delete().eq('email', email);

  console.log('🔄 Hashing password...');
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Hashed:', hashedPassword);

  console.log('🔄 Inserting test user into database...');
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    })
    .select()
    .single();

  if (insertError) {
    console.error('❌ Failed to insert user:', insertError.message);
    return;
  }
  console.log('✅ User inserted successfully. ID:', newUser.id);

  console.log('🔄 Simulating login lookup...');
  const { data: user, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (lookupError || !user) {
    console.error('❌ Failed to retrieve user for login:', lookupError ? lookupError.message : 'User not found');
    return;
  }
  console.log('✅ User retrieved from database. Stored hash:', user.password);

  console.log('🔄 Comparing passwords...');
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(`Password validation result: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

  const isPasswordValidWrong = await bcrypt.compare('wrong_pass', user.password);
  console.log(`Password validation with wrong password: ${isPasswordValidWrong ? '❌ VALID (Expected: INVALID)' : '✅ INVALID (Expected: INVALID)'}`);

  // Clean up
  console.log('🔄 Cleaning up...');
  await supabaseAdmin.from('users').delete().eq('email', email);
  console.log('Done!');
}

runTest();
