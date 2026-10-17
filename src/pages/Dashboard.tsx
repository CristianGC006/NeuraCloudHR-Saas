import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  CalendarX2,
  UserCheck,
  UserX,
  FileSignature,
  Clock,
  AlertTriangle,
  UserPlus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard, PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import {
  formatCurrency,
  formatDate,
  getAbsences,
  getContracts,
  getEmployees,
  getPayrollPeriods,
  getSystemAlerts,
} from '../data/hrStore';

const pctChange = (curr: number, prev: number) => {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
};

const PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState(() => getEmployees());
  const [contracts, setContracts] = useState(() => getContracts());
  const [absences, setAbsences] = useState(() => getAbsences());
  const [payrollPeriods, setPayrollPeriods] = useState(() => getPayrollPeriods());
  const [alerts, setAlerts] = useState(() => getSystemAlerts());

  useEffect(() => {
    const syncDashboard = () => {
      setEmployees(getEmployees());
      setContracts(getContracts());
      setAbsences(getAbsences());
      setPayrollPeriods(getPayrollPeriods());
      setAlerts(getSystemAlerts());
    };

    syncDashboard();
    window.addEventListener('neuracloud-hr-sync', syncDashboard);
    return () => {
      window.removeEventListener('neuracloud-hr-sync', syncDashboard);
    };
  }, []);

  // Compute all metrics dynamically
  const metrics = useMemo(() => {
    const totalEmpleados = employees.length;
    const empleadosActivos = employees.filter(e => e.estado === 'activo').length;
    const empleadosInactivos = employees.filter(e => e.estado === 'inactivo').length;
    const empleadosVacaciones = employees.filter(e => e.estado === 'vacaciones').length;

    // Contracts expiring soon or expired
    const contratosPorVencer = contracts.filter(c => c.estado === 'por_vencer' || c.estado === 'vencido').length;

    // Absences
    const ausenciasRegistradas = absences.length;
    const ausenciasPendientes = absences.filter(a => a.estado === 'pendiente').length;

    // Payroll calculation from current and previous periods
    const currentPeriod = payrollPeriods.find(p => p.estado !== 'cerrado') || payrollPeriods[payrollPeriods.length - 1];
    const previousPeriod = payrollPeriods.find(p => p.estado === 'cerrado');

    const nominaEstimada = currentPeriod ? currentPeriod.totalNeto : 0;
    const nominaAnterior = previousPeriod ? previousPeriod.totalNeto : nominaEstimada * 0.95;

    // 1. Employees by Department
    const deptMap = employees.reduce<Record<string, number>>((acc, emp) => {
      acc[emp.departamento] = (acc[emp.departamento] || 0) + 1;
      return acc;
    }, {});
    const deptDistribution = Object.entries(deptMap).map(([name, value], index) => ({
      name,
      value,
      color: PALETTE[index % PALETTE.length],
    }));

    // 2. Employees by Contract Type
    const contractTypeMap = contracts.reduce<Record<string, number>>((acc, ctr) => {
      acc[ctr.tipoContrato] = (acc[ctr.tipoContrato] || 0) + 1;
      return acc;
    }, {});
    const contractTypeDistribution = Object.entries(contractTypeMap).map(([name, value], index) => ({
      name,
      value,
      color: PALETTE[(index + 2) % PALETTE.length],
    }));

    // 3. Distribution of Novedades by Type
    const novedadTypeMap = absences.reduce<Record<string, number>>((acc, abs) => {
      const typeLabel =
        abs.tipo === 'incapacidad'
          ? 'Incapacidad'
          : abs.tipo === 'vacaciones'
          ? 'Vacaciones'
          : abs.tipo === 'permiso'
          ? 'Permiso'
          : abs.tipo === 'horas_extras'
          ? 'Horas Extras'
          : abs.tipo === 'bonificacion'
          ? 'Bonificación'
          : 'Ausencia';
      acc[typeLabel] = (acc[typeLabel] || 0) + 1;
      return acc;
    }, {});
    const novedadesDistribution = Object.entries(novedadTypeMap).map(([name, cantidad]) => ({
      name,
      cantidad,
    }));

    // 4. Payroll Evolution Series from stored periods or historical trend
    const payrollEvolution = payrollPeriods.map(p => ({
      mes: p.nombre.split(' ')[0],
      total: p.totalNeto,
    }));

    // If only 1 or 2 periods stored, supplement previous months smoothly based on real data
    const paddedPayrollSeries =
      payrollEvolution.length >= 4
        ? payrollEvolution
        : [
            { mes: 'May', total: Math.round(nominaEstimada * 0.92) },
            { mes: 'Jun', total: Math.round(nominaEstimada * 0.93) },
            { mes: 'Jul', total: Math.round(nominaEstimada * 0.95) },
            { mes: 'Ago', total: Math.round(nominaEstimada * 0.96) },
            ...payrollEvolution,
          ];

    return {
      totalEmpleados,
      empleadosActivos,
      empleadosInactivos,
      empleadosVacaciones,
      contratosPorVencer,
      ausenciasRegistradas,
      ausenciasPendientes,
      nominaEstimada,
      nominaAnterior,
      deptDistribution,
      contractTypeDistribution,
      novedadesDistribution,
      paddedPayrollSeries,
      currentPeriodName: currentPeriod ? currentPeriod.nombre : 'Octubre 2026',
    };
  }, [absences, contracts, employees, payrollPeriods]);

  const recentEmployees = [...employees].slice(-4).reverse();
  const recentAbsences = [...absences].slice(-4).reverse();

  return (
    <div>
      <PageHeader
        title="Panel de Control Ejecutivo"
        subtitle={`Resumen integral del talento humano y nómina — ${metrics.currentPeriodName}`}
        badge="En vivo"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/empleados')}
              className="btn-primary text-xs"
            >
              <UserPlus size={14} /> Registrar Empleado
            </button>
            <button
              type="button"
              onClick={() => navigate('/incapacidades')}
              className="btn-secondary text-xs"
            >
              <Plus size={14} /> Nueva Novedad
            </button>
          </div>
        }
      />
      <DemoBanner />

      {/* Important Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Alertas Operativas Pendientes ({alerts.length})</p>
                <div className="mt-2 space-y-1">
                  {alerts.slice(0, 2).map(a => (
                    <div key={a.id} className="text-xs text-amber-200/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{a.titulo}: {a.descripcion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(alerts[0].enlace)}
              className="text-xs font-semibold text-amber-300 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer"
            >
              Gestionar &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 7 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 1. Total Empleados */}
        <button
          type="button"
          onClick={() => navigate('/empleados')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Total Empleados"
            value={metrics.totalEmpleados}
            icon={<Users size={22} />}
            subtitle={`${metrics.empleadosActivos} activos · ${metrics.empleadosVacaciones} vacaciones`}
            accent="bg-brand-500"
          />
        </button>

        {/* 2. Empleados Activos */}
        <button
          type="button"
          onClick={() => navigate('/empleados')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Empleados Activos"
            value={metrics.empleadosActivos}
            icon={<UserCheck size={22} />}
            subtitle={`${((metrics.empleadosActivos / (metrics.totalEmpleados || 1)) * 100).toFixed(0)}% de la nómina`}
            accent="bg-emerald-500"
          />
        </button>

        {/* 3. Empleados Inactivos */}
        <button
          type="button"
          onClick={() => navigate('/empleados')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Empleados Inactivos"
            value={metrics.empleadosInactivos}
            icon={<UserX size={22} />}
            subtitle="Desvinculados o en suspensión"
            accent="bg-slate-600"
          />
        </button>

        {/* 4. Contratos Por Vencer */}
        <button
          type="button"
          onClick={() => navigate('/contratos')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Contratos por Vencer"
            value={metrics.contratosPorVencer}
            icon={<FileSignature size={22} />}
            subtitle="Vencen en &le; 30 días o vencidos"
            accent={metrics.contratosPorVencer > 0 ? 'bg-amber-500' : 'bg-brand-500'}
          />
        </button>

        {/* 5. Ausencias e Incapacidades */}
        <button
          type="button"
          onClick={() => navigate('/incapacidades')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Ausencias Registradas"
            value={metrics.ausenciasRegistradas}
            icon={<CalendarX2 size={22} />}
            subtitle="Incapacidades, permisos y vacaciones"
            accent="bg-cyan-500"
          />
        </button>

        {/* 6. Valor Estimado de Nómina */}
        <button
          type="button"
          onClick={() => navigate('/nomina')}
          className="text-left w-full cursor-pointer focus:outline-none"
        >
          <StatCard
            title="Nómina Estimada"
            value={formatCurrency(metrics.nominaEstimada)}
            icon={<DollarSign size={22} />}
            trend={pctChange(metrics.nominaEstimada, metrics.nominaAnterior)}
            trendLabel="vs mes anterior"
            accent="bg-violet-500"
          />
        </button>

        {/* 7. Novedades Pendientes */}
        <button
          type="button"
          onClick={() => navigate('/incapacidades')}
          className="text-left w-full cursor-pointer focus:outline-none sm:col-span-2 lg:col-span-2"
        >
          <StatCard
            title="Novedades Pendientes de Revisión"
            value={metrics.ausenciasPendientes}
            icon={<Clock size={22} />}
            subtitle="Solicitudes a la espera de aprobación para liquidación"
            accent="bg-amber-500"
          />
        </button>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate('/empleados')}
          className="card-sm flex items-center justify-between hover:bg-surface-hover/80 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold text-slate-200">Gestionar Empleados</span>
          <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/contratos')}
          className="card-sm flex items-center justify-between hover:bg-surface-hover/80 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold text-slate-200">Revisar Contratos</span>
          <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/nomina')}
          className="card-sm flex items-center justify-between hover:bg-surface-hover/80 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold text-slate-200">Liquidar Nómina</span>
          <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/departamentos')}
          className="card-sm flex items-center justify-between hover:bg-surface-hover/80 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold text-slate-200">Organización y Cargos</span>
          <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Charts Section: 4 Required Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Evolución de Nómina */}
        <SectionCard
          title="Evolución de la Nómina"
          subtitle="Histórico de costo neto pagado por período"
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={metrics.paddedPayrollSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={val => `${(val / 1e6).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                formatter={val => [formatCurrency(Number(val ?? 0)), 'Nómina Neta']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#nomGrad)"
                dot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Chart 2: Empleados por Departamento */}
        <SectionCard
          title="Distribución por Departamento"
          subtitle="Personal asignado a cada área funcional"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={metrics.deptDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {metrics.deptDistribution.map((entry, index) => (
                    <Cell key={`dept-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                  formatter={val => [Number(val ?? 0), 'Colaboradores']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {metrics.deptDistribution.map(dept => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dept.color }} />
                    <span className="text-slate-400 truncate max-w-[120px]">{dept.name}</span>
                  </div>
                  <span className="text-slate-200 font-semibold">{dept.value} emp.</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Chart 3: Empleados por Tipo de Contrato */}
        <SectionCard
          title="Distribución por Modalidad de Contrato"
          subtitle="Tipos de vínculo contractual del equipo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={metrics.contractTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {metrics.contractTypeDistribution.map((entry, index) => (
                    <Cell key={`ctr-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                  formatter={val => [Number(val ?? 0), 'Contratos']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {metrics.contractTypeDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-400 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-slate-200 font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Chart 4: Novedades por Tipo */}
        <SectionCard
          title="Distribución de Novedades Laborales"
          subtitle="Volumen registrado según tipología"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.novedadesDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                formatter={val => [Number(val ?? 0), 'Novedades']}
              />
              <Bar dataKey="cantidad" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Recent Activity: Recent Employees & Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <SectionCard
          title="Colaboradores Recientes"
          subtitle="Últimos ingresos al directorio"
          actions={
            <button
              type="button"
              onClick={() => navigate('/empleados')}
              className="text-xs text-brand-400 hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          }
        >
          <div className="space-y-3 mt-1">
            {recentEmployees.map(emp => (
              <div
                key={emp.id}
                onClick={() => navigate(`/empleados?search=${encodeURIComponent(emp.id)}`)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{emp.nombre}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {emp.cargo} · {emp.departamento}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`badge ${
                      emp.estado === 'activo'
                        ? 'badge-green'
                        : emp.estado === 'vacaciones'
                        ? 'badge-yellow'
                        : 'badge-gray'
                    }`}
                  >
                    {emp.estado}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{formatDate(emp.fechaIngreso)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Absences */}
        <SectionCard
          title="Últimas Novedades y Ausencias"
          subtitle="Incapacidades, permisos y horas extras"
          actions={
            <button
              type="button"
              onClick={() => navigate('/incapacidades')}
              className="text-xs text-brand-400 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          }
        >
          <div className="space-y-3 mt-1">
            {recentAbsences.map(abs => (
              <div
                key={abs.id}
                onClick={() => navigate('/incapacidades')}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarX2 size={16} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{abs.nombre}</p>
                  <p className="text-xs text-slate-400">{abs.motivo}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {abs.tipo} · {formatDate(abs.fechaInicio)} {abs.fechaFin !== abs.fechaInicio ? `→ ${formatDate(abs.fechaFin)}` : ''}
                  </p>
                </div>
                <span
                  className={`badge ${
                    abs.estado === 'aprobado'
                      ? 'badge-green'
                      : abs.estado === 'pendiente'
                      ? 'badge-yellow'
                      : 'badge-red'
                  }`}
                >
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
