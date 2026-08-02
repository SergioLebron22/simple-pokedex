import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import AuthModal         from './components/AuthModal';
import { useAuth }       from './context/AuthContext';
import HomePage          from './pages/HomePage';
import NationalDexPage   from './pages/NationalDexPage';
import MyBindersPage     from './pages/MyBindersPage';
import CustomBinderPage  from './pages/CustomBinderPage';
import MasterSetsPage      from './pages/MasterSetsPage';
import MasterSetBinderPage from './pages/MasterSetBinderPage';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const { authModalOpen, closeAuthModal } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/national-dex" element={
          <ProtectedRoute><NationalDexPage /></ProtectedRoute>
        } />
        <Route path="/binders" element={
          <ProtectedRoute><MyBindersPage /></ProtectedRoute>
        } />
        <Route path="/binders/:id" element={
          <ProtectedRoute><CustomBinderPage /></ProtectedRoute>
        } />
        <Route path="/mastersets" element={
          <ProtectedRoute><MasterSetsPage /></ProtectedRoute>
        } />
        <Route path="/mastersets/:setId" element={
          <ProtectedRoute><MasterSetBinderPage /></ProtectedRoute>
        } />
      </Routes>
      {authModalOpen && <AuthModal onClose={closeAuthModal} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
