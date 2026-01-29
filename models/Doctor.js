const Slot = require('./Slot');

class Doctor {
  constructor(id, name, slotTimings, capacity = 10) {
    this.id = id;
    this.name = name;
    this.slots = new Map();
    
    slotTimings.forEach(timing => {
      this.slots.set(timing, new Slot(timing, capacity));
    });
  }

  getSlot(slotId) {
    return this.slots.get(slotId);
  }

  hasSlot(slotId) {
    return this.slots.has(slotId);
  }

  getAllSlots() {
    return Array.from(this.slots.values());
  }
}

module.exports = Doctor;
