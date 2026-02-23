const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Register Technician (Public)
exports.createTechnician = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if technician already exists
    const existingTech = await prisma.technician.findUnique({ where: { email } });
    if (existingTech) {
      return res.status(400).json({ success: false, error: 'Technician already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const technician = await prisma.technician.create({
      data: { name, email, password: hashedPassword }
    });
    
    // Generate token
    const token = jwt.sign(
      { id: technician.id, email: technician.email, role: 'technician' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...techData } = technician;
    
    res.status(201).json({ 
      success: true, 
      technician: techData,
      token,
      role: 'technician'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Technician Login
exports.loginTechnician = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const technician = await prisma.technician.findUnique({ where: { email } });
    if (!technician) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, technician.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: technician.id, email: technician.email, role: 'technician' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...techData } = technician;
    
    res.json({ 
      success: true, 
      technician: techData,
      token,
      role: 'technician',
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Technicians
exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
      include: {
        jobs: true
      }
    });
    res.json({ success: true, technicians });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Technician by ID with location history
exports.getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;
    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            admin: true
          }
        },
        locationHistory: {
          orderBy: {
            recordedAt: 'desc'
          },
          take: 100
        }
      }
    });
    
    if (!technician) {
      return res.status(404).json({ success: false, error: 'Technician not found' });
    }
    
    res.json({ success: true, technician });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Jobs assigned to a Technician
exports.getTechnicianJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await prisma.job.findMany({
      where: { techId: id },
      include: {
        admin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Accept Job
exports.acceptJob = async (req, res) => {
  try {
    const { id } = req.params; // job id
    
    const job = await prisma.job.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      include: {
        technician: true,
        admin: true
      }
    });
    
    res.json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Start Job (Begin location tracking)
exports.startJob = async (req, res) => {
  try {
    const { id } = req.params; // job id
    const { techId } = req.body;
    
    // Update job status
    const job = await prisma.job.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });
    
    // Enable tracking for technician
    await prisma.technician.update({
      where: { id: techId },
      data: {
        isTracking: true,
        status: 'ON_WAY'
      }
    });
    
    res.json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Complete Job (Turn off location tracking)
exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params; // job id
    const { techId } = req.body;
    
    // Update job status
    const job = await prisma.job.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        technician: true,
        admin: true
      }
    });
    
    // Disable tracking for technician
    await prisma.technician.update({
      where: { id: techId },
      data: {
        isTracking: false,
        status: 'ONLINE'
      }
    });
    
    res.json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Toggle Location Tracking
exports.toggleTracking = async (req, res) => {
  try {
    const { id } = req.params; // tech id
    const { isTracking } = req.body;
    
    const technician = await prisma.technician.update({
      where: { id },
      data: {
        isTracking,
        status: isTracking ? 'ON_WAY' : 'ONLINE'
      }
    });
    
    res.json({ success: true, technician });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Location History
exports.getLocationHistory = async (req, res) => {
  try {
    const { id } = req.params; // tech id
    const locationHistory = await prisma.locationHistory.findMany({
      where: { techId: id },
      orderBy: {
        recordedAt: 'desc'
      },
      take: 500,
      include: {
        job: {
          select: { id: true, title: true }
        }
      }
    });
    
    res.json({ success: true, locationHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all active routes (technicians currently on jobs)
exports.getActiveRoutes = async (req, res) => {
  try {
    const routes = await prisma.technicianRoute.findMany({
      where: {
        completedAt: null
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            lastLat: true,
            lastLng: true,
            status: true,
            isTracking: true,
            lastPing: true
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
    
    res.json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get route for a specific job
exports.getJobRoute = async (req, res) => {
  try {
    const { jobId } = req.params;
    
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
    
    res.json({ success: true, route, locationHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all technicians with current location
exports.getTechniciansWithLocation = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
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
    
    res.json({ success: true, technicians });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Background location update (no auth required, called by background task)
exports.updateBackgroundLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, jobId } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude required' });
    }

    // Update technician location
    const tech = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastPing: new Date(),
      },
    });

    // Save to location history
    await prisma.locationHistory.create({
      data: {
        technicianId: parseInt(id),
        latitude: lat,
        longitude: lng,
        jobId: jobId ? parseInt(jobId) : null,
        timestamp: new Date(),
      },
    });

    // Emit socket update to admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('location:update', {
        techId: parseInt(id),
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Background location update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
