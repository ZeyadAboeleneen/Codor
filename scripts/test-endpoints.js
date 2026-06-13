const email = `test_endpoint_${Date.now()}@example.com`;
const password = 'Password123!';
const name = 'Test Endpoint User';

async function runTest() {
  console.log('🔄 1. Calling /api/auth/register...');
  try {
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    console.log('Registration Status:', regRes.status);
    const regData = await regRes.json();
    console.log('Registration Response:', JSON.stringify(regData, null, 2));

    if (!regRes.ok) {
      console.error('❌ Registration failed');
      return;
    }

    console.log('\n🔄 2. Calling /api/auth/login...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('Login Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (loginRes.ok) {
      console.log('✅ Login succeeded!');
    } else {
      console.error('❌ Login failed!');
    }
  } catch (error) {
    console.error('❌ Error during request:', error.message);
  }
}

runTest();
