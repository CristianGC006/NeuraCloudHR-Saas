import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import Nomina from './pages/Nomina';
import Incapacidades from './pages/Incapacidades';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        <Header sidebarCollapsed={sidebarCollapsed} />

        <main
          className={`pt-16 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'pl-[72px]' : 'pl-[260px]'
          }`}
        >
          <div className="p-6 max-w-[1400px]">
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/empleados"     element={<Empleados />} />
              <Route path="/nomina"        element={<Nomina />} />
              <Route path="/incapacidades" element={<Incapacidades />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
