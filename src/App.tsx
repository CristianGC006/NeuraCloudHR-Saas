import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import Contratos from './pages/Contratos';
import Nomina from './pages/Nomina';
import Incapacidades from './pages/Incapacidades';
import Organizacion from './pages/Organizacion';
import Configuracion from './pages/Configuracion';
import { ensureSeedData } from './data/hrStore';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-0 md:pl-[72px]' : 'pl-0 md:pl-[260px]'
        }`}
      >
        <div className="p-4 sm:p-6 max-w-[1440px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/nomina" element={<Nomina />} />
            <Route path="/incapacidades" element={<Incapacidades />} />
            <Route path="/departamentos" element={<Organizacion />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    ensureSeedData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<Login />} />

        {/* Protected application routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
