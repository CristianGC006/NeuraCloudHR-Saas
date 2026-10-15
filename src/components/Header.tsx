import { Bell, Search, Settings } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-40 h-16 flex items-center gap-4 px-6
        border-b border-surface-border bg-surface/80 backdrop-blur-sm
        transition-all duration-300
        ${sidebarCollapsed ? 'left-[72px]' : 'left-[260px]'}`}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar empleados, nóminas…"
          className="input pl-9 h-9 text-sm"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative btn-ghost p-2">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-surface" />
        </button>

        {/* Settings */}
        <button className="btn-ghost p-2">
          <Settings size={18} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
            HR
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-200 leading-none">Admin RR.HH.</p>
            <p className="text-xs text-slate-500 mt-0.5">neuracloud.co</p>
          </div>
        </div>
      </div>
    </header>
  );
}
