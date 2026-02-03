const prisma = require('../config/prisma');

// Create Admin (Registration)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const admin = await prisma.admin.create({
      data: { name, email, password }
    });
    
    res.status(201).json({ success: true, admin });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        jobs: {
          include: {
            technician: true
          }
        }
      }
    });
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create/Assign Job to Technician
exports.assignJob = async (req, res) => {
  try {
    const { title, description, address, adminId, techId } = req.body;
    
    const job = await prisma.job.create({
      data: {
        title,
        description,
        address,
        adminId,
        techId,
        status: 'ASSIGNED'
      },
      include: {
        technician: true,
        admin: true
      }
    });
    
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        technician: true,
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

// Get Job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        technician: {
          include: {
            locationHistory: {
              orderBy: {
                recordedAt: 'desc'
              },
              take: 50
            }
          }
        },
        admin: true
      }
    });
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
