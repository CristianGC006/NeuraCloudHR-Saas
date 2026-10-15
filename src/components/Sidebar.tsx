import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CalendarX2,
  ChevronLeft,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/empleados',     icon: Users,           label: 'Empleados' },
  { to: '/nomina',        icon: DollarSign,      label: 'Nómina' },
  { to: '/incapacidades', icon: CalendarX2,      label: 'Incapacidades' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
        border-r border-surface-border bg-surface-card
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-900/50 shrink-0">
          <Cpu size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-none">NeuraCloud</p>
            <p className="text-xs text-brand-400 font-medium mt-0.5">HR Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold px-2 mb-3">
            Menú principal
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={`nav-icon shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Collapse Button */}
      <div className="px-3 py-4 border-t border-surface-border shrink-0">
        <button
          onClick={onToggle}
          className={`btn-ghost w-full ${collapsed ? 'justify-center' : 'justify-between'}`}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {!collapsed && <span className="text-sm">Colapsar</span>}
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
