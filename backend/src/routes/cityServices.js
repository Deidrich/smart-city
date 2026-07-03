const router = require('express').Router();
const upload = require('../config/upload');
const { authMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/cityServiceController');

router.use(authMiddleware);

/**
 * @swagger
 * /city-services:
 *   get:
 *     summary: Ambil overview seluruh layanan kota (energi, sampah, banjir, air, kebijakan, laporan, survei, pengumuman)
 *     tags: [City Services]
 *     responses:
 *       200:
 *         description: Overview layanan kota berhasil diambil
 */
router.get('/', ctrl.overview);

/**
 * @swagger
 * /city-services/water-detail:
 *   get:
 *     summary: Ambil detail status dan distribusi air bersih per wilayah
 *     tags: [City Services]
 *     responses:
 *       200:
 *         description: Detail air bersih berhasil diambil
 */
router.get('/water-detail', ctrl.waterDetail);

/**
 * @swagger
 * /city-services/roads/search:
 *   get:
 *     summary: Cari nama jalan melalui OpenStreetMap (Nominatim) di area Medan
 *     tags: [City Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         example: "Gatot Subroto"
 *         description: Minimal 3 karakter
 *     responses:
 *       200:
 *         description: Daftar hasil pencarian jalan
 */
router.get('/roads/search', ctrl.searchRoads);

/**
 * @swagger
 * /city-services/roads/reverse:
 *   get:
 *     summary: Reverse geocoding koordinat menjadi nama jalan/lokasi
 *     tags: [City Services]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *         example: 3.5952
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *         example: 98.6722
 *     responses:
 *       200:
 *         description: Lokasi ditemukan
 *       400:
 *         description: Koordinat tidak valid
 */
router.get('/roads/reverse', ctrl.reverseRoad);

/**
 * @swagger
 * /city-services/floods:
 *   post:
 *     summary: Buat laporan titik banjir baru (dengan foto opsional)
 *     tags: [City Services]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nama, lokasi, deskripsi, lat, lng]
 *             properties:
 *               nama: { type: string, example: "Warga Medan Baru" }
 *               lokasi: { type: string, example: "Jl. Dr. Mansyur" }
 *               deskripsi: { type: string, example: "Genangan setinggi trotoar setelah hujan deras." }
 *               lat: { type: number, example: 3.5688 }
 *               lng: { type: number, example: 98.6539 }
 *               status: { type: string, example: "pending" }
 *               foto: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Laporan banjir berhasil dibuat
 */
router.post('/floods', upload.single('foto'), ctrl.createFlood);

/**
 * @swagger
 * /city-services/policies/{id}/vote:
 *   post:
 *     summary: Vote (setuju/tidak setuju) untuk sebuah kebijakan
 *     tags: [City Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pilihan]
 *             properties:
 *               pilihan: { type: string, enum: [setuju, tidak_setuju], example: "setuju" }
 *     responses:
 *       200:
 *         description: Vote berhasil disimpan, mengembalikan rekap total vote
 *       409:
 *         description: User sudah pernah vote untuk kebijakan ini
 */
router.post('/policies/:id/vote', ctrl.votePolicy);

/**
 * @swagger
 * /city-services/threads:
 *   get:
 *     summary: Ambil daftar thread diskusi kebijakan (opsional filter policy_id)
 *     tags: [City Services]
 *     parameters:
 *       - in: query
 *         name: policy_id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Daftar thread berhasil diambil
 */
router.get('/threads', ctrl.threads);

/**
 * @swagger
 * /city-services/threads:
 *   post:
 *     summary: Buat thread diskusi baru untuk sebuah kebijakan
 *     tags: [City Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [policy_id, judul]
 *             properties:
 *               policy_id: { type: integer, example: 1 }
 *               judul: { type: string, example: "Dampak ke UMKM pusat kota" }
 *     responses:
 *       200:
 *         description: Thread berhasil dibuat
 */
router.post('/threads', ctrl.createThread);

/**
 * @swagger
 * /city-services/threads/{id}/comments:
 *   post:
 *     summary: Tambah komentar pada thread diskusi kebijakan
 *     tags: [City Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [komentar]
 *             properties:
 *               komentar: { type: string, example: "Perlu jalur distribusi barang yang tetap mudah diakses." }
 *     responses:
 *       200:
 *         description: Komentar berhasil ditambahkan
 */
router.post('/threads/:id/comments', ctrl.createComment);

/**
 * @swagger
 * /city-services/reports:
 *   post:
 *     summary: Buat laporan warga baru (jalan rusak, lampu jalan, dll, dengan foto opsional)
 *     tags: [City Services]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nama, kategori, deskripsi]
 *             properties:
 *               nama: { type: string, example: "Andi" }
 *               kategori: { type: string, example: "Jalan Rusak" }
 *               deskripsi: { type: string, example: "Lubang besar dekat persimpangan." }
 *               foto: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Laporan warga berhasil dibuat
 */
router.post('/reports', upload.single('foto'), ctrl.createReport);

/**
 * @swagger
 * /city-services/announcements/{id}/comments:
 *   get:
 *     summary: Ambil daftar komentar pada sebuah pengumuman
 *     tags: [City Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Daftar komentar berhasil diambil
 */
router.get('/announcements/:id/comments', ctrl.getAnnouncementComments);

/**
 * @swagger
 * /city-services/announcements/{id}/comments:
 *   post:
 *     summary: Tambah komentar pada sebuah pengumuman
 *     tags: [City Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [komentar]
 *             properties:
 *               komentar: { type: string, example: "Terima kasih infonya!" }
 *     responses:
 *       200:
 *         description: Komentar berhasil ditambahkan
 */
router.post('/announcements/:id/comments', ctrl.createAnnouncementComment);

/**
 * @swagger
 * /city-services/announcements/comments/{commentId}/react:
 *   post:
 *     summary: Beri/ubah/batalkan reaksi pada komentar pengumuman
 *     tags: [City Services]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reaksi]
 *             properties:
 *               reaksi: { type: string, example: "like" }
 *     responses:
 *       200:
 *         description: Reaksi berhasil disimpan/diubah/dibatalkan
 */
router.post('/announcements/comments/:commentId/react', ctrl.reactComment);

module.exports = router;
