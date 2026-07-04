const express = require('express');
const router = express.Router();
const { getProfil, updateProfil, getStatistik, claimVoucher, addPoints } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @swagger
 * /users/profil:
 *   get:
 *     summary: Ambil profil lengkap user login
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Data profil user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/profil', authMiddleware, getProfil);

/**
 * @swagger
 * /users/profil:
 *   put:
 *     summary: Update profil user login (nama, kota, foto profil)
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nama: { type: string, example: "Budi Santoso" }
 *               kota: { type: string, example: "Medan" }
 *               foto_profil:
 *                 type: string
 *                 format: binary
 *                 description: File gambar (jpg, png, webp), maks 5MB
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */
router.put('/profil', authMiddleware, upload.single('foto_profil'), updateProfil);

/**
 * @swagger
 * /users/statistik:
 *   get:
 *     summary: Ambil statistik partisipasi user login (vote, laporan, login)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Statistik partisipasi user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVote: { type: integer, example: 4 }
 *                 totalLaporan: { type: integer, example: 2 }
 *                 totalLogin: { type: integer, example: 15 }
 */
router.get('/statistik', authMiddleware, getStatistik);

/**
 * @swagger
 * /users/vouchers/claim:
 *   post:
 *     summary: Klaim voucher dengan poin user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [voucherId]
 *             properties:
 *               voucherId: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Voucher berhasil diklaim
 */
router.post('/vouchers/claim', authMiddleware, claimVoucher);

/**
 * @swagger
 * /users/points/add:
 *   post:
 *     summary: Tambah poin keaktifan atau cashback belanja user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: integer, example: 50 }
 *               actionDetail: { type: string, example: "Cashback belanja UMKM" }
 *     responses:
 *       200:
 *         description: Poin berhasil ditambahkan
 */
router.post('/points/add', authMiddleware, addPoints);

module.exports = router;
