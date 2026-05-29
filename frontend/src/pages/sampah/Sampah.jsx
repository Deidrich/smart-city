import { useEffect, useState } from "react";
import Layout from '../../components/Layout';
import HeroIcon from '../../components/HeroIcon';
import api from "../../utils/api";
import "./Sampah.css";

export default function Sampah() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [kecamatan, setKecamatan] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/trash")
      .then(res => {
        setData(res.data.data || []);
        setFiltered(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (kecamatan === "Semua") {
      setFiltered(data);
    } else {
      setFiltered(data.filter(d => d.kecamatan === kecamatan));
    }
  }, [kecamatan, data]);

  const kecamatanList = ["Semua", ...new Set(data.map(d => d.kecamatan))];

  const getStatusClass = (status) => {
    if (status === "Sudah Diangkut") return "status-badge status-sudah";
    if (status === "Terlambat") return "status-badge status-terlambat";
    return "status-badge status-belum";
  };

  if (loading) return (
    <Layout title="" subtitle="">
      <div className="sampah-container">Memuat data...</div>
    </Layout>
  );
  return (
    <Layout title="" subtitle="">
        {<div className="sampah-container">
            <div className="sampah-header">
            <h1><HeroIcon name="trash" /> Tracker Sampah</h1>
            <p>Jadwal pengangkutan sampah per kelurahan di Kota Medan</p>
            </div>

        <div className="sampah-filter">
            <select value={kecamatan} onChange={e => setKecamatan(e.target.value)}>
            {kecamatanList.map(k => (
                <option key={k} value={k}>{k}</option>
            ))}
            </select>
        </div>

        <div className="sampah-grid">
            {filtered.map(item => (
            <div key={item.id} className="sampah-card">
                <h3>{item.kelurahan}</h3>
                <p><HeroIcon name="mapPin" /> {item.kecamatan}</p>
                <p><HeroIcon name="calendar" /> {item.jadwal_hari}</p>
                <p><HeroIcon name="clock" /> {item.jam_pengangkutan}</p>
                <p><HeroIcon name="arrowPath" /> {item.frekuensi}</p>
                <p><HeroIcon name="briefcase" /> {item.petugas}</p>
                <span className={getStatusClass(item.status_hari_ini)}>
                {item.status_hari_ini}
                </span>
            </div>
            ))}
        </div>
        </div>}
    </Layout>
  );
}
