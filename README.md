# Tech Tracker Backend - Project Complete! 🚀

## Project Overview
Complete backend system for tracking technicians with real-time location monitoring.

## Workflow
1. **Admin assigns work** → Creates job and assigns to technician
2. **Technician accepts** → Updates job status to ACCEPTED
3. **Location tracking starts** → Real-time location updates via Socket.IO
4. **Job completion** → Technician clicks to turn off tracking
5. **Project complete** → Job marked as COMPLETED

## Database Schema
- **Admin**: Manages and assigns jobs
- **Technician**: Receives jobs and shares location
- **Job**: Tracks work assignments and status
- **LocationHistory**: Stores all location points

## API Endpoints

### Admin Routes
- `POST /api/admin/register` - Register new admin
- `GET /api/admin/all` - Get all admins
- `POST /api/admin/assign-job` - Assign job to technician
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job

### Technician Routes
- `POST /api/technician/register` - Register new technician
- `GET /api/technician/all` - Get all technicians
- `GET /api/technician/:id` - Get technician details
- `GET /api/technician/:id/jobs` - Get technician's jobs

### Job Workflow Routes
- `PUT /api/jobs/:id/accept` - Accept assigned job
- `PUT /api/jobs/:id/start` - Start job (enable tracking)
- `PUT /api/jobs/:id/complete` - Complete job (disable tracking)

### Location Tracking Routes
- `PUT /api/technician/:id/toggle-tracking` - Toggle location tracking
- `GET /api/technician/:id/location-history` - Get location history

## Socket.IO Events

### Technician Events
- `joinTech` - Join technician room
- `updateLocation` - Send location update (lat, lng)
- Listen to: `locationSaved`, `trackingError`

### Admin Events
- `joinAdmin` - Join admin monitoring room
- `requestAllLocations` - Get all active technicians' locations
- `requestHistory` - Get specific technician's history
- Listen to: `locationUpdate`, `allLocations`, `locationHistory`

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (.env file should have):**
   ```
   DATABASE_URL=your_postgres_connection_string
   PORT=3000
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Postman Collection
Import the `Tech-Tracker-API.postman_collection.json` file into Postman to test all endpoints.

### How to use:
1. Register an Admin
2. Register a Technician
3. Copy their IDs and update Postman variables
4. Assign a job from Admin to Technician
5. Technician accepts the job
6. Technician starts the job (tracking enabled)
7. Use Socket.IO to send location updates
8. Technician completes the job (tracking disabled)

## Tech Stack
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.IO (Real-time location)
- CORS enabled

---
**Status: ✅ Project Complete**
# tech-tracker-backend
# tech-tracker-backend
