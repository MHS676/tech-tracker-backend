const prisma = require('../config/prisma');

// Create Technician (Registration)
exports.createTechnician = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const technician = await prisma.technician.create({
      data: { name, email, password }
    });
    
    res.status(201).json({ success: true, technician });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
      take: 500
    });
    
    res.json({ success: true, locationHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
