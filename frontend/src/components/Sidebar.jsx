import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import HeroIcon from './HeroIcon';
import './Sidebar.css';

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard Kota" },
  { to: "/peta", icon: "map", label: "Peta Interaktif" },
  { to: "/udara", icon: "cloud", label: "Kualitas Udara" },
  { to: "/lalu-lintas", icon: "road", label: "Lalu Lintas" },
  { to: "/transportasi", icon: "truck", label: "Transportasi" },
  { to: "/energi", icon: "energy", label: "Konsumsi Energi" },
  { to: "/sampah", icon: "trash", label: "Tracker Sampah" },
  { to: "/layanan-kota", icon: "government", label: "Layanan Kota" },
  { to: "/air-bersih", icon: "water", label: "Status Air Bersih" },
  { to: "/layanan-publik", icon: "health", label: "Layanan Publik" },
  { to: "/admin", icon: "admin", label: "Panel Admin", adminOnly: true },
  { to: "/profil", icon: "profile", label: "Profil Saya" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandLogo compact className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        {navItems.filter(item => !item.adminOnly || user?.role === 'admin').map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon"><HeroIcon name={item.icon} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
