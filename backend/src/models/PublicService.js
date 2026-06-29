const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const HospitalCapacity = sequelize.define('HospitalCapacity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(180), allowNull: false },
  alamat: { type: DataTypes.STRING(280), allowNull: false },
  kecamatan: { type: DataTypes.STRING(100), allowNull: false },
  telepon: { type: DataTypes.STRING(40) },
  bed_total: { type: DataTypes.INTEGER, allowNull: false },
  bed_tersedia: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('Tersedia', 'Penuh'), defaultValue: 'Tersedia' },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'hospital_capacities', timestamps: true });

const CctvPoint = sequelize.define('CctvPoint', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(160), allowNull: false },
  lokasi: { type: DataTypes.STRING(220), allowNull: false },
  zona: { type: DataTypes.STRING(80), allowNull: false },
  status: { type: DataTypes.ENUM('Aktif', 'Maintenance'), defaultValue: 'Aktif' },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'cctv_points', timestamps: true });

const EmergencyAlert = sequelize.define('EmergencyAlert', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  judul: { type: DataTypes.STRING(180), allowNull: false },
  pesan: { type: DataTypes.TEXT, allowNull: false },
  tingkat: { type: DataTypes.ENUM('Info', 'Waspada', 'Darurat'), defaultValue: 'Info' },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'emergency_alerts', timestamps: true });

const HealthStatistic = sequelize.define('HealthStatistic', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  periode: { type: DataTypes.STRING(40), allowNull: false },
  penyakit: { type: DataTypes.STRING(120), allowNull: false },
  kasus: { type: DataTypes.INTEGER, allowNull: false },
  vaksinasi: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'health_statistics', timestamps: true });

const EducationInstitution = sequelize.define('EducationInstitution', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(180), allowNull: false },
  jenis: { type: DataTypes.ENUM('Sekolah', 'Universitas'), allowNull: false },
  alamat: { type: DataTypes.STRING(280), allowNull: false },
  akreditasi: { type: DataTypes.STRING(20) },
  jumlah_siswa: { type: DataTypes.INTEGER },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'education_institutions', timestamps: true });

const LocalJob = sequelize.define('LocalJob', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER },
  posisi: { type: DataTypes.STRING(160), allowNull: false },
  perusahaan: { type: DataTypes.STRING(160), allowNull: false },
  kategori: { type: DataTypes.STRING(100), defaultValue: 'Umum' },
  lokasi: { type: DataTypes.STRING(140), allowNull: false },
  tipe: { type: DataTypes.STRING(80), defaultValue: 'Full-time' },
  gaji: { type: DataTypes.STRING(80) },
  deskripsi: { type: DataTypes.TEXT },
  persyaratan: { type: DataTypes.TEXT },
  kontak: { type: DataTypes.STRING(255) },
  deadline: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Approved' },
  laporan_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'local_jobs', timestamps: true });

const UmkmBusiness = sequelize.define('UmkmBusiness', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(180), allowNull: false },
  kategori: { type: DataTypes.STRING(100), allowNull: false },
  pemilik: { type: DataTypes.STRING(120), allowNull: false },
  omzet_bulanan: { type: DataTypes.INTEGER, allowNull: false },
  tenaga_kerja: { type: DataTypes.INTEGER, allowNull: false },
  alamat: { type: DataTypes.STRING(280), allowNull: false },
  lat: { type: DataTypes.FLOAT, allowNull: false },
  lng: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: 'umkm_businesses', timestamps: true });

module.exports = {
  HospitalCapacity,
  CctvPoint,
  EmergencyAlert,
  HealthStatistic,
  EducationInstitution,
  LocalJob,
  UmkmBusiness,
};
