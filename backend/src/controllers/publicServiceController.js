const {
  HospitalCapacity,
  CctvPoint,
  EmergencyAlert,
  HealthStatistic,
  EducationInstitution,
  LocalJob,
  UmkmBusiness,
} = require('../models/PublicService');

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, err) => res.status(500).json({ success: false, message: err.message });
const uniqueBy = (rows, getKey) => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = getKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

let seedPromise;

const seed = async () => {
  if (await HospitalCapacity.count()) return;

  await HospitalCapacity.bulkCreate([
    { nama: 'RSUD Dr. Pirngadi Medan', alamat: 'Jl. Prof. H.M. Yamin SH No.47', kecamatan: 'Medan Timur', telepon: '061-4512800', bed_total: 320, bed_tersedia: 42, status: 'Tersedia', lat: 3.5913, lng: 98.6989 },
    { nama: 'RS Columbia Asia Medan', alamat: 'Jl. Listrik No.2A', kecamatan: 'Medan Petisah', telepon: '061-4566368', bed_total: 210, bed_tersedia: 0, status: 'Penuh', lat: 3.5812, lng: 98.6658 },
    { nama: 'RS Haji Medan', alamat: 'Jl. RS Haji', kecamatan: 'Medan Johor', telepon: '061-7864741', bed_total: 260, bed_tersedia: 31, status: 'Tersedia', lat: 3.5389, lng: 98.6912 },
  ]);

  await CctvPoint.bulkCreate([
    { nama: 'CCTV Balai Kota', lokasi: 'Jl. Kapten Maulana Lubis', zona: 'Zona Aman Pusat', status: 'Aktif', lat: 3.5908, lng: 98.6693 },
    { nama: 'CCTV Lapangan Merdeka', lokasi: 'Lapangan Merdeka', zona: 'Zona Aman Pusat', status: 'Aktif', lat: 3.5926, lng: 98.6781 },
    { nama: 'CCTV Ring Road', lokasi: 'Jl. Ring Road', zona: 'Zona Pantau Barat', status: 'Maintenance', lat: 3.5700, lng: 98.6350 },
    { nama: 'CCTV Belawan', lokasi: 'Jl. Yos Sudarso', zona: 'Zona Pelabuhan', status: 'Aktif', lat: 3.7001, lng: 98.6905 },
  ]);

  await EmergencyAlert.bulkCreate([
    { judul: 'Peringatan Hujan Intensitas Tinggi', pesan: 'Warga diminta waspada genangan di koridor Medan Denai dan Medan Johor.', tingkat: 'Waspada', aktif: true },
    { judul: 'Simulasi Sirene Darurat', pesan: 'Uji coba sistem peringatan dini kota selesai dilaksanakan.', tingkat: 'Info', aktif: false },
  ]);

  await HealthStatistic.bulkCreate([
    { periode: 'Jan', penyakit: 'ISPA', kasus: 420, vaksinasi: 11800 },
    { periode: 'Feb', penyakit: 'ISPA', kasus: 390, vaksinasi: 12500 },
    { periode: 'Mar', penyakit: 'DBD', kasus: 144, vaksinasi: 13200 },
    { periode: 'Apr', penyakit: 'DBD', kasus: 178, vaksinasi: 14050 },
    { periode: 'Mei', penyakit: 'Diare', kasus: 210, vaksinasi: 14900 },
    { periode: 'Jun', penyakit: 'Hipertensi', kasus: 335, vaksinasi: 15600 },
  ]);

  await EducationInstitution.bulkCreate([
    { nama: 'SMA Negeri 1 Medan', jenis: 'Sekolah', alamat: 'Jl. Teuku Cik Ditiro No.1', akreditasi: 'A', jumlah_siswa: 1120, lat: 3.5793, lng: 98.6691 },
    { nama: 'SMA Negeri 4 Medan', jenis: 'Sekolah', alamat: 'Jl. Budi Kemasyarakatan No.3', akreditasi: 'A', jumlah_siswa: 980, lat: 3.5950, lng: 98.6421 },
    { nama: 'Universitas Sumatera Utara', jenis: 'Universitas', alamat: 'Jl. Universitas No.9', akreditasi: 'Unggul', jumlah_siswa: 32000, lat: 3.5700, lng: 98.6500 },
    { nama: 'Universitas Negeri Medan', jenis: 'Universitas', alamat: 'Jl. Willem Iskandar', akreditasi: 'A', jumlah_siswa: 24000, lat: 3.6135, lng: 98.7134 },
  ]);

  await LocalJob.bulkCreate([
    { posisi: 'Frontend Developer', perusahaan: 'Medan Digital Hub', kategori: 'Teknologi', lokasi: 'Medan Petisah', tipe: 'Full-time', gaji: 'Rp6-9 juta', deadline: '2026-08-15', deskripsi: 'Membangun dashboard web untuk layanan publik kota.', persyaratan: 'Minimal HTS/D3/S1 Informatika. Menguasai React.js & CSS.', kontak: 'hrd@medandigital.id', status: 'Approved' },
    { posisi: 'Analis Data Kesehatan', perusahaan: 'Klinik Kota Medan', kategori: 'Kesehatan', lokasi: 'Medan Timur', tipe: 'Contract', gaji: 'Rp5-7 juta', deadline: '2026-08-20', deskripsi: 'Mengolah data layanan kesehatan dan laporan bulanan.', persyaratan: 'Lulusan Kesehatan Masyarakat atau Statistik. Teliti & jujur.', kontak: 'karir@klinikmedan.com', status: 'Approved' },
    { posisi: 'Admin Operasional UMKM', perusahaan: 'Koperasi Medan Maju', kategori: 'UMKM', lokasi: 'Medan Kota', tipe: 'Full-time', gaji: 'Rp4-5 juta', deadline: '2026-08-30', deskripsi: 'Mengelola data anggota dan transaksi harian.', persyaratan: 'SMA/SMK Sederajat. Mahir Microsoft Office & Excel.', kontak: '0812-3456-7890 (WA)', status: 'Approved' },
  ]);

  await UmkmBusiness.bulkCreate([
    { nama: 'Kopi Kesawan', kategori: 'Kuliner', pemilik: 'Rina', omzet_bulanan: 85000000, tenaga_kerja: 12, alamat: 'Kesawan', lat: 3.5902, lng: 98.6785 },
    { nama: 'Batik Deli', kategori: 'Fashion', pemilik: 'Hendra', omzet_bulanan: 64000000, tenaga_kerja: 9, alamat: 'Medan Petisah', lat: 3.5822, lng: 98.6631 },
    { nama: 'Keripik Amplas', kategori: 'Makanan Ringan', pemilik: 'Nur', omzet_bulanan: 42000000, tenaga_kerja: 7, alamat: 'Medan Amplas', lat: 3.5520, lng: 98.6941 },
    { nama: 'Craft Sunggal', kategori: 'Kerajinan', pemilik: 'Dimas', omzet_bulanan: 38000000, tenaga_kerja: 6, alamat: 'Medan Sunggal', lat: 3.5980, lng: 98.6278 },
  ]);
};

