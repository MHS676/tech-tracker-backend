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
      const { techId, lat, lng, jobId } = data;

      try {
        // Check if technician is currently tracking
        const tech = await prisma.technician.findUnique({
          where: { id: techId },
          include: {
            jobs: {
              where: { status: 'IN_PROGRESS' },
              take: 1
            }
          }
        });

        if (!tech || !tech.isTracking) {
          socket.emit('trackingError', { 
            message: 'Location tracking is not enabled' 
          });
          return;
        }

        const activeJobId = jobId || tech.currentJobId || tech.jobs[0]?.id;

        // 1. Update the technician's current position
        await prisma.technician.update({
          where: { id: techId },
          data: { 
            lastLat: lat, 
            lastLng: lng, 
            lastPing: new Date() 
          }
        });

        // 2. Save to History table with job reference
        await prisma.locationHistory.create({
          data: { 
            techId, 
            lat, 
            lng,
            jobId: activeJobId
          }
        });

        // 3. Emit to Admin Dashboard with full info
        io.to('admin_room').emit('locationUpdate', { 
          techId, 
          lat, 
          lng,
          jobId: activeJobId,
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

    // Start job route (mark start point)
    socket.on('startRoute', async (data) => {
      const { techId, jobId, lat, lng } = data;

      try {
        // Create route record with start point
        const route = await prisma.technicianRoute.create({
          data: {
            techId,
            jobId,
            startLat: lat,
            startLng: lng
          }
        });

        // Save start point to location history
        await prisma.locationHistory.create({
          data: {
            techId,
            jobId,
            lat,
            lng,
            isStartPoint: true
          }
        });

        // Update technician with current job
        await prisma.technician.update({
          where: { id: techId },
          data: {
            currentJobId: jobId,
            isTracking: true,
            status: 'ON_WAY',
            lastLat: lat,
            lastLng: lng,
            lastPing: new Date()
          }
        });

        // Notify admin about route start
        io.to('admin_room').emit('routeStarted', {
          techId,
          jobId,
          startLat: lat,
          startLng: lng,
          timestamp: new Date()
        });

        socket.emit('routeStarted', { success: true, route });
      } catch (error) {
        console.error('Error starting route:', error);
        socket.emit('trackingError', { message: 'Failed to start route' });
      }
    });

    // End job route (mark end point)
    socket.on('endRoute', async (data) => {
      const { techId, jobId, lat, lng } = data;

      try {
        // Update route with end point
        const route = await prisma.technicianRoute.update({
          where: { jobId },
          data: {
            endLat: lat,
            endLng: lng,
            completedAt: new Date()
          }
        });

        // Save end point to location history
        await prisma.locationHistory.create({
          data: {
            techId,
            jobId,
            lat,
            lng,
            isEndPoint: true
          }
        });

        // Update technician
        await prisma.technician.update({
          where: { id: techId },
          data: {
            currentJobId: null,
            isTracking: false,
            status: 'ONLINE',
            lastLat: lat,
            lastLng: lng,
            lastPing: new Date()
          }
        });

        // Notify admin about route completion
        io.to('admin_room').emit('routeCompleted', {
          techId,
          jobId,
          endLat: lat,
          endLng: lng,
          route,
          timestamp: new Date()
        });

        socket.emit('routeCompleted', { success: true, route });
      } catch (error) {
        console.error('Error ending route:', error);
        socket.emit('trackingError', { message: 'Failed to end route' });
      }
    });

    // Technician toggles GPS on/off (without job context)
    socket.on('toggleGPS', async (data) => {
      const { techId, enabled, lat, lng } = data;

      try {
        const tech = await prisma.technician.update({
          where: { id: techId },
          data: {
            isTracking: enabled,
            status: enabled ? 'ONLINE' : 'OFFLINE',
            lastLat: lat || undefined,
            lastLng: lng || undefined,
            lastPing: new Date()
          }
        });

        // If GPS is enabled with location, save to history
        if (enabled && lat && lng) {
          await prisma.locationHistory.create({
            data: { techId, lat, lng }
          });
        }

        // Notify admin about GPS status change
        io.to('admin_room').emit('techGPSChanged', {
          techId,
          techName: tech.name,
          enabled,
          lat,
          lng,
          status: tech.status,
          timestamp: new Date()
        });

        socket.emit('gpsToggled', { success: true, enabled, tech });
      } catch (error) {
        console.error('Error toggling GPS:', error);
        socket.emit('trackingError', { message: 'Failed to toggle GPS' });
      }
    });

    // Get all technicians (with or without GPS)
    socket.on('requestAllTechnicians', async () => {
      try {
        const techs = await prisma.technician.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            lastLat: true,
            lastLng: true,
            status: true,
            lastPing: true,
            isTracking: true,
            currentJobId: true,
            jobs: {
              where: { 
                status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] }
              },
              select: {
                id: true,
                title: true,
                status: true
              },
              take: 1
            }
          },
          orderBy: [
            { isTracking: 'desc' },
            { lastPing: 'desc' }
          ]
        });

        socket.emit('allTechnicians', techs);
      } catch (error) {
        console.error('Error fetching all technicians:', error);
      }
    });

    // Admin requests current location of all active technicians
    socket.on('requestAllLocations', async () => {
      try {
        const techs = await prisma.technician.findMany({
          where: {
            OR: [
              { isTracking: true },
              { status: { not: 'OFFLINE' } }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true,
            lastLat: true,
            lastLng: true,
            status: true,
            lastPing: true,
            isTracking: true,
            currentJobId: true,
            jobs: {
              where: { status: 'IN_PROGRESS' },
              select: {
                id: true,
                title: true,
                address: true,
                addressLat: true,
                addressLng: true
              },
              take: 1
            }
          }
        });

        socket.emit('allLocations', techs);
      } catch (error) {
        console.error('Error fetching all locations:', error);
      }
    });

    // Admin requests active routes (jobs in progress with location data)
    socket.on('requestActiveRoutes', async () => {
      try {
        const activeRoutes = await prisma.technicianRoute.findMany({
          where: {
            completedAt: null
          },
          include: {
            technician: {
              select: {
                id: true,
                name: true,
                lastLat: true,
                lastLng: true,
                status: true
              }
            },
            job: {
              select: {
                id: true,
                title: true,
                address: true,
                addressLat: true,
                addressLng: true,
                status: true
              }
            }
          }
        });

        socket.emit('activeRoutes', activeRoutes);
      } catch (error) {
        console.error('Error fetching active routes:', error);
      }
    });

    // Get route history for a specific job
    socket.on('requestJobRoute', async (jobId) => {
      try {
        const route = await prisma.technicianRoute.findUnique({
          where: { jobId },
          include: {
            technician: {
              select: { id: true, name: true }
            },
            job: {
              select: { id: true, title: true, address: true }
            }
          }
        });

        const locationHistory = await prisma.locationHistory.findMany({
          where: { jobId },
          orderBy: { recordedAt: 'asc' }
        });

        socket.emit('jobRoute', { route, locationHistory });
      } catch (error) {
        console.error('Error fetching job route:', error);
      }
    });

    // Admin requests location history for specific technician
    socket.on('requestHistory', async (techId) => {
      try {
        const history = await prisma.locationHistory.findMany({
          where: { techId },
          orderBy: { recordedAt: 'desc' },
          take: 100,
          include: {
            job: {
              select: { id: true, title: true }
            }
          }
        });

        socket.emit('locationHistory', { techId, history });
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Find and update any technician associated with this socket
      // Note: You'd need to track socket -> techId mapping
      // For now, we'll rely on lastPing timeout on the frontend
    });
  });
};
