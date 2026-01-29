const Doctor = require('../models/Doctor');
const Token = require('../models/Token');
const PATIENT_TYPES = require('../constants');

class TokenAllocationService {
  constructor() {
    this.doctors = new Map();
    this.tokens = new Map();
    this.tokenCounter = 1;
  }

  addDoctor(id, name, slotTimings, capacity = 10) {
    const doctor = new Doctor(id, name, slotTimings, capacity);
    this.doctors.set(id, doctor);
    return doctor;
  }

  getDoctor(doctorId) {
    return this.doctors.get(doctorId);
  }

  createToken(doctorId, slotId, patientType) {
    const doctor = this.getDoctor(doctorId);
    
    if (!doctor) {
      return { success: false, message: 'Doctor not found' };
    }

    if (!doctor.hasSlot(slotId)) {
      return { success: false, message: 'Invalid slot for this doctor' };
    }

    const slot = doctor.getSlot(slotId);
    const patientConfig = PATIENT_TYPES[patientType];
    
    if (!patientConfig) {
      return { success: false, message: 'Invalid patient type' };
    }

    const tokenId = `T${this.tokenCounter++}`;
    const token = new Token(tokenId, patientType, patientConfig.priority, doctorId, slotId);

    if (!slot.isFull()) {
      slot.addToken(token);
      this.tokens.set(tokenId, token);
      return { 
        success: true, 
        token, 
        message: `Token ${tokenId} allocated for ${slotId}` 
      };
    }

    if (slot.hasLowerPriorityThan(token.priority)) {
      const lowestPriorityToken = slot.getLowestPriorityToken();
      slot.removeToken(lowestPriorityToken.tokenId);
      slot.addToWaitingList(lowestPriorityToken);
      
      slot.addToken(token);
      this.tokens.set(tokenId, token);
      
      return { 
        success: true, 
        token, 
        replaced: lowestPriorityToken.tokenId,
        message: `Token ${tokenId} allocated, replaced ${lowestPriorityToken.tokenId}` 
      };
    }

    slot.addToWaitingList(token);
    this.tokens.set(tokenId, token);
    token.status = 'WAITING';
    
    return { 
      success: false, 
      token,
      message: `Slot full. Token ${tokenId} added to waiting list` 
    };
  }

  cancelToken(tokenId) {
    const token = this.tokens.get(tokenId);
    
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    if (token.status !== 'ACTIVE') {
      return { success: false, message: `Token already ${token.status}` };
    }

    token.cancel();
    
    const doctor = this.getDoctor(token.doctorId);
    const slot = doctor.getSlot(token.slotId);
    
    slot.removeToken(tokenId);
    
    const nextToken = slot.getNextFromWaitingList();
    if (nextToken) {
      nextToken.status = 'ACTIVE';
      slot.addToken(nextToken);
      
      return { 
        success: true, 
        message: `Token ${tokenId} cancelled. Token ${nextToken.tokenId} promoted from waiting list`,
        promoted: nextToken.tokenId
      };
    }

    return { success: true, message: `Token ${tokenId} cancelled` };
  }

  addEmergencyToken(doctorId, slotId) {
    return this.createToken(doctorId, slotId, 'EMERGENCY');
  }

  markNoShow(tokenId) {
    const token = this.tokens.get(tokenId);
    
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    if (token.status !== 'ACTIVE') {
      return { success: false, message: `Token is ${token.status}` };
    }

    token.markNoShow();
    
    const doctor = this.getDoctor(token.doctorId);
    const slot = doctor.getSlot(token.slotId);
    
    slot.removeToken(tokenId);
    
    const nextToken = slot.getNextFromWaitingList();
    if (nextToken) {
      nextToken.status = 'ACTIVE';
      slot.addToken(nextToken);
      
      return { 
        success: true, 
        message: `Token ${tokenId} marked no-show. Token ${nextToken.tokenId} promoted`,
        promoted: nextToken.tokenId
      };
    }

    return { success: true, message: `Token ${tokenId} marked no-show` };
  }

  getSlotStatus(doctorId, slotId) {
    const doctor = this.getDoctor(doctorId);
    
    if (!doctor) {
      return { success: false, message: 'Doctor not found' };
    }

    if (!doctor.hasSlot(slotId)) {
      return { success: false, message: 'Invalid slot' };
    }

    const slot = doctor.getSlot(slotId);
    const activeTokens = slot.getActiveTokens();
    
    return {
      success: true,
      slotId,
      capacity: slot.capacity,
      active: activeTokens.length,
      available: slot.capacity - activeTokens.length,
      tokens: activeTokens.map(t => ({
        tokenId: t.tokenId,
        patientType: t.patientType,
        priority: t.priority
      })),
      waitingList: slot.waitingList.map(t => ({
        tokenId: t.tokenId,
        patientType: t.patientType,
        priority: t.priority
      }))
    };
  }

  getAllDoctors() {
    return Array.from(this.doctors.values()).map(d => ({
      id: d.id,
      name: d.name,
      slots: Array.from(d.slots.keys())
    }));
  }
}

module.exports = TokenAllocationService;
