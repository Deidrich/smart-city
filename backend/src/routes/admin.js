const router = require('express').Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);

router.get('/summary', ctrl.summary);
router.get('/bootstrap', ctrl.bootstrap);
router.get('/logs', ctrl.logs);

router.post('/policies', ctrl.createPolicy);
router.put('/policies/:id', ctrl.updatePolicy);
router.delete('/policies/:id', ctrl.deletePolicy);

router.patch('/reports/:type/:id/status', ctrl.updateReportStatus);

router.post('/announcements', ctrl.createAnnouncement);
router.put('/announcements/:id', ctrl.updateAnnouncement);
router.delete('/announcements/:id', ctrl.deleteAnnouncement);

router.patch('/alerts/:id', ctrl.toggleAlert);

router.get('/jobs', ctrl.getJobs);
router.patch('/jobs/:id/status', ctrl.updateJobStatus);

router.post('/master/:type', ctrl.createMaster);
router.put('/master/:type/:id', ctrl.updateMaster);
router.delete('/master/:type/:id', ctrl.deleteMaster);

module.exports = router;
