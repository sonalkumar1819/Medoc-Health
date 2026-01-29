const express = require('express');
const router = express.Router();

function setupRoutes(tokenService) {
  router.post('/tokens', (req, res) => {
    const { doctorId, slotId, patientType } = req.body;
    
    if (!doctorId || !slotId || !patientType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: doctorId, slotId, patientType' 
      });
    }

    const result = tokenService.createToken(doctorId, slotId, patientType);
    
    if (!result.success && !result.token) {
      return res.status(400).json(result);
    }

    res.status(result.success ? 201 : 200).json(result);
  });

  router.post('/tokens/:tokenId/cancel', (req, res) => {
    const { tokenId } = req.params;
    const result = tokenService.cancelToken(tokenId);
    
    res.status(result.success ? 200 : 400).json(result);
  });

  router.post('/tokens/:tokenId/no-show', (req, res) => {
    const { tokenId } = req.params;
    const result = tokenService.markNoShow(tokenId);
    
    res.status(result.success ? 200 : 400).json(result);
  });

  router.post('/tokens/emergency', (req, res) => {
    const { doctorId, slotId } = req.body;
    
    if (!doctorId || !slotId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: doctorId, slotId' 
      });
    }

    const result = tokenService.addEmergencyToken(doctorId, slotId);
    res.status(result.success ? 201 : 200).json(result);
  });

  router.get('/slots/:doctorId/:slotId', (req, res) => {
    const { doctorId, slotId } = req.params;
    const result = tokenService.getSlotStatus(doctorId, slotId);
    
    res.status(result.success ? 200 : 404).json(result);
  });

  router.get('/doctors', (req, res) => {
    const doctors = tokenService.getAllDoctors();
    res.json({ success: true, doctors });
  });

  return router;
}

module.exports = setupRoutes;
