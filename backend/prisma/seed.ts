/**
 * Database Seed Script
 * Populates the database with sample users, vehicles, parking slots, and transactions.
 *
 * Run: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // System settings
  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      facilityName: 'Smart Parking Facility',
      totalSlots: 24,
      hourlyRate: 5.0,
      currency: 'USD',
      arduinoEnabled: true,
      sensorThreshold: 30.0,
    },
  });
  console.log('✓ System settings');

  // Users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const operatorPassword = await bcrypt.hash('operator123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@parking.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@parking.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@parking.com' },
    update: {},
    create: {
      username: 'operator',
      email: 'operator@parking.com',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });
  console.log('✓ Users (admin@parking.com / admin123)');

  // Parking slots — 24 slots across 2 floors, 3 zones
  const existingSlots = await prisma.parkingSlot.count();
  if (existingSlots === 0) {
    const zones = ['A', 'B', 'C'];
    const floors = [1, 2];
    let slotNum = 1;

    for (const floor of floors) {
      for (const zone of zones) {
        for (let i = 0; i < 4; i++) {
          await prisma.parkingSlot.create({
            data: {
              slotNumber: `${zone}${floor}-${String(slotNum).padStart(2, '0')}`,
              floor,
              zone,
              status: 'AVAILABLE',
              sensorStatus: 'ACTIVE',
              sensorValue: 100.0,
            },
          });
          slotNum++;
        }
      }
    }
    console.log('✓ 24 parking slots');
  }

  // Sample vehicles
  const vehicles = [
    { plateNumber: 'ABC-1234', ownerName: 'John Smith', vehicleType: 'car', color: 'black', phone: '+1-555-0101' },
    { plateNumber: 'XYZ-5678', ownerName: 'Sarah Johnson', vehicleType: 'suv', color: 'silver', phone: '+1-555-0102' },
    { plateNumber: 'DEF-9012', ownerName: 'Mike Wilson', vehicleType: 'car', color: 'blue', phone: '+1-555-0103' },
    { plateNumber: 'GHI-3456', ownerName: 'Emily Davis', vehicleType: 'motorcycle', color: 'red', phone: '+1-555-0104' },
    { plateNumber: 'JKL-7890', ownerName: 'Robert Brown', vehicleType: 'truck', color: 'white', phone: '+1-555-0105' },
    { plateNumber: 'MNO-2468', ownerName: 'Lisa Anderson', vehicleType: 'van', color: 'gray', phone: '+1-555-0106' },
  ];

  const createdVehicles = [];
  for (const v of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: v.plateNumber },
      update: {},
      create: v,
    });
    createdVehicles.push(vehicle);
  }
  console.log(`✓ ${vehicles.length} vehicles`);

  // Active parking sessions
  const slots = await prisma.parkingSlot.findMany({ take: 8 });
  const occupiedSlots = slots.slice(0, 5);
  const reservedSlots = slots.slice(5, 7);

  for (let i = 0; i < occupiedSlots.length; i++) {
    const slot = occupiedSlots[i];
    const vehicle = createdVehicles[i];
    const hoursAgo = Math.floor(Math.random() * 3) + 1;
    const entryTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    await prisma.parkingSlot.update({
      where: { id: slot.id },
      data: { status: 'OCCUPIED', sensorValue: 12 + Math.random() * 10 },
    });

    await prisma.parkingTransaction.create({
      data: {
        vehicleId: vehicle.id,
        slotId: slot.id,
        entryTime,
        status: 'ACTIVE',
      },
    });
  }

  for (const slot of reservedSlots) {
    await prisma.parkingSlot.update({
      where: { id: slot.id },
      data: { status: 'RESERVED' },
    });
  }

  if (slots[7]) {
    await prisma.parkingSlot.update({
      where: { id: slots[7].id },
      data: { status: 'MAINTENANCE', sensorStatus: 'INACTIVE' },
    });
  }
  console.log('✓ Parking sessions & slot statuses');

  // System logs
  await prisma.systemLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INIT',
      details: 'Database seeded with sample data',
    },
  });
  console.log('✓ System logs');

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:    admin@parking.com / admin123');
  console.log('  Operator: operator@parking.com / operator123\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
