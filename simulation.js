const TokenAllocationService = require('./services/TokenAllocationService');

function simulateOPDDay() {
  console.log('='.repeat(70));
  console.log('OPD TOKEN ALLOCATION SYSTEM - DAY SIMULATION');
  console.log('='.repeat(70));
  console.log();

  const service = new TokenAllocationService();

  console.log('Setting up doctors...\n');
  service.addDoctor('D1', 'Dr. Sharma', ['09-10', '10-11', '11-12'], 5);
  service.addDoctor('D2', 'Dr. Patel', ['09-10', '10-11', '11-12'], 4);
  service.addDoctor('D3', 'Dr. Singh', ['10-11', '11-12', '12-13'], 6);

  console.log('Doctors initialized:');
  service.getAllDoctors().forEach(d => {
    console.log(`  ${d.id} - ${d.name} | Slots: ${d.slots.join(', ')}`);
  });
  console.log();

  console.log('-'.repeat(70));
  console.log('SCENARIO 1: Regular patient registrations');
  console.log('-'.repeat(70));

  const bookings = [
    { doctor: 'D1', slot: '09-10', type: 'ONLINE', patient: 'Patient A' },
    { doctor: 'D1', slot: '09-10', type: 'WALKIN', patient: 'Patient B' },
    { doctor: 'D1', slot: '09-10', type: 'ONLINE', patient: 'Patient C' },
    { doctor: 'D2', slot: '09-10', type: 'FOLLOWUP', patient: 'Patient D' },
    { doctor: 'D2', slot: '09-10', type: 'WALKIN', patient: 'Patient E' },
    { doctor: 'D3', slot: '10-11', type: 'ONLINE', patient: 'Patient F' }
  ];

  bookings.forEach(b => {
    const result = service.createToken(b.doctor, b.slot, b.type);
    console.log(`${b.patient} (${b.type}) → ${b.doctor} ${b.slot}: ${result.message}`);
  });

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 2: Slot capacity reached - priority handling');
  console.log('-'.repeat(70));

  const fillingSlots = [
    { doctor: 'D1', slot: '09-10', type: 'WALKIN', patient: 'Patient G' },
    { doctor: 'D1', slot: '09-10', type: 'ONLINE', patient: 'Patient H' },
    { doctor: 'D1', slot: '09-10', type: 'WALKIN', patient: 'Patient I' },
  ];

  fillingSlots.forEach(b => {
    const result = service.createToken(b.doctor, b.slot, b.type);
    console.log(`${b.patient} (${b.type}) → ${b.doctor} ${b.slot}: ${result.message}`);
  });

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 3: Priority patient replaces lower priority');
  console.log('-'.repeat(70));

  const priorityBooking = service.createToken('D1', '09-10', 'PAID');
  console.log(`Priority Patient (PAID) → D1 09-10: ${priorityBooking.message}`);

  console.log();
  console.log('Current D1 09-10 slot status:');
  const slotStatus = service.getSlotStatus('D1', '09-10');
  console.log(`  Active: ${slotStatus.active}/${slotStatus.capacity}`);
  console.log(`  Waiting: ${slotStatus.waitingList.length}`);

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 4: Emergency patient arrives');
  console.log('-'.repeat(70));

  const emergency = service.addEmergencyToken('D1', '09-10');
  console.log(`Emergency Patient → D1 09-10: ${emergency.message}`);

  const slotAfterEmergency = service.getSlotStatus('D1', '09-10');
  console.log(`  Active: ${slotAfterEmergency.active}/${slotAfterEmergency.capacity}`);
  console.log(`  Waiting: ${slotAfterEmergency.waitingList.length}`);

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 5: Token cancellation and reallocation');
  console.log('-'.repeat(70));

  const cancelResult = service.cancelToken('T2');
  console.log(`Token T2 cancelled: ${cancelResult.message}`);

  const slotAfterCancel = service.getSlotStatus('D1', '09-10');
  console.log(`  Active: ${slotAfterCancel.active}/${slotAfterCancel.capacity}`);
  console.log(`  Waiting: ${slotAfterCancel.waitingList.length}`);

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 6: No-show handling');
  console.log('-'.repeat(70));

  const noShowResult = service.markNoShow('T3');
  console.log(`Token T3 no-show: ${noShowResult.message}`);

  console.log();
  console.log('-'.repeat(70));
  console.log('SCENARIO 7: Multiple doctors - parallel operations');
  console.log('-'.repeat(70));

  const parallelBookings = [
    { doctor: 'D2', slot: '10-11', type: 'PAID', patient: 'Patient J' },
    { doctor: 'D2', slot: '10-11', type: 'EMERGENCY', patient: 'Patient K' },
    { doctor: 'D3', slot: '11-12', type: 'FOLLOWUP', patient: 'Patient L' },
    { doctor: 'D3', slot: '11-12', type: 'ONLINE', patient: 'Patient M' },
  ];

  parallelBookings.forEach(b => {
    const result = service.createToken(b.doctor, b.slot, b.type);
    console.log(`${b.patient} (${b.type}) → ${b.doctor} ${b.slot}: ${result.message}`);
  });

  console.log();
  console.log('-'.repeat(70));
  console.log('FINAL STATUS - All Doctors');
  console.log('-'.repeat(70));

  service.getAllDoctors().forEach(doctor => {
    console.log(`\n${doctor.name} (${doctor.id}):`);
    doctor.slots.forEach(slotId => {
      const status = service.getSlotStatus(doctor.id, slotId);
      if (status.success) {
        console.log(`  ${slotId}: ${status.active}/${status.capacity} active, ${status.waitingList.length} waiting`);
        if (status.active > 0) {
          status.tokens.forEach(t => {
            console.log(`    - ${t.tokenId} (${t.patientType})`);
          });
        }
      }
    });
  });

  console.log();
  console.log('='.repeat(70));
  console.log('SIMULATION COMPLETED');
  console.log('='.repeat(70));
}

if (require.main === module) {
  simulateOPDDay();
}

module.exports = simulateOPDDay;
