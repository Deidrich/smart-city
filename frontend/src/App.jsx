import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// App pages
import ProfileDashboard from './pages/profile/ProfileDashboard';
import DashboardKota from './pages/dashboard/DashboardKota';
import PetaInteraktif from './pages/peta/PetaInteraktif';
import KualitasUdara from './pages/udara/KualitasUdara';
import LaluLintas from './pages/lalulintas/LaluLintas';
import Transportasi from './pages/transportasi/Transportasi';
import LayananKota from './pages/layanan/LayananKota';
import LayananPublik from './pages/publik/LayananPublik';
import AdminPanel from './pages/admin/AdminPanel';
import StatusAirBersih from './pages/air/StatusAirBersih';
import Energi from "./pages/energi/Energi";
import Sampah from "./pages/sampah/Sampah";
import MonitoringPage from './pages/monitoring/MonitoringPage';
import LayananPage from './pages/layanan/LayananPage';
import HomePage from './pages/home/HomePage';
import BrandLogo from './components/BrandLogo';

import './index.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#111E43', color: '#E3B473', flexDirection: 'column', gap: 16,
      fontSize: 18, fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <BrandLogo variant="white" />
      <span>Memuat portal...</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  const getLoginRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login"           element={user ? <Navigate to={getLoginRedirect()} replace /> : <Login />} />
      <Route path="/register"        element={user ? <Navigate to={getLoginRedirect()} replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getLoginRedirect()} replace /> : <ForgotPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardKota /></ProtectedRoute>} />
      <Route path="/monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
      <Route path="/peta" element={<ProtectedRoute><PetaInteraktif /></ProtectedRoute>} />
      <Route path="/udara" element={<ProtectedRoute><KualitasUdara /></ProtectedRoute>} />
      <Route path="/lalu-lintas" element={<ProtectedRoute><LaluLintas /></ProtectedRoute>} />
      <Route path="/transportasi" element={<ProtectedRoute><Transportasi /></ProtectedRoute>} />
      <Route path="/layanan" element={<ProtectedRoute><LayananPage /></ProtectedRoute>} />
      <Route path="/layanan-kota" element={<ProtectedRoute><LayananKota /></ProtectedRoute>} />
      <Route path="/layanan-publik" element={<ProtectedRoute><LayananPublik /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
      <Route path="/air-bersih" element={<ProtectedRoute><StatusAirBersih /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><ProfileDashboard /></ProtectedRoute>} />
      <Route path="/energi" element={<ProtectedRoute><Energi /></ProtectedRoute>} />
      <Route path="/sampah" element={<ProtectedRoute><Sampah /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111E43',
              color: '#E3B473',
            },
            success: {
              iconTheme: {
                primary: '#E3B473',
                secondary: '#111E43',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#111E43',
              },
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
