const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const techController = require('../controllers/techController');
const { authenticate, isAdmin, isTechnician } = require('../middleware/auth');

// ========== Public Auth Routes (No Token Required) ==========
// Admin Auth
router.post('/admin/register', adminController.createAdmin);
router.post('/admin/login', adminController.loginAdmin);

// Technician Auth
router.post('/technician/register', techController.createTechnician);
router.post('/technician/login', techController.loginTechnician);

// ========== Admin Protected Routes (Admin Token Required) ==========
router.get('/admin/all', authenticate, isAdmin, adminController.getAllAdmins);
router.post('/admin/create-admin', authenticate, isAdmin, adminController.createAdminByAdmin);
router.put('/admin/:id', authenticate, isAdmin, adminController.updateAdmin);
router.delete('/admin/:id', authenticate, isAdmin, adminController.deleteAdmin);
router.post('/admin/create-technician', authenticate, isAdmin, adminController.createTechnicianByAdmin);
router.put('/admin/technician/:id', authenticate, isAdmin, adminController.updateTechnician);
router.delete('/admin/technician/:id', authenticate, isAdmin, adminController.deleteTechnician);
router.post('/admin/assign-job', authenticate, isAdmin, adminController.assignJob);
router.get('/jobs', authenticate, adminController.getAllJobs);
router.get('/jobs/:id', authenticate, adminController.getJobById);

// ========== Technician Protected Routes (Technician Token Required) ==========
router.get('/technician/all', authenticate, techController.getAllTechnicians);
router.get('/technician/:id', authenticate, techController.getTechnicianById);
router.get('/technician/:id/jobs', authenticate, techController.getTechnicianJobs);

// ========== Job Workflow Routes (Token Required) ==========
router.put('/jobs/:id/accept', authenticate, isTechnician, techController.acceptJob);
router.put('/jobs/:id/start', authenticate, isTechnician, techController.startJob);
router.put('/jobs/:id/complete', authenticate, isTechnician, techController.completeJob);

// ========== Location Tracking Routes (Token Required) ==========
router.put('/technician/:id/toggle-tracking', authenticate, isTechnician, techController.toggleTracking);
router.get('/technician/:id/location-history', authenticate, techController.getLocationHistory);
router.get('/routes/active', authenticate, techController.getActiveRoutes);
router.get('/routes/job/:jobId', authenticate, techController.getJobRoute);
router.get('/technicians/locations', authenticate, techController.getTechniciansWithLocation);

module.exports = router;
