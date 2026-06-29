import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import HeroIcon from "../../components/HeroIcon";
import api from "../../utils/api";
import "./AdminPanel.css";

const sections = [
  ["ringkasan", "Ringkasan"],
  ["kebijakan", "Kebijakan"],
  ["laporan", "Laporan"],
  ["jobs", "Moderasi Lowongan"],
  ["pengumuman", "Pengumuman"],
  ["master", "Master Data"],
  ["alert", "Alert"],
  ["log", "Log Aktivitas"],
];

const emptyPolicy = { judul: "", kategori: "Kebijakan Kota", deskripsi: "" };
const emptyAnnouncement = {
  judul: "",
  kategori: "Resmi",
  tanggal: new Date().toISOString().slice(0, 10),
  isi: "",
};

const masterConfigs = {
  hospitals: {
    label: "RS",
    empty: {
      nama: "",
      alamat: "",
      kecamatan: "",
      telepon: "",
      bed_total: "",
      bed_tersedia: "",
      status: "Tersedia",
      lat: 3.5896,
      lng: 98.6739,
    },
    fields: [
      { key: "nama", placeholder: "Nama RS" },
      { key: "alamat", placeholder: "Alamat lengkap" },
      { key: "kecamatan", placeholder: "Kecamatan" },
      { key: "telepon", placeholder: "Telepon" },
      { key: "bed_total", placeholder: "Jlh bed" },
      { key: "bed_tersedia", placeholder: "Jlh bed tersedia" },
      { key: "status", placeholder: "Status (Tersedia / Penuh)" },
      { key: "lat", placeholder: "Latitude" },
      { key: "lng", placeholder: "Longitude" },
    ],
  },
  education: {
    label: "Sekolah/Universitas",
    empty: {
      nama: "",
      jenis: "Sekolah",
      alamat: "",
      akreditasi: "",
      jumlah_siswa: "",
      lat: 3.5896,
      lng: 98.6739,
    },
    fields: [
      { key: "nama", placeholder: "Nama sekolah/universitas" },
      { key: "jenis", placeholder: "(Sekolah / Universitas)" },
      { key: "alamat", placeholder: "Alamat lengkap" },
      { key: "akreditasi", placeholder: "Akreditasi" },
      { key: "jumlah_siswa", placeholder: "Jlh Siswa" },
      { key: "lat", placeholder: "Latitude" },
      { key: "lng", placeholder: "Longitude" },
    ],
  },
  umkm: {
    label: "UMKM",
    empty: {
      nama: "",
      kategori: "Kuliner",
      pemilik: "",
      omzet_bulanan: "",
      tenaga_kerja: "",
      alamat: "",
      lat: 3.5896,
      lng: 98.6739,
    },
    fields: [
      { key: "nama", placeholder: "Nama UMKM" },
      { key: "kategori", placeholder: "Kategori (Kuliner / Fashion / Kerajinan)" },
      { key: "pemilik", placeholder: "Nama pemilik" },
      { key: "omzet_bulanan", placeholder: "Omzet bulanan" },
      { key: "tenaga_kerja", placeholder: "Jlh tenaga kerja" },
      { key: "alamat", placeholder: "Alamat lengkap" },
      { key: "lat", placeholder: "Latitude" },
      { key: "lng", placeholder: "Longitude" },
    ],
  },
  transport: {
    label: "Transportasi",
    empty: {
      kode_rute: "",
      nama_rute: "",
      jenis: "",
      terminal_awal: "",
      terminal_akhir: "",
      tarif: "",
      jam_operasi_mulai: "",
      jam_operasi_selesai: "",
      status_aktif: true,
    },
    fields: [
      { key: "kode_rute", placeholder: "Kode rute (cth: BUS-01)" },
      { key: "nama_rute", placeholder: "Nama rute (cth:: Amplas - Pinang Baris)" },
      { key: "jenis", placeholder: "Jenis (Bus / Angkot / BRT)" },
      { key: "terminal_awal", placeholder: "Terminal awal" },
      { key: "terminal_akhir", placeholder: "Terminal akhir" },
      { key: "tarif", placeholder: "Tarif" },
      { key: "jam_operasi_mulai", placeholder: "Jam mulai (cth: 05:00)" },
      { key: "jam_operasi_selesai", placeholder: "Jam selesai (cth: 21:00)" },
      { key: "status_aktif", placeholder: "Status aktif (true / false)" },
    ],
  },
};

