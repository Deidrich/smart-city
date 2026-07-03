const router = require('express').Router();
const ctrl = require('../controllers/airQualityController');
/**
 * @swagger
 * /air-quality:
 *   get:
 *     summary: Ambil semua data kualitas udara (diurutkan berdasarkan AQI tertinggi)
 *     tags: [Air Quality]
 *     security: []
 *     responses:
 *       200:
 *         description: Daftar data kualitas udara per kecamatan
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /air-quality/{kecamatan}:
 *   get:
 *     summary: Ambil data kualitas udara berdasarkan nama kecamatan
 *     tags: [Air Quality]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: kecamatan
 *         required: true
 *         schema: { type: string }
 *         example: "Medan Kota"
 *     responses:
 *       200:
 *         description: Data kualitas udara ditemukan
 *       404:
 *         description: Data tidak ditemukan
 */
router.get('/:kecamatan', ctrl.getByKecamatan);

module.exports = router;
