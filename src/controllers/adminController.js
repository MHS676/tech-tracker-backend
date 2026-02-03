const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Register Admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Admin already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.create({
      data: { name, email, password: hashedPassword }
    });
    
    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...adminData } = admin;
    
    res.status(201).json({ 
      success: true, 
      admin: adminData,
      token,
      role: 'admin'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...adminData } = admin;
    
    res.json({ 
      success: true, 
      admin: adminData,
      token,
      role: 'admin',
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin creates another Admin (protected route)
exports.createAdminByAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Admin already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.create({
      data: { name, email, password: hashedPassword }
    });
    
    // Remove password from response
    const { password: _, ...adminData } = admin;
    
    res.status(201).json({ 
      success: true, 
      admin: adminData,
      message: 'Admin created successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Admin creates Technician (protected route)
exports.createTechnicianByAdmin = async (req, res) => {
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
    
    // Remove password from response
    const { password: _, ...techData } = technician;
    
    res.status(201).json({ 
      success: true, 
      technician: techData,
      message: 'Technician created successfully'
    });
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
