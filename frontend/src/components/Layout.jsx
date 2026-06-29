import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import HeroIcon from './HeroIcon';
import './Layout.css';

export default function Layout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const isGuest = user?.isGuest || user?.email === 'guest@smartcity.local';

  const closeProfileMenu = () => setProfileOpen(false);

  const handleLogin = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  const handleEditProfile = () => {
    closeProfileMenu();
    navigate('/profil?edit=1');
  };

  const handleSignOut = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  const dashboardTools = (
    <>
      <button className="layout-notification" type="button" aria-label="Notifikasi">
        <HeroIcon name="bell" />
      </button>
      <div className={`layout-profile-menu ${profileOpen ? 'open' : ''}`}>
        <button
          className="layout-profile"
          type="button"
          aria-label="Menu profil pengguna"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen(open => !open)}
        >
          <span className="layout-avatar">{user?.nama?.[0]?.toUpperCase() || 'U'}</span>
          <span className="layout-user">
            <strong>{user?.nama || 'Pengguna'}</strong>
            <small>{isGuest ? 'guest demo' : user?.role || 'warga'}</small>
          </span>
          <HeroIcon name="chevronDown" className="layout-profile-caret" />
        </button>
        <div className="layout-profile-dropdown">
          {isGuest ? (
            <button type="button" onClick={handleLogin}>Log In</button>
          ) : (
            <button type="button" onClick={handleEditProfile}>Edit Profile</button>
          )}
          <button type="button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="layout">
      <header className="layout-topbar">
        <div className="layout-topbar-inner">
          <Sidebar mobileActions={dashboardTools} />

          <div className="layout-tools" aria-label="Dashboard tools">
            {dashboardTools}
          </div>
        </div>
      </header>

      <main className="layout-main">
        {(title || subtitle) && (
          <div className="layout-page-title">
            {title && <h1 className="layout-title">{title}</h1>}
            {subtitle && <p className="layout-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="layout-content">{children}</div>
      </main>
    </div>
  );
}
