/**
 * QA Test Suite — Smart Parking Management System
 * Run: node qa-test.mjs
 */
const BASE = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;
const failures = [];

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function run() {
  console.log('\n🧪 Smart Parking QA Test Suite\n' + '='.repeat(50));

  // ── Health ──
  console.log('\n[Health]');
  const health = await req('GET', '/health');
  assert('GET /health returns 200', health.status === 200);
  assert('Health response has success=true', health.json.success === true);

  // ── Auth ──
  console.log('\n[Authentication]');
  const badLogin = await req('POST', '/auth/login', { email: 'wrong@test.com', password: 'wrong' });
  assert('Invalid login returns error', badLogin.json.success === false);

  const login = await req('POST', '/auth/login', { email: 'admin@parking.com', password: 'admin123' });
  assert('Admin login succeeds', login.json.success === true);
  const adminToken = login.json.data?.token;
  assert('Admin token received', !!adminToken);

  const opLogin = await req('POST', '/auth/login', { email: 'operator@parking.com', password: 'operator123' });
  const opToken = opLogin.json.data?.token;
  assert('Operator login succeeds', opLogin.json.success === true);

  const noAuth = await req('GET', '/vehicles');
  assert('Protected route rejects without token', noAuth.status === 401);

  const profile = await req('GET', '/auth/profile', null, adminToken);
  assert('GET /auth/profile returns admin user', profile.json.data?.role === 'ADMIN');

  // ── Vehicles ──
  console.log('\n[Vehicles]');
  const vehicles = await req('GET', '/vehicles', null, adminToken);
  assert('GET /vehicles returns list', Array.isArray(vehicles.json.data) && vehicles.json.data.length > 0);

  const newPlate = `QA-${Date.now().toString().slice(-6)}`;
  const createV = await req('POST', '/vehicles', {
    plateNumber: newPlate,
    ownerName: 'QA Tester',
    vehicleType: 'car',
    color: 'blue',
    phone: '+1-555-9999',
  }, adminToken);
  assert('POST /vehicles creates vehicle', createV.status === 201);
  const vehicleId = createV.json.data?.id;

  const dupV = await req('POST', '/vehicles', {
    plateNumber: newPlate,
    ownerName: 'Duplicate',
  }, adminToken);
  assert('Duplicate plate rejected', dupV.json.success === false);

  const updateV = await req('PUT', `/vehicles/${vehicleId}`, { plateNumber: newPlate, ownerName: 'QA Updated', vehicleType: 'suv', color: 'red', phone: '' }, adminToken);
  assert('PUT /vehicles/:id updates vehicle', updateV.json.data?.ownerName === 'QA Updated');

  const searchV = await req('GET', '/vehicles?search=QA', null, adminToken);
  assert('Vehicle search works', searchV.json.data?.some((v) => v.plateNumber === newPlate));

  // ── Parking Slots ──
  console.log('\n[Parking Slots]');
  const slots = await req('GET', '/parking/slots', null, adminToken);
  assert('GET /parking/slots returns 24 slots', slots.json.data?.length === 24);

  const available = slots.json.data?.filter((s) => s.status === 'AVAILABLE');
  assert('Has available slots', available?.length > 0);

  const filterSlots = await req('GET', '/parking/slots?status=OCCUPIED', null, adminToken);
  assert('Slot status filter works', filterSlots.json.data?.every((s) => s.status === 'OCCUPIED'));

  const slotId = available?.[0]?.id;
  const slotDetail = await req('GET', `/parking/slots/${slotId}`, null, adminToken);
  assert('GET /parking/slots/:id returns detail', slotDetail.json.data?.id === slotId);

  // ── Check-in / Check-out ──
  console.log('\n[Entry & Exit]');
  const checkIn = await req('POST', '/parking/checkin', { plateNumber: newPlate, slotId }, adminToken);
  assert('POST /parking/checkin succeeds', checkIn.status === 201);
  assert('Check-in assigns slot', checkIn.json.data?.slot?.slotNumber);

  const doubleCheckIn = await req('POST', '/parking/checkin', { plateNumber: newPlate }, adminToken);
  assert('Double check-in rejected', doubleCheckIn.json.success === false);

  const unregistered = await req('POST', '/parking/checkin', { plateNumber: 'FAKE-0000' }, adminToken);
  assert('Unregistered vehicle check-in rejected', unregistered.json.success === false);

  const active = await req('GET', '/parking/active', null, adminToken);
  assert('Active session listed', active.json.data?.some((t) => t.vehicle?.plateNumber === newPlate));

  const checkOut = await req('POST', '/parking/checkout', { plateNumber: newPlate }, adminToken);
  assert('POST /parking/checkout succeeds', checkOut.json.success === true);
  assert('Fee calculated on checkout', checkOut.json.data?.fee >= 0);
  assert('Duration recorded', checkOut.json.data?.duration !== null);

  const history = await req('GET', `/vehicles/${vehicleId}/history`, null, adminToken);
  assert('Vehicle history has completed session', history.json.data?.some((t) => t.status === 'COMPLETED'));

  // ── Reports ──
  console.log('\n[Reports]');
  const dashboard = await req('GET', '/reports/dashboard', null, adminToken);
  assert('GET /reports/dashboard', dashboard.json.data?.totalSlots === 24);
  assert('Occupancy rate is 0-100', dashboard.json.data?.occupancyRate >= 0 && dashboard.json.data?.occupancyRate <= 100);

  const daily = await req('GET', '/reports/daily', null, adminToken);
  assert('GET /reports/daily', daily.json.data?.date);

  const weekly = await req('GET', '/reports/weekly', null, adminToken);
  assert('GET /reports/weekly returns 7 days', weekly.json.data?.length === 7);

  const monthly = await req('GET', '/reports/monthly', null, adminToken);
  assert('GET /reports/monthly', monthly.json.data?.year);

  const trend = await req('GET', '/reports/occupancy-trend?days=7', null, adminToken);
  assert('GET /reports/occupancy-trend', trend.json.data?.length === 7);

  const vehicleStats = await req('GET', '/reports/vehicle-stats', null, adminToken);
  assert('GET /reports/vehicle-stats', vehicleStats.json.data?.total > 0);

  const hourly = await req('GET', '/reports/hourly-entries', null, adminToken);
  assert('GET /reports/hourly-entries', Array.isArray(hourly.json.data));

  const sensorActivity = await req('GET', '/reports/sensor-activity?limit=10', null, adminToken);
  assert('GET /reports/sensor-activity', sensorActivity.json.data?.length > 0);

  const zones = await req('GET', '/reports/zone-occupancy', null, adminToken);
  assert('GET /reports/zone-occupancy', zones.json.data?.length === 3);

  const logs = await req('GET', '/parking/logs', null, adminToken);
  assert('GET /parking/logs', Array.isArray(logs.json.data));

  // ── Settings ──
  console.log('\n[Settings]');
  const settings = await req('GET', '/settings', null, adminToken);
  assert('GET /settings', settings.json.data?.facilityName);

  const arduino = await req('GET', '/settings/arduino', null, adminToken);
  assert('GET /settings/arduino', arduino.json.data?.status === 'simulated');
  assert('Arduino readings for all slots', arduino.json.data?.readings?.length === 24);

  const updateSettings = await req('PUT', '/settings', { hourlyRate: 6.0 }, adminToken);
  assert('PUT /settings updates hourly rate', updateSettings.json.data?.hourlyRate === 6.0);

  // Restore
  await req('PUT', '/settings', { hourlyRate: 5.0 }, adminToken);

  // ── Admin ──
  console.log('\n[Admin Panel]');
  const users = await req('GET', '/admin/users', null, adminToken);
  assert('GET /admin/users (admin)', users.json.data?.length >= 2);

  const opAdmin = await req('GET', '/admin/users', null, opToken);
  assert('Operator cannot access admin', opAdmin.status === 403);

  const sysLogs = await req('GET', '/admin/logs?limit=5', null, adminToken);
  assert('GET /admin/logs', sysLogs.json.data?.length > 0);

  // ── Cleanup ──
  console.log('\n[Cleanup]');
  const deleteV = await req('DELETE', `/vehicles/${vehicleId}`, null, adminToken);
  assert('DELETE /vehicles/:id', deleteV.json.success === true);

  // ── Validation ──
  console.log('\n[Validation]');
  const badVehicle = await req('POST', '/vehicles', { plateNumber: 'X' }, adminToken);
  assert('Vehicle validation rejects short plate', badVehicle.status === 400);

  const badCheckin = await req('POST', '/parking/checkin', {}, adminToken);
  assert('Check-in validation rejects empty body', badCheckin.status === 400);

  // ── Summary ──
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  }
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('QA suite crashed:', err.message);
  process.exit(1);
});
