const express = require('express');
const TokenAllocationService = require('./services/TokenAllocationService');
const setupRoutes = require('./routes/tokenRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

const tokenService = new TokenAllocationService();

tokenService.addDoctor('D1', 'Dr. Sharma', ['09-10', '10-11', '11-12'], 10);
tokenService.addDoctor('D2', 'Dr. Patel', ['09-10', '10-11', '11-12'], 8);
tokenService.addDoctor('D3', 'Dr. Singh', ['10-11', '11-12', '12-13'], 12);

app.use('/api', setupRoutes(tokenService));

app.get('/', (req, res) => {
  res.json({ 
    message: 'OPD Token Allocation System',
    endpoints: {
      'POST /api/tokens': 'Create new token',
      'POST /api/tokens/:tokenId/cancel': 'Cancel token',
      'POST /api/tokens/:tokenId/no-show': 'Mark no-show',
      'POST /api/tokens/emergency': 'Add emergency token',
      'GET /api/slots/:doctorId/:slotId': 'Get slot status',
      'GET /api/doctors': 'Get all doctors'
    }
  });
});

app.listen(PORT, () => {
  console.log(`OPD Token Allocation System running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = { app, tokenService };
