import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;        // percentage change
  trendLabel?: string;
  accent?: string;       // tailwind bg gradient class
  subtitle?: string;
}

export function StatCard({ title, value, icon, trend, trendLabel, accent, subtitle }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className={`card stat-glow relative`}>
      {/* accent bg */}
      {accent && (
        <div className={`absolute inset-0 rounded-2xl opacity-5 ${accent}`} />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend).toFixed(1)}%
              {trendLabel && <span className="text-slate-500 font-normal ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-slate-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {badge && <span className="badge-blue text-xs">{badge}</span>}
        </div>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, actions, children, className = '' }: SectionCardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="mb-6 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      Datos de demostración — los datos reales se cargarán al conectar la fuente de datos
    </div>
  );
}