export default function AdminPanel() {
  const [active, setActive] = useState("ringkasan");
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);
  const [masterType, setMasterType] = useState("hospitals");
  const [masterForm, setMasterForm] = useState(masterConfigs.hospitals.empty);
  const [logFilter, setLogFilter] = useState({ aksi: "", start: "", end: "" });

  const load = async () => {
    const [summaryRes, bootRes, jobsRes] = await Promise.all([
      api.get("/admin/summary"),
      api.get("/admin/bootstrap"),
      api.get("/admin/jobs").catch(() => ({ data: { data: [] } })),
    ]);
    setSummary(summaryRes.data.data);
    setData(bootRes.data.data);
    setAdminJobs(jobsRes.data.data || []);
  };

  const loadLogs = async () => {
    const params = new URLSearchParams(
      Object.entries(logFilter).filter(([, value]) => value),
    );
    const res = await api.get(`/admin/logs?${params.toString()}`);
    setLogs(res.data.data);
  };

  const handleJobStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status });
      await flash(`Status lowongan berhasil diubah menjadi ${status}.`);
    } catch (err) {
      setMessage("Gagal mengubah status lowongan.");
    }
  };

  useEffect(() => {
    load().catch(() => setMessage("Gagal memuat panel admin."));
  }, []);

  useEffect(() => {
    if (active === "log")
      loadLogs().catch(() => setMessage("Gagal memuat log."));
  }, [active]);

  const flash = async (text) => {
    await load();
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const submitPolicy = async (event) => {
    event.preventDefault();
    if (policyForm.id)
      await api.put(`/admin/policies/${policyForm.id}`, policyForm);
    else await api.post("/admin/policies", policyForm);
    setPolicyForm(emptyPolicy);
    await flash("Kebijakan tersimpan.");
  };

  const deletePolicy = async (id) => {
    await api.delete(`/admin/policies/${id}`);
    await flash("Kebijakan dihapus.");
  };

  const updateReport = async (type, id, status) => {
    await api.patch(`/admin/reports/${type}/${id}/status`, { status });
    await flash("Status laporan diperbarui.");
  };

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    if (announcementForm.id)
      await api.put(
        `/admin/announcements/${announcementForm.id}`,
        announcementForm,
      );
    else await api.post("/admin/announcements", announcementForm);
    setAnnouncementForm(emptyAnnouncement);
    await flash("Pengumuman tersimpan.");
  };

  const deleteAnnouncement = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    await flash("Pengumuman dihapus.");
  };

  const toggleAlert = async (alert) => {
    await api.patch(`/admin/alerts/${alert.id}`, { aktif: !alert.aktif });
    await flash("Status alert diperbarui.");
  };

  const submitMaster = async (event) => {
    event.preventDefault();
    if (masterForm.id)
      await api.put(`/admin/master/${masterType}/${masterForm.id}`, masterForm);
    else await api.post(`/admin/master/${masterType}`, masterForm);
    setMasterForm(masterConfigs[masterType].empty);
    await flash("Master data tersimpan.");
  };

  const deleteMaster = async (type, id) => {
    await api.delete(`/admin/master/${type}/${id}`);
    await flash("Master data dihapus.");
  };

  const summaryItems = useMemo(
    () =>
      summary
        ? [
            ["Users", summary.users],
            ["Kebijakan", summary.policies],
            ["Vote", summary.votes],
            ["Laporan", summary.reports + summary.floods],
            ["Pengumuman", summary.announcements],
            ["RS", summary.hospitals],
            ["Pendidikan", summary.education],
            ["UMKM", summary.umkm],
            ["Transportasi", summary.transport],
            ["Alert Aktif", summary.activeAlerts],
            ["Log", summary.logs],
          ]
        : [],
    [summary],
  );

  if (!data || !summary) {
    return (
      <Layout title="Panel Admin" subtitle="Manajemen sistem Smart City">
        <div className="admin-loading">Memuat panel admin...</div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Panel Admin"
      subtitle="Dashboard, moderasi, master data, dan log aktivitas"
    >
      {message && <div className="admin-message">{message}</div>}

      <div className="admin-tabs">
        {sections.map(([id, label]) => (
          <button
            key={id}
            className={active === id ? "active" : ""}
            onClick={() => setActive(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "ringkasan" && (
        <section className="admin-grid">
          {summaryItems.map(([label, value]) => (
            <article className="admin-stat" key={label}>
              <span>{label}</span>
              <strong>{Number(value).toLocaleString("id-ID")}</strong>
            </article>
          ))}
        </section>
      )}

      {active === "kebijakan" && (
        <section className="admin-split">
          <form className="admin-panel admin-form" onSubmit={submitPolicy}>
            <h2>{policyForm.id ? "Edit Kebijakan" : "Tambah Kebijakan"}</h2>
            <input
              required
              placeholder="Judul"
              value={policyForm.judul}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, judul: e.target.value })
              }
            />
            <input
              placeholder="Kategori"
              value={policyForm.kategori}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, kategori: e.target.value })
              }
            />
            <textarea
              required
              placeholder="Deskripsi"
              value={policyForm.deskripsi}
              onChange={(e) =>
                setPolicyForm({ ...policyForm, deskripsi: e.target.value })
              }
            />
            <button>Simpan</button>
          </form>
          <div className="admin-panel">
            <AdminTable headers={["Judul", "Kategori", "Vote", "Aksi"]}>
              {data.policies.map((item) => (
                <tr key={item.id}>
                  <td>{item.judul}</td>
                  <td>{item.kategori}</td>
                  <td>{item.votes?.length || 0}</td>
                  <td>
                    <button onClick={() => setPolicyForm(item)}>Edit</button>
                    <button onClick={() => deletePolicy(item.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </section>
      )}

      {active === "laporan" && (
        <section className="admin-panel">
          <h2>Moderasi Laporan Warga</h2>
          <AdminTable
            headers={["Jenis", "Nama", "Kategori/Lokasi", "Status", "Update"]}
          >
            {data.reports.map((item) => (
              <ReportRow
                key={`r-${item.id}`}
                type="citizen"
                item={item}
                onUpdate={updateReport}
              />
            ))}
            {data.floods.map((item) => (
              <ReportRow
                key={`f-${item.id}`}
                type="flood"
                item={item}
                onUpdate={updateReport}
              />
            ))}
          </AdminTable>
        </section>
      )}

      {active === "jobs" && (
        <section className="admin-panel">
          <h2>Moderasi Lowongan Kerja Warga</h2>
          <AdminTable
            headers={["Posisi", "Perusahaan", "Lokasi & Tipe", "Laporan", "Status", "Tindakan"]}
          >
            {adminJobs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>Tidak ada data lowongan kerja.</td></tr>
            ) : (
              adminJobs.map((job) => (
                <tr key={job.id}>
                  <td><strong>{job.posisi}</strong><br /><small>{job.kategori || 'Umum'}</small></td>
                  <td>{job.perusahaan}</td>
                  <td>{job.lokasi} ({job.tipe})</td>
                  <td>{job.laporan_count || 0} Laporan</td>
                  <td>
                    <span
                      className="admin-badge"
                      style={{
                        background: job.status === "Approved" ? "#10b981" : job.status === "Pending" ? "#f59e0b" : "#ef4444",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {job.status !== "Approved" && (
                        <button type="button" style={{ background: "#10b981", color: "#fff", border: 0, padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }} onClick={() => handleJobStatusChange(job.id, "Approved")}>Setujui</button>
                      )}
                      {job.status !== "Rejected" && (
                        <button type="button" style={{ background: "#ef4444", color: "#fff", border: 0, padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }} onClick={() => handleJobStatusChange(job.id, "Rejected")}>Tolak</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        </section>
      )}

      {active === "pengumuman" && (
        <section className="admin-split">
          <form
            className="admin-panel admin-form"
            onSubmit={submitAnnouncement}
          >
            <h2>
              {announcementForm.id ? "Edit Pengumuman" : "Tambah Pengumuman"}
            </h2>
            <input
              required
              placeholder="Judul"
              value={announcementForm.judul}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  judul: e.target.value,
                })
              }
            />
            <input
              placeholder="Kategori"
              value={announcementForm.kategori}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  kategori: e.target.value,
                })
              }
            />
            <input
              type="date"
              value={announcementForm.tanggal}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  tanggal: e.target.value,
                })
              }
            />
            <textarea
              required
              placeholder="Isi"
              value={announcementForm.isi}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  isi: e.target.value,
                })
              }
            />
            <button>Simpan</button>
          </form>
          <div className="admin-panel">
            <AdminTable headers={["Judul", "Tanggal", "Kategori", "Aksi"]}>
              {data.announcements.map((item) => (
                <tr key={item.id}>
                  <td>{item.judul}</td>
                  <td>{item.tanggal}</td>
                  <td>{item.kategori}</td>
                  <td>
                    <button onClick={() => setAnnouncementForm(item)}>
                      Edit
                    </button>
                    <button onClick={() => deleteAnnouncement(item.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </section>
      )}

      {active === "master" && (
        <section className="admin-split">
          <form className="admin-panel admin-form" onSubmit={submitMaster}>
            <h2>Kelola {masterConfigs[masterType].label}</h2>
            <select
              value={masterType}
              onChange={(e) => {
                setMasterType(e.target.value);
                setMasterForm(masterConfigs[e.target.value].empty);
              }}
            >
              {Object.entries(masterConfigs).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
            {masterConfigs[masterType].fields.map(({ key, placeholder }) => (
              <div key={key}>
                {(key === 'lat' || key === 'lng') && (
                  <label style={{ fontSize: 12, color: '#aaa', marginBottom: 4, display: 'block' }}>
                    {key === 'lat' ? 'Latitude' : 'Longitude'}
                  </label>
                )}
                <input
                  placeholder={placeholder}
                  value={String(masterForm[key] ?? "")}
                  onChange={(e) =>
                    setMasterForm({
                      ...masterForm,
                      [key]: normalizeValue(key, e.target.value),
                    })
                  }
                />
              </div>
            ))}
            <button>Simpan</button>
          </form>
          <div className="admin-panel">
            <AdminTable headers={["Nama", "Info", "Aksi"]}>
              {data.master[masterType].map((item) => (
                <tr key={item.id}>
                  <td>{item.nama || item.nama_rute}</td>
                  <td>
                    {item.kategori ||
                      item.jenis ||
                      item.kecamatan ||
                      item.kode_rute}
                  </td>
                  <td>
                    <button onClick={() => setMasterForm(item)}>Edit</button>
                    <button onClick={() => deleteMaster(masterType, item.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </section>
      )}

      {active === "alert" && (
        <section className="admin-grid">
          {data.alerts.map((alert) => (
            <article className="admin-panel" key={alert.id}>
              <h2>{alert.judul}</h2>
              <p>{alert.pesan}</p>
              <span className={`admin-badge ${alert.aktif ? "active" : "off"}`}>
                {alert.aktif ? "Aktif" : "Nonaktif"}
              </span>
              <button onClick={() => toggleAlert(alert)}>
                {alert.aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </article>
          ))}
        </section>
      )}

      {active === "log" && (
        <section className="admin-panel">
          <div className="admin-log-filter">
            <select
              value={logFilter.aksi}
              onChange={(e) =>
                setLogFilter({ ...logFilter, aksi: e.target.value })
              }
            >
              <option value="">Semua aksi</option>
              {[
                "LOGIN",
                "LOGOUT",
                "VOTE",
                "SUBMIT_LAPORAN",
                "TAMBAH_PENGUMUMAN",
                "UPDATE_LAPORAN",
              ].map((aksi) => (
                <option key={aksi}>{aksi}</option>
              ))}
            </select>
            <input
              type="date"
              value={logFilter.start}
              onChange={(e) =>
                setLogFilter({ ...logFilter, start: e.target.value })
              }
            />
            <input
              type="date"
              value={logFilter.end}
              onChange={(e) =>
                setLogFilter({ ...logFilter, end: e.target.value })
              }
            />
            <button onClick={loadLogs}>Filter</button>
          </div>
          <AdminTable headers={["Waktu", "Nama", "Aksi", "Detail"]}>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                <td>{log.nama}</td>
                <td>{log.aksi}</td>
                <td>{log.detail}</td>
              </tr>
            ))}
          </AdminTable>
        </section>
      )}
    </Layout>
  );
}

function AdminTable({ headers, children }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ReportRow({ type, item, onUpdate }) {
  const isFlood = type === "flood";
  const currentStatus = item.status || "pending";
  const options = isFlood
    ? ["pending", "proses", "selesai"]
    : ["pending", "proses", "selesai"];

  const badgeColors = {
    pending: "#f59e0b",
    proses: "#3b82f6",
    selesai: "#10b981",
    Menunggu: "#f59e0b",
    Terverifikasi: "#3b82f6",
    Ditolak: "#ef4444",
  };

  return (
    <tr>
      <td><span className="icon-inline"><HeroIcon name={isFlood ? "water" : "profile"} /> {isFlood ? "Banjir" : "Warga"}</span></td>
      <td>{item.nama || item.pelapor || item.lokasi}</td>
      <td>{item.kategori || item.lokasi || "-"}</td>
      <td>
        <span
          className="admin-badge"
          style={{
            background: badgeColors[currentStatus] || "#6b7280",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "999px",
            fontSize: "12px",
          }}
        >
          {currentStatus}
        </span>
      </td>
      <td>
        <select
          value={currentStatus}
          onChange={(e) => onUpdate(type, item.id, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

function normalizeValue(field, value) {
  if (["lat", "lng"].includes(field)) return Number(value);
  if (
    [
      "bed_total",
      "bed_tersedia",
      "jumlah_siswa",
      "omzet_bulanan",
      "tenaga_kerja",
      "tarif",
    ].includes(field)
  )
    return Number(value);
  if (field === "status_aktif") return value === "true" || value === true;
  return value;
}
