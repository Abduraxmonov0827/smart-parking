# API Documentation

Base URL: `http://localhost:3001/api`

All protected endpoints require: `Authorization: Bearer <token>`

Response format:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Error message" }
```

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{ "username": "john", "email": "john@example.com", "password": "password123" }
```

### POST /auth/login
Authenticate and receive JWT token.

**Body:**
```json
{ "email": "admin@parking.com", "password": "admin123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "admin", "email": "...", "role": "ADMIN" },
    "token": "eyJhbG..."
  }
}
```

### GET /auth/profile
Get current user profile. **Auth required.**

---

## Vehicles

### GET /vehicles?search=ABC
List all vehicles. Optional search by plate or owner. **Auth required.**

### GET /vehicles/:id
Get vehicle by ID. **Auth required.**

### GET /vehicles/:id/history
Get parking history for a vehicle. **Auth required.**

### POST /vehicles
Register a new vehicle. **Auth required.**

**Body:**
```json
{ "plateNumber": "ABC-1234", "ownerName": "John Smith", "vehicleType": "car", "color": "black", "phone": "+1-555-0101" }
```

### PUT /vehicles/:id
Update vehicle. **Auth required.**

### DELETE /vehicles/:id
Delete vehicle (must not have active session). **Auth required.**

---

## Parking

### GET /parking/slots?status=AVAILABLE&search=A1&zone=A
List parking slots with optional filters. **Auth required.**

### GET /parking/slots/:id
Get slot details with sensor logs. **Auth required.**

### POST /parking/checkin
Vehicle check-in. **Auth required.**

**Body:**
```json
{ "plateNumber": "ABC-1234", "slotId": "optional-uuid" }
```

### POST /parking/checkout
Vehicle check-out with fee calculation. **Auth required.**

**Body:**
```json
{ "plateNumber": "ABC-1234" }
```
or
```json
{ "transactionId": "uuid" }
```

### GET /parking/active
List active parking sessions. **Auth required.**

### GET /parking/logs?status=COMPLETED
Get transaction logs. **Auth required.**

---

## Reports

### GET /reports/dashboard
Dashboard statistics (occupancy, revenue, entries/exits). **Auth required.**

### GET /reports/daily?date=2026-06-15
Daily report. **Auth required.**

### GET /reports/weekly
7-day summary report. **Auth required.**

### GET /reports/monthly?year=2026&month=6
Monthly report with transactions. **Auth required.**

### GET /reports/occupancy-trend?days=7
Occupancy rate trend. **Auth required.**

### GET /reports/vehicle-stats
Vehicle type breakdown. **Auth required.**

### GET /reports/hourly-entries
Today's hourly entry distribution. **Auth required.**

### GET /reports/sensor-activity?limit=50
Recent Arduino sensor readings. **Auth required.**

### GET /reports/zone-occupancy
Zone-wise utilization. **Auth required.**

### GET /reports/recent-activity
Last 10 transactions. **Auth required.**

---

## Settings

### GET /settings
Get system settings. **Auth required.**

### PUT /settings
Update settings. **Auth required (ADMIN/OPERATOR).**

**Body:**
```json
{
  "facilityName": "Smart Parking",
  "hourlyRate": 5.0,
  "arduinoEnabled": true,
  "sensorThreshold": 30.0
}
```

### GET /settings/arduino
Live Arduino sensor readings. **Auth required.**

---

## Admin

All admin endpoints require **ADMIN** role.

### GET /admin/users
List all users.

### PUT /admin/users/:id
Update user role/details.

**Body:**
```json
{ "role": "OPERATOR" }
```

### DELETE /admin/users/:id
Delete user.

### GET /admin/logs?limit=100
System activity logs.

---

## Health Check

### GET /health
No authentication required.

```json
{ "success": true, "data": { "status": "ok", "version": "2.0.0" } }
```
