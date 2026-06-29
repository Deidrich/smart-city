import { Link, NavLink, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import HeroIcon from './HeroIcon';
import { cn } from '../lib/utils';
import './Sidebar.css';

const navGroups = [
  {
    label: 'Beranda',
    icon: 'home',
    items: [{ to: '/', icon: 'home', label: 'Beranda Utama' }],
  },
  {
    label: 'Dashboard',
    icon: 'dashboard',
    items: [{ to: '/dashboard', icon: 'dashboard', label: 'Dashboard Kota' }],
  },
  {
    label: 'Monitoring',
    icon: 'map',
    items: [{ to: '/monitoring', icon: 'map', label: 'Pusat Monitoring' }],
  },
  {
    label: 'Layanan',
    icon: 'government',
    items: [{ to: '/layanan', icon: 'government', label: 'Pusat Layanan' }],
  },
  {
    label: 'Akun',
    icon: 'profile',
    items: [{ to: '/profil', icon: 'profile', label: 'Profil Saya' }],
  },
  {
    label: 'Admin',
    icon: 'admin',
    adminOnly: true,
    items: [{ to: '/admin', icon: 'admin', label: 'Panel Admin' }],
  },
];

export default function Sidebar({ mobileActions = null }) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState('');
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const groups = navGroups.filter(group => !group.adminOnly || user?.role === 'admin');

  const isGroupActive = (group) => group.items.some(item => location.pathname === item.to);
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setSearchOpen(false);
  };
  const toggleSearch = () => {
    setSearchOpen(open => {
      const nextOpen = !open;
      if (nextOpen) {
        window.setTimeout(() => {
          const input = mobileOpen ? mobileSearchInputRef.current : searchInputRef.current;
          input?.focus();
        }, 0);
      }
      return nextOpen;
    });
  };

  const renderSearch = (inputRef = searchInputRef) => (
    <label className={`dashboard-nav-search ${searchOpen ? 'open' : ''}`}>
      <button
        type="button"
        aria-label={searchOpen ? 'Tutup search dashboard' : 'Buka search dashboard'}
        onClick={toggleSearch}
      >
        <HeroIcon name="search" />
      </button>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search dashboard"
        aria-label="Search dashboard"
        onBlur={(event) => {
          if (!event.target.value) setSearchOpen(false);
        }}
      />
    </label>
  );

  const renderSubNav = () => (
    <nav className="dashboard-uniqlo-subnav" aria-label="Kategori navigasi utama">
      {groups.map((group) => {
        const targetTo = group.items[0]?.to || '#';
        const active = isGroupActive(group);
        return (
          <NavLink
            key={group.label}
            to={targetTo}
            className={`dashboard-uniqlo-sublink ${active ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {group.label}
          </NavLink>
        );
      })}
    </nav>
  );

  const renderGroups = () => groups.map(group => (
    <div className={`dashboard-nav-group ${isGroupActive(group) ? 'active' : ''} ${openGroup === group.label ? 'open' : ''}`} key={group.label}>
      {group.items.length === 1 ? (
        <NavLink
          to={group.items[0].to}
          className={({ isActive }) => `dashboard-nav-trigger ${isActive ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          <HeroIcon name={group.icon} />
          <span>{group.label}</span>
        </NavLink>
      ) : (
        <>
          <button
            className="dashboard-nav-trigger"
            type="button"
            aria-expanded={openGroup === group.label}
            onClick={() => setOpenGroup(openGroup === group.label ? '' : group.label)}
          >
            <HeroIcon name={group.icon} />
            <span>{group.label}</span>
            <HeroIcon name="chevronDown" className="dashboard-nav-caret" />
          </button>
          <div className="dashboard-nav-dropdown">
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="dashboard-nav-item-icon"><HeroIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  ));

  return (
    <header className="dashboard-nav">
      <div className="dashboard-nav-inner">
        <Link className="dashboard-nav-brand" to="/dashboard" aria-label="Dashboard Smart City">
          <BrandLogo compact className="dashboard-nav-logo" />
        </Link>

        <div className="dashboard-uniqlo-header-actions">
          <div className="dashboard-mobile-inline-tools">
            {mobileActions}
          </div>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                className="dashboard-nav-toggle"
                type="button"
                aria-label={mobileOpen ? 'Tutup menu dashboard' : 'Buka menu dashboard'}
              >
                <HeroIcon name={mobileOpen ? 'xMark' : 'bars'} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dashboard-mobile-overlay" />
              <Dialog.Content className="dashboard-mobile-sheet">
                <div className="dashboard-mobile-header">
                  <BrandLogo compact className="dashboard-mobile-logo" />
                  <Dialog.Title className="dashboard-mobile-title">Menu Portal</Dialog.Title>
                  <Dialog.Close className="dashboard-mobile-close" aria-label="Tutup menu dashboard">
                    <HeroIcon name="xMark" />
                  </Dialog.Close>
                </div>
                <nav className={cn('dashboard-nav-menu mobile-open', searchOpen && 'searching')} aria-label="Navigasi dashboard mobile">
                  {renderSearch(mobileSearchInputRef)}
                  {renderGroups()}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <nav className={cn('dashboard-nav-menu dashboard-nav-menu-desktop', searchOpen && 'searching')} aria-label="Navigasi dashboard">
          {renderSearch(searchInputRef)}
          {renderGroups()}
        </nav>
      </div>
      {renderSubNav()}
    </header>
  );
}
