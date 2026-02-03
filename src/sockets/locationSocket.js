const prisma = require('../config/prisma');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Technician joins room with their ID
    socket.on('joinTech', (techId) => {
      socket.join(`tech_${techId}`);
      console.log(`Technician ${techId} joined room`);
    });

    // Admin joins to monitor all technicians
    socket.on('joinAdmin', () => {
      socket.join('admin_room');
      console.log('Admin joined monitoring room');
    });

    // When technician sends location update
    socket.on('updateLocation', async (data) => {
      const { techId, lat, lng } = data;

      try {
        // Check if technician is currently tracking
        const tech = await prisma.technician.findUnique({
          where: { id: techId }
        });

        if (!tech || !tech.isTracking) {
          socket.emit('trackingError', { 
            message: 'Location tracking is not enabled' 
          });
          return;
        }

        // 1. Update the technician's current position
        await prisma.technician.update({
          where: { id: techId },
          data: { 
            lastLat: lat, 
            lastLng: lng, 
            lastPing: new Date() 
          }
        });

        // 2. Save to History table
        await prisma.locationHistory.create({
          data: { techId, lat, lng }
        });

        // 3. Emit to Admin Dashboard
        io.to('admin_room').emit('locationUpdate', { 
          techId, 
          lat, 
          lng,
          timestamp: new Date(),
          techName: tech.name,
          status: tech.status
        });

        // 4. Confirm to technician
        socket.emit('locationSaved', { 
          success: true, 
          lat, 
          lng 
        });

      } catch (error) {
        console.error('Error saving location:', error);
        socket.emit('trackingError', { 
          message: 'Failed to save location' 
        });
      }
    });

    // Admin requests current location of all active technicians
    socket.on('requestAllLocations', async () => {
      try {
        const techs = await prisma.technician.findMany({
          where: {
            isTracking: true,
            lastLat: { not: null },
            lastLng: { not: null }
          },
          select: {
            id: true,
            name: true,
            email: true,
            lastLat: true,
            lastLng: true,
            status: true,
            lastPing: true
          }
        });

        socket.emit('allLocations', techs);
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    });

    // Admin requests location history for specific technician
    socket.on('requestHistory', async (techId) => {
      try {
        const history = await prisma.locationHistory.findMany({
          where: { techId },
          orderBy: { recordedAt: 'desc' },
          take: 100
        });

        socket.emit('locationHistory', { techId, history });
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
