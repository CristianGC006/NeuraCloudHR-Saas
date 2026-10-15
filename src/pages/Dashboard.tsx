import {
  Users, DollarSign, CalendarX2, TrendingUp,
  UserCheck, UserX, Briefcase
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { StatCard, PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import {
  DASHBOARD_STATS, PAYROLL_MONTHLY, DEPT_DISTRIBUTION, DEMO_ABSENCES, DEMO_EMPLOYEES
} from '../data/demoData';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const pctChange = (curr: number, prev: number) => ((curr - prev) / prev) * 100;

export default function Dashboard() {
  const recentAbsences = DEMO_ABSENCES.slice(0, 4);
  const recentEmployees = DEMO_EMPLOYEES.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen ejecutivo del equipo — Octubre 2026"
        badge="En vivo"
      />
      <DemoBanner />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Empleados"
          value={DASHBOARD_STATS.totalEmpleados}
          icon={<Users size={22} />}
          subtitle={`${DASHBOARD_STATS.empleadosActivos} activos · ${DASHBOARD_STATS.empleadosVacaciones} vacaciones`}
          accent="bg-brand-500"
        />
        <StatCard
          title="Nómina Mensual"
          value={fmt(DASHBOARD_STATS.nominaMensual)}
          icon={<DollarSign size={22} />}
          trend={pctChange(DASHBOARD_STATS.nominaMensual, DASHBOARD_STATS.nominaAnterior)}
          trendLabel="vs mes anterior"
          accent="bg-violet-500"
        />
        <StatCard
          title="Empleados Activos"
          value={DASHBOARD_STATS.empleadosActivos}
          icon={<UserCheck size={22} />}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Ausencias Activas"
          value={DASHBOARD_STATS.ausenciasActivas}
          icon={<CalendarX2 size={22} />}
          subtitle={`${DASHBOARD_STATS.incapacidadesActivas} incapacidades`}
          accent="bg-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Area chart */}
        <SectionCard
          title="Evolución de Nómina"
          subtitle="Últimos 6 meses"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PAYROLL_MONTHLY} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1e6).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(v: number) => [fmt(v), 'Nómina']}
              />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#nomGrad)" dot={{ r: 4, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Pie chart - departments */}
        <SectionCard title="Distribución por Dpto." subtitle="Empleados activos">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DEPT_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {DEPT_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                formatter={(v: number, name: string) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {DEPT_DISTRIBUTION.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent employees */}
        <SectionCard title="Empleados Recientes" subtitle="Últimos ingresos">
          <div className="space-y-3 mt-1">
            {recentEmployees.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{emp.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{emp.cargo} · {emp.departamento}</p>
                </div>
                <span className={`badge ${emp.estado === 'activo' ? 'badge-green' : emp.estado === 'vacaciones' ? 'badge-yellow' : 'badge-gray'}`}>
                  {emp.estado}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent absences */}
        <SectionCard title="Ausencias Recientes" subtitle="Incapacidades y permisos">
          <div className="space-y-3 mt-1">
            {recentAbsences.map(abs => (
              <div key={abs.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <CalendarX2 size={16} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{abs.nombre}</p>
                  <p className="text-xs text-slate-500">{abs.tipo} · {abs.dias} día{abs.dias !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{abs.fechaInicio} → {abs.fechaFin}</p>
                </div>
                <span className={`badge ${abs.estado === 'aprobado' ? 'badge-green' : abs.estado === 'pendiente' ? 'badge-yellow' : 'badge-red'}`}>
                  {abs.estado}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
