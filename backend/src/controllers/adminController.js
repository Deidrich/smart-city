const { Op } = require("sequelize");
const User = require("../models/User");
const Traffic = require("../models/Traffic");
const Facility = require("../models/Facility");
const { TransportRoute } = require("../models/Transport");
const {
  Policy,
  PolicyVote,
  CitizenReport,
  FloodReport,
  Announcement,
} = require("../models/CityService");
const {
  HospitalCapacity,
  EmergencyAlert,
  EducationInstitution,
  UmkmBusiness,
  LocalJob,
} = require("../models/PublicService");
const Log = require("../models/Log");
const cityServices = require("./cityServiceController");
const publicServices = require("./publicServiceController");

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, err) =>
  res.status(500).json({ success: false, message: err.message });

const writeLog = (req, aksi, detail) =>
  Log.create({
    userId: req.user.id,
    nama: req.user.nama || "Admin",
    aksi,
    detail,
    ipAddress: req.ip,
  });

const masterMap = {
  hospitals: HospitalCapacity,
  education: EducationInstitution,
  umkm: UmkmBusiness,
  transport: TransportRoute,
};

exports.summary = async (req, res) => {
  try {
    await Promise.all([
      cityServices.seedIfEmpty(),
      publicServices.seedIfEmpty(),
    ]);
    const [
      users,
      policies,
      votes,
      reports,
      floods,
      announcements,
      hospitals,
      education,
      umkm,
      transport,
      traffic,
      facilities,
      activeAlerts,
      logs,
    ] = await Promise.all([
      User.count(),
      Policy.count(),
      PolicyVote.count(),
      CitizenReport.count(),
      FloodReport.count(),
      Announcement.count(),
      HospitalCapacity.count(),
      EducationInstitution.count(),
      UmkmBusiness.count(),
      TransportRoute.count(),
      Traffic.count(),
      Facility.count(),
      EmergencyAlert.count({ where: { aktif: true } }),
      Log.countDocuments(),
    ]);
    ok(res, {
      users,
      policies,
      votes,
      reports,
      floods,
      announcements,
      hospitals,
      education,
      umkm,
      transport,
      traffic,
      facilities,
      activeAlerts,
      logs,
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.bootstrap = async (req, res) => {
  try {
    await Promise.all([
      cityServices.seedIfEmpty(),
      publicServices.seedIfEmpty(),
    ]);
    const [
      policies,
      reports,
      floods,
      announcements,
      alerts,
      hospitals,
      education,
      umkm,
      transport,
    ] = await Promise.all([
      Policy.findAll({
        include: [{ model: PolicyVote, as: "votes" }],
        order: [["createdAt", "DESC"]],
      }),
      CitizenReport.findAll({ order: [["createdAt", "DESC"]] }),
      FloodReport.findAll({ order: [["createdAt", "DESC"]] }),
      Announcement.findAll({ order: [["tanggal", "DESC"]] }),
      EmergencyAlert.findAll({
        order: [
          ["aktif", "DESC"],
          ["createdAt", "DESC"],
        ],
      }),
      HospitalCapacity.findAll({ order: [["nama", "ASC"]] }),
      EducationInstitution.findAll({ order: [["nama", "ASC"]] }),
      UmkmBusiness.findAll({ order: [["nama", "ASC"]] }),
      TransportRoute.findAll({ order: [["kode_rute", "ASC"]] }),
    ]);
    ok(res, {
      policies,
      reports,
      floods,
      announcements,
      alerts,
      master: { hospitals, education, umkm, transport },
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const row = await Policy.create(req.body);
    await writeLog(req, "TAMBAH_KEBIJAKAN", `Tambah kebijakan: ${row.judul}`);
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const row = await Policy.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Kebijakan tidak ditemukan." });
    await row.update(req.body);
    await writeLog(req, "EDIT_KEBIJAKAN", `Edit kebijakan: ${row.judul}`);
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const row = await Policy.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Kebijakan tidak ditemukan." });
    await PolicyVote.destroy({ where: { policy_id: row.id } });
    await row.destroy();
    await writeLog(req, "HAPUS_KEBIJAKAN", `Hapus kebijakan: ${row.judul}`);
    ok(res, { id: Number(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const isFlood = req.params.type === "flood";
    const model = isFlood ? FloodReport : CitizenReport;
    const row = await model.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Laporan tidak ditemukan." });
    // Both FloodReport and CitizenReport from CityService model use 'status' field
    const field = "status";
    await row.update({ [field]: req.body.status });
    await writeLog(
      req,
      "UPDATE_LAPORAN",
      `Update status ${req.params.type} #${row.id} menjadi ${req.body.status}`,
    );
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const row = await Announcement.create(req.body);
    await writeLog(req, "TAMBAH_PENGUMUMAN", `Tambah pengumuman: ${row.judul}`);
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const row = await Announcement.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Pengumuman tidak ditemukan." });
    await row.update(req.body);
    await writeLog(req, "EDIT_PENGUMUMAN", `Edit pengumuman: ${row.judul}`);
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const row = await Announcement.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Pengumuman tidak ditemukan." });
    await row.destroy();
    await writeLog(req, "HAPUS_PENGUMUMAN", `Hapus pengumuman: ${row.judul}`);
    ok(res, { id: Number(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
};

exports.toggleAlert = async (req, res) => {
  try {
    const row = await EmergencyAlert.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Alert tidak ditemukan." });
    await row.update({ aktif: Boolean(req.body.aktif) });
    await writeLog(
      req,
      "TOGGLE_ALERT",
      `${row.aktif ? "Aktifkan" : "Nonaktifkan"} alert: ${row.judul}`,
    );
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.createMaster = async (req, res) => {
  try {
    const model = masterMap[req.params.type];
    if (!model)
      return res
        .status(400)
        .json({ success: false, message: "Tipe master tidak valid." });
    const row = await model.create(req.body);
    await writeLog(req, "UPDATE_MASTER", `Tambah master ${req.params.type}`);
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.updateMaster = async (req, res) => {
  try {
    const model = masterMap[req.params.type];
    if (!model)
      return res
        .status(400)
        .json({ success: false, message: "Tipe master tidak valid." });
    const row = await model.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Data master tidak ditemukan." });
    await row.update(req.body);
    await writeLog(
      req,
      "UPDATE_MASTER",
      `Update master ${req.params.type} #${row.id}`,
    );
    ok(res, row);
  } catch (err) {
    fail(res, err);
  }
};

exports.deleteMaster = async (req, res) => {
  try {
    const model = masterMap[req.params.type];
    if (!model)
      return res
        .status(400)
        .json({ success: false, message: "Tipe master tidak valid." });
    const row = await model.findByPk(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "Data master tidak ditemukan." });
    await row.destroy();
    await writeLog(
      req,
      "UPDATE_MASTER",
      `Hapus master ${req.params.type} #${row.id}`,
    );
    ok(res, { id: Number(req.params.id) });
  } catch (err) {
    fail(res, err);
  }
};

exports.logs = async (req, res) => {
  try {
    const query = {};
    if (req.query.aksi) query.aksi = req.query.aksi;
    if (req.query.start || req.query.end) {
      query.createdAt = {};
      if (req.query.start)
        query.createdAt.$gte = new Date(`${req.query.start}T00:00:00.000Z`);
      if (req.query.end)
        query.createdAt.$lte = new Date(`${req.query.end}T23:59:59.999Z`);
    }
    const logs = await Log.find(query).sort({ createdAt: -1 }).limit(200);
    ok(res, logs);
  } catch (err) {
    fail(res, err);
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await LocalJob.findAll({ order: [['createdAt', 'DESC']] });
    ok(res, jobs);
  } catch (err) {
    fail(res, err);
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const job = await LocalJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid." });
    }
    await job.update({ status, laporan_count: status === 'Approved' ? 0 : job.laporan_count });
    await writeLog(req, "MODERASI_LOWONGAN", `Ubah status lowongan #${job.id} (${job.posisi}) menjadi ${status}`);
    ok(res, job);
  } catch (err) {
    fail(res, err);
  }
};
