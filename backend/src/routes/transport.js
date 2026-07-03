const router = require('express').Router();
const ctrl = require('../controllers/transportController');

/**
 * @swagger
 * /transport:
 *   get:
 *     summary: Ambil semua rute transportasi umum
 *     tags: [Transport]
 *     security: []
 *     responses:
 *       200:
 *         description: Daftar rute transportasi berhasil diambil
 */
router.get('/', ctrl.getRoutes);

/**
 * @swagger
 * /transport/{id}:
 *   get:
 *     summary: Ambil detail rute transportasi beserta jadwal (schedules)
 *     tags: [Transport]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail rute ditemukan
 *       404:
 *         description: Rute tidak ditemukan
 */
router.get('/:id', ctrl.getRouteWithSchedules);

module.exports = router;
