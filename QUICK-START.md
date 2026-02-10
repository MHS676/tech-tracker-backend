# 🚀 QUICK START GUIDE

## Current Status: ✅ RUNNING
Server: http://localhost:3000

## Test IDs (from latest test):
- **Admin ID**: `208f1474-7712-4565-a221-ff3d345f0702`
- **Tech ID**: `edd5e42b-5ab4-498a-8765-5cbb9e576876`

---

## 🔥 Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register Admin
```bash
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin Name","email":"admin@example.com","password":"pass123"}'
```

### 3. Register Technician
```bash
curl -X POST http://localhost:3000/api/technician/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Name","email":"tech@example.com","password":"pass123"}'
```

### 4. Assign Job (replace IDs)
```bash
curl -X POST http://localhost:3000/api/admin/assign-job \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Fix Network",
    "description":"Router issue",
    "address":"123 Main St",
    "adminId":"YOUR_ADMIN_ID",
    "techId":"YOUR_TECH_ID"
  }'
```

### 5. Accept Job (replace JOB_ID)
```bash
curl -X PUT http://localhost:3000/api/jobs/JOB_ID/accept
```

### 6. Start Job - Enable Tracking (replace IDs)
```bash
curl -X PUT http://localhost:3000/api/jobs/JOB_ID/start \
  -H "Content-Type: application/json" \
  -d '{"techId":"YOUR_TECH_ID"}'
```

### 7. Complete Job - Disable Tracking (replace IDs)
```bash
curl -X PUT http://localhost:3000/api/jobs/JOB_ID/complete \
  -H "Content-Type: application/json" \
  -d '{"techId":"YOUR_TECH_ID"}'
```

### 8. Get All Jobs
```bash
curl http://localhost:3000/api/jobs | jq '.'
```

### 9. Get Technician Location History
```bash
curl http://localhost:3000/api/technician/YOUR_TECH_ID/location-history | jq '.'
```

---

## 🎯 WORKFLOW SUMMARY

1. **Admin** registers → Gets `admin_id`
2. **Technician** registers → Gets `tech_id`  
3. **Admin** assigns job → Gets `job_id`
4. **Tech** accepts job → Status: ACCEPTED
5. **Tech** starts job → `isTracking: true`, Status: IN_PROGRESS
6. **Tech** sends location via Socket.IO → Saved to database
7. **Admin** monitors on dashboard → Real-time updates
8. **Tech** completes job → `isTracking: false`, Status: COMPLETED

---

## 📦 POSTMAN

Import: `Tech-Tracker-API.postman_collection.json`

Update these variables in Postman:
- `admin_id`
- `tech_id`
- `job_id`

---

## 🔧 Commands

```bash
# Start server
npm start

# Development (auto-reload)
npm run dev

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (view database)
npx prisma studio
```

---

## 🌐 Socket.IO Connection

```javascript
const socket = io('http://localhost:3000');

// Technician
socket.emit('joinTech', techId);
socket.emit('updateLocation', { techId, lat, lng });

// Admin
socket.emit('joinAdmin');
socket.on('locationUpdate', (data) => console.log(data));
```

---

## 📁 Project Files

- `server.js` - Entry point
- `src/app.js` - Express app
- `src/routes/api.js` - All routes
- `src/controllers/adminController.js` - Admin endpoints
- `src/controllers/techController.js` - Technician endpoints
- `src/sockets/locationSocket.js` - Socket.IO handlers
- `src/config/prisma.js` - Database config
- `prisma/schema.prisma` - Database schema
- `Tech-Tracker-API.postman_collection.json` - API tests
- `test-api.sh` - Automated test script

---

**Everything Ready! 🎉**
