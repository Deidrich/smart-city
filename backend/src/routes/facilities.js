const router = require('express').Router();
const ctrl = require('../controllers/facilityController');

/**
 * @swagger
 * /facilities:
 *   get:
 *     summary: Ambil daftar fasilitas umum kota (opsional filter berdasarkan jenis)
 *     tags: [Facilities]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: jenis
 *         required: false
 *         schema: { type: string }
 *         example: "Taman"
 *         description: Filter fasilitas berdasarkan jenis
 *     responses:
 *       200:
 *         description: Daftar fasilitas berhasil diambil
 */
router.get('/', ctrl.getAll);

module.exports = router;
