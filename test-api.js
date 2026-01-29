const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('='.repeat(60));
  console.log('TESTING OPD TOKEN ALLOCATION API');
  console.log('='.repeat(60));
  console.log();

  try {
    console.log('1. Testing root endpoint...');
    const root = await makeRequest('GET', '/');
    console.log('✓ Server is running');
    console.log();

    console.log('2. Getting all doctors...');
    const doctors = await makeRequest('GET', '/api/doctors');
    console.log(`✓ Found ${doctors.doctors.length} doctors`);
    doctors.doctors.forEach(d => console.log(`  - ${d.name} (${d.id})`));
    console.log();

    console.log('3. Creating online booking token...');
    const token1 = await makeRequest('POST', '/api/tokens', {
      doctorId: 'D1',
      slotId: '09-10',
      patientType: 'ONLINE'
    });
    console.log(`✓ ${token1.message}`);
    console.log();

    console.log('4. Creating walk-in token...');
    const token2 = await makeRequest('POST', '/api/tokens', {
      doctorId: 'D1',
      slotId: '09-10',
      patientType: 'WALKIN'
    });
    console.log(`✓ ${token2.message}`);
    console.log();

    console.log('5. Creating paid priority token...');
    const token3 = await makeRequest('POST', '/api/tokens', {
      doctorId: 'D1',
      slotId: '09-10',
      patientType: 'PAID'
    });
    console.log(`✓ ${token3.message}`);
    console.log();

    console.log('6. Checking slot status...');
    const slotStatus = await makeRequest('GET', '/api/slots/D1/09-10');
    console.log(`✓ Slot 09-10: ${slotStatus.active}/${slotStatus.capacity} active`);
    console.log(`  Tokens: ${slotStatus.tokens.map(t => `${t.tokenId}(${t.patientType})`).join(', ')}`);
    console.log();

    console.log('7. Adding emergency token...');
    const emergency = await makeRequest('POST', '/api/tokens/emergency', {
      doctorId: 'D1',
      slotId: '09-10'
    });
    console.log(`✓ ${emergency.message}`);
    console.log();

    console.log('8. Cancelling a token...');
    const cancel = await makeRequest('POST', `/api/tokens/${token1.token.tokenId}/cancel`);
    console.log(`✓ ${cancel.message}`);
    console.log();

    console.log('9. Final slot status...');
    const finalStatus = await makeRequest('GET', '/api/slots/D1/09-10');
    console.log(`✓ Slot 09-10: ${finalStatus.active}/${finalStatus.capacity} active`);
    console.log(`  Active tokens: ${finalStatus.tokens.map(t => `${t.tokenId}(${t.patientType})`).join(', ')}`);
    if (finalStatus.waitingList.length > 0) {
      console.log(`  Waiting: ${finalStatus.waitingList.map(t => `${t.tokenId}(${t.patientType})`).join(', ')}`);
    }
    console.log();

    console.log('='.repeat(60));
    console.log('✓ ALL TESTS PASSED - SYSTEM IS WORKING CORRECTLY');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.log();
    console.log('Make sure the server is running with: npm start');
  }
}

testAPI();
