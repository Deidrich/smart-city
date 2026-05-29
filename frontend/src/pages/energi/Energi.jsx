    import { useEffect, useState } from "react";
    import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, BarChart, Bar
    } from "recharts";
    import Layout from '../../components/Layout';
    import HeroIcon from '../../components/HeroIcon';
    import api from "../../utils/api";
    import "./Energi.css";

    export default function Energi() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/dashboard/stats")
        .then(res => {
            setData(res.data.data.chart || []);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const total = data.reduce((sum, d) => sum + (d.energi_gwh || 0), 0);
    const rata = data.length ? (total / data.length).toFixed(1) : 0;
    const tertinggi = data.length ? Math.max(...data.map(d => d.energi_gwh || 0)).toFixed(1) : 0;

    if (loading) return (
        <Layout title="" subtitle="">
            <div className="energi-container">Memuat data...</div>
        </Layout>
    );

    return (
        <Layout title="" subtitle="">
            {
            <div className="energi-container">
            <div className="energi-header">
                <h1><HeroIcon name="energy" /> Monitor Konsumsi Energi</h1>
                <p>Data konsumsi energi kota per bulan dalam satuan GWh</p>
            </div>

            <div className="energi-stats">
                <div className="stat-box">
                <div className="nilai">{total.toFixed(1)}</div>
                <div className="label">Total GWh (2024)</div>
                </div>
                <div className="stat-box">
                <div className="nilai">{rata}</div>
                <div className="label">Rata-rata/Bulan</div>
                </div>
                <div className="stat-box">
                <div className="nilai">{tertinggi}</div>
                <div className="label">Konsumsi Tertinggi</div>
                </div>
            </div>

            <div className="energi-card">
                <h2>Grafik Konsumsi Energi Bulanan</h2>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
                    <XAxis dataKey="bulan" stroke="#9AA2B6" />
                    <YAxis stroke="#9AA2B6" />
                    <Tooltip
                    contentStyle={{ background: "#111E43", border: "1px solid #E3B473", borderRadius: 14 }}
                    labelStyle={{ color: "#E3B473" }}
                    />
                    <Legend />
                    <Line
                    type="monotone"
                    dataKey="energi_gwh"
                    stroke="#043CB1"
                    strokeWidth={3}
                    dot={{ fill: "#043CB1" }}
                    name="Energi (GWh)"
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="energi-card">
                <h2>Perbandingan Konsumsi Per Bulan</h2>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F7" />
                    <XAxis dataKey="bulan" stroke="#9AA2B6" />
                    <YAxis stroke="#9AA2B6" />
                    <Tooltip
                    contentStyle={{ background: "#111E43", border: "1px solid #E3B473", borderRadius: 14 }}
                    labelStyle={{ color: "#E3B473" }}
                    />
                    <Bar dataKey="energi_gwh" fill="#E3B473" name="Energi (GWh)" radius={[8, 8, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
            }
        </Layout>
    );
    }
