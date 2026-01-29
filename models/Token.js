class Token {
  constructor(tokenId, patientType, priority, doctorId, slotId) {
    this.tokenId = tokenId;
    this.patientType = patientType;
    this.priority = priority;
    this.doctorId = doctorId;
    this.slotId = slotId;
    this.status = 'ACTIVE';
    this.createdAt = new Date();
  }

  cancel() {
    this.status = 'CANCELLED';
  }

  markNoShow() {
    this.status = 'NO_SHOW';
  }

  isActive() {
    return this.status === 'ACTIVE';
  }
}

module.exports = Token;
