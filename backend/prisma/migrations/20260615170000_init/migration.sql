-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateNumber" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'car',
    "color" TEXT NOT NULL DEFAULT 'white',
    "phone" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ParkingSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "zone" TEXT NOT NULL DEFAULT 'A',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "sensorStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sensorValue" REAL NOT NULL DEFAULT 100.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "ParkingTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" DATETIME,
    "duration" INTEGER,
    "fee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "ParkingTransaction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParkingTransaction_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ParkingSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SensorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "sensorValue" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SensorLog_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ParkingSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "facilityName" TEXT NOT NULL DEFAULT 'Smart Parking Facility',
    "totalSlots" INTEGER NOT NULL DEFAULT 24,
    "hourlyRate" REAL NOT NULL DEFAULT 5.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "openTime" TEXT NOT NULL DEFAULT '06:00',
    "closeTime" TEXT NOT NULL DEFAULT '23:00',
    "arduinoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sensorThreshold" REAL NOT NULL DEFAULT 30.0,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
CREATE UNIQUE INDEX "ParkingSlot_slotNumber_key" ON "ParkingSlot"("slotNumber");
