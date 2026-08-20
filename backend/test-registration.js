const axios = require('axios');

async function testRegistration() {
  const BASE_URL = 'http://localhost:5000/api/vendors';
  const timestamp = Date.now();
  const testVendor = {
    fullName: `Test Vendor ${timestamp}`,
    email: `test${timestamp}@example.com`,
    mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`, // 10 digit random
    password: 'password123'
  };

  try {
    console.log('1. Registering vendor...');
    await axios.post(`${BASE_URL}/register`, testVendor);
    
    console.log('2. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email: testVendor.email,
      password: testVendor.password
    });
    
    const token = loginRes.data.token;
    console.log('Got token:', token ? 'Yes' : 'No');
    
    const headers = { Authorization: `Bearer ${token}` };

    console.log('3. Saving business details (without optional fields)...');
    // Notice gstNumber, panNumber, etc. are missing/empty
    await axios.post(`${BASE_URL}/onboarding/business`, {
      storeName: 'Test Shop',
      businessType: 'Partnership',
      gstNumber: '',
      panNumber: '',
      address: {
        addressLine1: '123 Test St',
        city: 'Pune',
        state: 'MH',
        pincode: '411001'
      }
    }, { headers });

    // Step 4: Documents (skip since they are optional)
    console.log('4. Skipping document uploads...');

    console.log('5. Saving bank details (with empty fields)...');
    await axios.post(`${BASE_URL}/onboarding/bank`, {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      accountNumberLast4: '',
      ifscCode: '',
      accountType: 'Current'
    }, { headers });

    console.log('6. Submitting application...');
    await axios.post(`${BASE_URL}/onboarding/submit`, {}, { headers });
    
    console.log('✅ TEST PASSED: Vendor registration succeeded without optional fields.');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
  }
}

testRegistration();