const seedIfEmpty = async () => {
  if (!seedPromise) {
    seedPromise = seed().finally(() => {
      seedPromise = null;
    });
  }
  return seedPromise;
};

exports.seedIfEmpty = seedIfEmpty;

exports.overview = async (req, res) => {
  try {
    await seedIfEmpty();
    const [hospitals, cctv, alerts, health, education, jobs, umkm] = await Promise.all([
      HospitalCapacity.findAll({ order: [['bed_tersedia', 'DESC']] }),
      CctvPoint.findAll({ order: [['zona', 'ASC'], ['nama', 'ASC']] }),
      EmergencyAlert.findAll({ order: [['aktif', 'DESC'], ['createdAt', 'DESC']] }),
      HealthStatistic.findAll({ order: [['id', 'ASC']] }),
      EducationInstitution.findAll({ order: [['jenis', 'ASC'], ['nama', 'ASC']] }),
      LocalJob.findAll({ where: { status: 'Approved' }, order: [['createdAt', 'DESC']] }),
      UmkmBusiness.findAll({ order: [['kategori', 'ASC'], ['nama', 'ASC']] }),
    ]);
    ok(res, {
      hospitals: uniqueBy(hospitals, item => item.nama),
      cctv: uniqueBy(cctv, item => item.nama),
      alerts: uniqueBy(alerts, item => item.judul),
      health: uniqueBy(health, item => item.periode),
      education: uniqueBy(education, item => item.nama),
      jobs,
      umkm: uniqueBy(umkm, item => item.nama),
    });
  } catch (err) { fail(res, err); }
};

exports.toggleAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert tidak ditemukan.' });
    await alert.update({ aktif: Boolean(req.body.aktif) });
    ok(res, alert);
  } catch (err) { fail(res, err); }
};

exports.createJob = async (req, res) => {
  try {
    const { posisi, perusahaan, kategori, lokasi, tipe, gaji, deskripsi, persyaratan, kontak, deadline } = req.body;
    if (!posisi || !perusahaan || !lokasi) {
      return res.status(400).json({ success: false, message: 'Posisi, Perusahaan, dan Lokasi wajib diisi.' });
    }
    const job = await LocalJob.create({
      posisi,
      perusahaan,
      kategori: kategori || 'Umum',
      lokasi,
      tipe: tipe || 'Full-time',
      gaji: gaji || 'Kompetitif',
      deskripsi: deskripsi || '',
      persyaratan: persyaratan || '',
      kontak: kontak || '-',
      deadline: deadline || null,
      status: 'Pending',
    });
    ok(res, job);
  } catch (err) { fail(res, err); }
};

exports.reportJob = async (req, res) => {
  try {
    const job = await LocalJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan.' });
    const newCount = (job.laporan_count || 0) + 1;
    const newStatus = newCount >= 3 ? 'Pending' : job.status;
    await job.update({ laporan_count: newCount, status: newStatus });
    ok(res, { message: 'Laporan berhasil dikirim.', job });
  } catch (err) { fail(res, err); }
};
