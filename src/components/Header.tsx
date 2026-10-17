import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  User,
  AlertTriangle,
  Clock,
  Menu,
} from 'lucide-react';
import {
  getAuthSession,
  getCompanySettings,
  getContracts,
  getEmployees,
  getSystemAlerts,
  logoutDemo,
  type SystemAlert,
} from '../data/hrStore';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export default function Header({ sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const session = getAuthSession();
  const company = getCompanySettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => getSystemAlerts());

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAlerts = () => {
      setAlerts(getSystemAlerts());
    };

    window.addEventListener('neuracloud-hr-sync', syncAlerts);
    return () => {
      window.removeEventListener('neuracloud-hr-sync', syncAlerts);
    };
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search filtering
  const searchResults = (() => {
    if (!searchQuery.trim()) return { employees: [], contracts: [] };
    const query = searchQuery.toLowerCase();
    const emps = getEmployees()
      .filter(
        e =>
          e.nombre.toLowerCase().includes(query) ||
          e.cargo.toLowerCase().includes(query) ||
          e.departamento.toLowerCase().includes(query) ||
          (e.documento && e.documento.includes(query)),
      )
      .slice(0, 4);

    const ctrs = getContracts()
      .filter(
        c =>
          c.empleadoNombre.toLowerCase().includes(query) ||
          c.tipoContrato.toLowerCase().includes(query) ||
          c.cargo.toLowerCase().includes(query),
      )
      .slice(0, 3);

    return { employees: emps, contracts: ctrs };
  })();

  const handleLogout = () => {
    logoutDemo();
    navigate('/login', { replace: true });
  };

  const handleSelectEmployee = (empId: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(`/empleados?search=${encodeURIComponent(empId)}`);
  };

  const handleSelectContract = (ctrId: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(`/contratos?search=${encodeURIComponent(ctrId)}`);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 h-16 flex items-center gap-3 px-4 sm:px-6
        border-b border-surface-border bg-surface-card/90 backdrop-blur-md
        transition-all duration-300
        ${sidebarCollapsed ? 'left-0 md:left-[72px]' : 'left-0 md:left-[260px]'}`}
    >
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="md:hidden btn-ghost p-2 text-slate-300"
        aria-label="Abrir menú de navegación"
      >
        <Menu size={20} />
      </button>

      {/* Global Interactive Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar empleados, contratos, nóminas..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          className="input pl-9 h-9 text-xs sm:text-sm bg-slate-900/60"
        />

        {/* Live Search Results Dropdown */}
        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
            {searchResults.employees.length === 0 && searchResults.contracts.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 text-center">No se encontraron resultados para "{searchQuery}"</p>
            ) : (
              <>
                {searchResults.employees.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Empleados</p>
                    {searchResults.employees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp.id)}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-white">{emp.nombre}</p>
                          <p className="text-slate-400 text-[11px]">{emp.cargo} · {emp.departamento}</p>
                        </div>
                        <span className="badge badge-blue text-[10px]">{emp.id}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.contracts.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-surface-border/60">
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Contratos</p>
                    {searchResults.contracts.map(ctr => (
                      <button
                        key={ctr.id}
                        type="button"
                        onClick={() => handleSelectContract(ctr.id)}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-white">{ctr.empleadoNombre}</p>
                          <p className="text-slate-400 text-[11px]">{ctr.tipoContrato} · {ctr.cargo}</p>
                        </div>
                        <span className="badge badge-yellow text-[10px]">{ctr.estado}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative btn-ghost p-2 text-slate-300 hover:text-white"
            title="Notificaciones y Alertas"
            aria-label="Ver alertas del sistema"
          >
            <Bell size={18} />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Alertas del Sistema</h4>
                  <span className="badge badge-blue text-[10px]">{alerts.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/configuracion');
                  }}
                  className="text-[11px] text-brand-400 hover:underline"
                >
                  Configurar
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay alertas pendientes en este momento.</p>
                ) : (
                  alerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(alert.enlace);
                      }}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-surface-border/60 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-start gap-2">
                        {alert.severidad === 'urgente' ? (
                          <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
                        ) : (
                          <Clock size={15} className="text-brand-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-200">{alert.titulo}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{alert.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Shortcut Button */}
        <button
          type="button"
          onClick={() => navigate('/configuracion')}
          className="btn-ghost p-2 text-slate-300 hover:text-white"
          title="Configuración de la empresa"
          aria-label="Ir a configuración"
        >
          <Settings size={18} />
        </button>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} className="relative pl-2 sm:pl-3 border-l border-surface-border">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-brand-900/40">
              {session?.nombre ? session.nombre.slice(0, 2).toUpperCase() : 'HR'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {session?.nombre || 'Admin RR.HH.'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                {company?.nombre?.split(' ')[0] || 'NeuraCloud'}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-surface-border/60 mb-1">
                <p className="text-xs font-bold text-white">{session?.nombre || 'Admin RR.HH.'}</p>
                <p className="text-[11px] text-brand-400 font-mono mt-0.5">{session?.username || 'admin'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{company?.nombre}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/configuracion');
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <Settings size={15} className="text-slate-400" />
                <span>Configuración de Empresa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/empleados');
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <User size={15} className="text-slate-400" />
                <span>Ver Mi Directorio</span>
              </button>

              <div className="my-1 border-t border-surface-border/60" />

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer font-medium"
              >
                <LogOut size={15} className="text-red-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
