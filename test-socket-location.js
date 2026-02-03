// Socket.IO Location Update Test
// Install: npm install socket.io-client
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

// Replace with your actual technician ID
const TECH_ID = 'edd5e42b-5ab4-498a-8765-5cbb9e576876';

// Simulate location coordinates (New York area)
const locations = [
  { lat: 40.7128, lng: -74.0060 }, // NYC
  { lat: 40.7580, lng: -73.9855 }, // Times Square
  { lat: 40.7614, lng: -73.9776 }, // Central Park
  { lat: 40.7589, lng: -73.9851 }, // Rockefeller Center
  { lat: 40.7484, lng: -73.9857 }, // Empire State Building
];

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Join technician room
  socket.emit('joinTech', TECH_ID);
  console.log(`📍 Joined as technician: ${TECH_ID}`);
  
  let index = 0;
  
  // Send location update every 2 seconds
  const interval = setInterval(() => {
    if (index >= locations.length) {
      console.log('\n✅ All locations sent!');
      console.log('🔍 Check location history in Postman now');
      clearInterval(interval);
      socket.disconnect();
      process.exit(0);
      return;
    }
    
    const location = locations[index];
    console.log(`\n📡 Sending location ${index + 1}/${locations.length}:`, location);
    
    socket.emit('updateLocation', {
      techId: TECH_ID,
      lat: location.lat,
      lng: location.lng
    });
    
    index++;
  }, 2000);
});

socket.on('locationSaved', (data) => {
  console.log('✅ Location saved:', data);
});

socket.on('trackingError', (error) => {
  console.error('❌ Tracking error:', error.message);
  console.log('\n⚠️  Make sure tracking is enabled!');
  console.log('Run this first:');
  console.log(`PUT http://localhost:3000/api/technician/${TECH_ID}/toggle-tracking`);
  console.log('Body: {"isTracking": true}');
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('Make sure the server is running on http://localhost:3000');
  process.exit(1);
});

console.log('🚀 Starting location tracking test...');
console.log('📍 Technician ID:', TECH_ID);
console.log('⏳ Will send 5 location updates...\n');
