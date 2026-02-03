const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const techController = require('../controllers/techController');

// ========== Admin Routes ==========
router.post('/admin/register', adminController.createAdmin);
router.get('/admin/all', adminController.getAllAdmins);
router.post('/admin/assign-job', adminController.assignJob);
router.get('/jobs', adminController.getAllJobs);
router.get('/jobs/:id', adminController.getJobById);

// ========== Technician Routes ==========
router.post('/technician/register', techController.createTechnician);
router.get('/technician/all', techController.getAllTechnicians);
router.get('/technician/:id', techController.getTechnicianById);
router.get('/technician/:id/jobs', techController.getTechnicianJobs);

// ========== Job Workflow Routes ==========
router.put('/jobs/:id/accept', techController.acceptJob);
router.put('/jobs/:id/start', techController.startJob);
router.put('/jobs/:id/complete', techController.completeJob);

// ========== Location Tracking Routes ==========
router.put('/technician/:id/toggle-tracking', techController.toggleTracking);
router.get('/technician/:id/location-history', techController.getLocationHistory);

module.exports = router;
