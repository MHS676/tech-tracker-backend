# 🔌 Socket.IO Testing Guide

## ✅ Problem Solved!
Location history is now populated with 5 location points!

---

## 📍 How Location Tracking Works

### Step 1: Enable Tracking
Before sending location updates, tracking must be enabled:

```bash
PUT http://localhost:3000/api/technician/{tech_id}/toggle-tracking
Body: {"isTracking": true}
```

### Step 2: Send Location via Socket.IO
Location updates are sent in real-time via Socket.IO, **not REST API**.

```javascript
const socket = io('http://localhost:3000');

// Join as technician
socket.emit('joinTech', techId);

// Send location
socket.emit('updateLocation', {
  techId: 'your-tech-id',
  lat: 40.7128,
  lng: -74.0060
});

// Listen for confirmation
socket.on('locationSaved', (data) => {
  console.log('Location saved!', data);
});
```

### Step 3: View History
Now you can query the location history via REST API:

```bash
GET http://localhost:3000/api/technician/{tech_id}/location-history
```

---

## 🧪 Test Script Provided

### Run the test script:
```bash
node test-socket-location.js
```

This will:
- Connect to Socket.IO server
- Send 5 location updates (simulating movement in NYC)
- Save all locations to database
- Populate location history

### Customize the script:
Edit `test-socket-location.js` and change:
- `TECH_ID` - Your technician ID
- `locations` array - Add more coordinates
- Interval time - Change update frequency

---

## 🗺️ Sample Location Data (NYC)

The test script sends these locations:
1. **NYC** (40.7128, -74.0060)
2. **Times Square** (40.7580, -73.9855)
3. **Central Park** (40.7614, -73.9776)
4. **Rockefeller Center** (40.7589, -73.9851)
5. **Empire State Building** (40.7484, -73.9857)

---

## 🔄 Complete Workflow Example

### 1. Register Admin & Technician
```bash
# Already done - you have:
Admin ID: 208f1474-7712-4565-a221-ff3d345f0702
Tech ID: edd5e42b-5ab4-498a-8765-5cbb9e576876
```

### 2. Assign Job
```bash
POST /api/admin/assign-job
{
  "title": "Fix Network Router",
  "description": "Router not working",
  "address": "123 Main St, NYC",
  "adminId": "208f1474-7712-4565-a221-ff3d345f0702",
  "techId": "edd5e42b-5ab4-498a-8765-5cbb9e576876"
}
# Returns job_id
```

### 3. Technician Accepts
```bash
PUT /api/jobs/{job_id}/accept
```

### 4. Start Job (Enable Tracking)
```bash
PUT /api/jobs/{job_id}/start
Body: {"techId": "edd5e42b-5ab4-498a-8765-5cbb9e576876"}
# This sets isTracking: true automatically
```

### 5. Send Real-Time Locations
```bash
# Run the test script or use your mobile app
node test-socket-location.js
```

### 6. Admin Monitors
Admin dashboard connects to Socket.IO and receives real-time updates:
```javascript
socket.emit('joinAdmin');
socket.on('locationUpdate', (data) => {
  // Update map with tech location
  console.log(data); // {techId, lat, lng, timestamp, techName, status}
});
```

### 7. Complete Job (Disable Tracking)
```bash
PUT /api/jobs/{job_id}/complete
Body: {"techId": "edd5e42b-5ab4-498a-8765-5cbb9e576876"}
# This sets isTracking: false
```

### 8. View Location History
```bash
GET /api/technician/{tech_id}/location-history
# Returns all saved location points
```

---

## 🎯 Testing in Postman

### ⚠️ Important: Postman Limitation
Postman **cannot test Socket.IO events** directly in the traditional request tab.

### Options for Testing Socket.IO:

#### Option 1: Use the Test Script ✅ (Recommended)
```bash
node test-socket-location.js
```

#### Option 2: Postman Socket.IO Extension
- Search for "socket.io" in Postman extensions
- Or use Postman's WebSocket support (not Socket.IO)

#### Option 3: Create HTML Test Page
Create `test-location.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Location Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Location Tracking Test</h1>
  <button onclick="sendLocation()">Send Location</button>
  <div id="status"></div>
  
  <script>
    const socket = io('http://localhost:3000');
    const techId = 'edd5e42b-5ab4-498a-8765-5cbb9e576876';
    
    socket.on('connect', () => {
      socket.emit('joinTech', techId);
      document.getElementById('status').innerHTML = '✅ Connected';
    });
    
    function sendLocation() {
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('updateLocation', {
          techId: techId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }
    
    socket.on('locationSaved', (data) => {
      console.log('Location saved!', data);
    });
  </script>
</body>
</html>
```

#### Option 4: Mobile App Integration
In your React Native / Flutter / Ionic app:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.emit('joinTech', techId);

// Get GPS location
navigator.geolocation.watchPosition((position) => {
  socket.emit('updateLocation', {
    techId: techId,
    lat: position.coords.latitude,
    lng: position.coords.longitude
  });
}, null, {
  enableHighAccuracy: true,
  distanceFilter: 10 // Update every 10 meters
});
```

---

## 📊 Current Test Results

✅ **Tracking Status:** Enabled (isTracking: true)  
✅ **Locations Sent:** 5 points  
✅ **History Saved:** All 5 locations in database  
✅ **Status:** ON_WAY

### Now try in Postman:
1. Click **Send** on your "Get Location History" request
2. You should see 5 location points!

---

## 🐛 Troubleshooting

### "Location history is empty"
- ✅ **Solution:** Enable tracking first, then send Socket.IO updates
- Run: `node test-socket-location.js`

### "Tracking error: Location tracking is not enabled"
- ✅ **Solution:** Enable tracking via REST API first
```bash
PUT /api/technician/{id}/toggle-tracking
Body: {"isTracking": true}
```

### "Socket connection failed"
- Check if server is running on port 3000
- Check CORS settings in server.js

### "Cannot find module 'socket.io-client'"
```bash
npm install socket.io-client --save-dev
```

---

## 📱 Production Deployment Tips

1. **Update frequency:** Send location every 5-10 seconds
2. **Battery optimization:** Stop tracking when job is complete
3. **Offline handling:** Queue locations and send when online
4. **Accuracy:** Use `enableHighAccuracy: true` on mobile
5. **Privacy:** Only track when isTracking is true

---

## ✅ Summary

**The issue:** Location history was empty because you were only testing REST endpoints in Postman.

**The solution:** Location updates must be sent via Socket.IO, not REST API.

**Status:** ✅ Fixed! 5 locations now in database and visible in Postman!

**Next step:** Integrate Socket.IO in your frontend mobile/web app for real-time tracking.
