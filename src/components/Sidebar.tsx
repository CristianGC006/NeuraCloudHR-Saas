import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSignature,
  DollarSign,
  CalendarX2,
  Building2,
  Settings,
  ChevronLeft,
  Cpu,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/empleados',     icon: Users,           label: 'Empleados' },
  { to: '/contratos',     icon: FileSignature,   label: 'Contratos' },
  { to: '/nomina',        icon: DollarSign,      label: 'Nómina' },
  { to: '/incapacidades', icon: CalendarX2,      label: 'Novedades' },
  { to: '/departamentos', icon: Building2,       label: 'Organización' },
  { to: '/configuracion', icon: Settings,        label: 'Configuración' },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
        border-r border-surface-border bg-surface-card shadow-xl
        ${
          mobileOpen
            ? 'w-[260px] translate-x-0'
            : collapsed
            ? 'w-[72px] -translate-x-full md:translate-x-0'
            : 'w-[260px] -translate-x-full md:translate-x-0'
        }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-surface-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-900/50 shrink-0 border border-brand-500/30">
            <Cpu size={18} className="text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-none">NeuraCloud</p>
              <p className="text-xs text-brand-400 font-medium mt-0.5">HR SaaS</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden btn-ghost p-1.5 text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {(!collapsed || mobileOpen) && (
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold px-2 mb-2">
            Módulos Principales
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          const isCollapsedMode = collapsed && !mobileOpen;

          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (mobileOpen && onMobileClose) {
                  onMobileClose();
                }
              }}
              className={`nav-item ${isActive ? 'active' : ''} ${
                isCollapsedMode ? 'justify-center px-0' : ''
              }`}
              title={isCollapsedMode ? label : undefined}
            >
              <Icon
                size={18}
                className={`nav-icon shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}
              />
              {(!collapsed || mobileOpen) && <span className="font-medium text-sm">{label}</span>}
              {isActive && (!collapsed || mobileOpen) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Desktop Button */}
      <div className="hidden md:block px-3 py-3 border-t border-surface-border shrink-0">
        <button
          type="button"
          onClick={onToggle}
          className={`btn-ghost w-full ${collapsed ? 'justify-center' : 'justify-between'}`}
          title={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
        >
          {!collapsed && <span className="text-xs font-medium text-slate-400">Contraer menú</span>}
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 text-slate-400 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      {sidebarContent}
    </>
  );
}
