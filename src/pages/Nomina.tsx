import { useState } from 'react';
import { Search, FileText, Download, RefreshCw } from 'lucide-react';
import { PageHeader, SectionCard, StatCard, DemoBanner } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import { DEMO_PAYROLL, type PayrollRecord } from '../data/demoData';
import { DollarSign, TrendingUp } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const estadoBadge = (estado: PayrollRecord['estado']) => {
  if (estado === 'pagada')     return <span className="badge badge-green">Pagada</span>;
  if (estado === 'procesada')  return <span className="badge badge-blue">Procesada</span>;
  return <span className="badge badge-yellow">Pendiente</span>;
};

const COLUMNS = [
  { key: 'id',            header: 'ID',          render: (r: PayrollRecord) => <span className="text-xs text-slate-500 font-mono">{r.id}</span> },
  { key: 'nombre',        header: 'Empleado',    render: (r: PayrollRecord) => <span className="font-medium text-slate-200">{r.nombre}</span> },
  { key: 'periodo',       header: 'Período',     render: (r: PayrollRecord) => <span className="text-slate-400">{r.periodo}</span> },
  { key: 'salarioBase',   header: 'Salario Base', render: (r: PayrollRecord) => <span className="text-slate-300">{fmt(r.salarioBase)}</span> },
  { key: 'bonificaciones', header: 'Bonificaciones', render: (r: PayrollRecord) => <span className="text-emerald-400">{fmt(r.bonificaciones)}</span> },
  { key: 'deducciones',   header: 'Deducciones', render: (r: PayrollRecord) => <span className="text-red-400">{fmt(r.deducciones)}</span> },
  { key: 'neto',          header: 'Neto a Pagar', render: (r: PayrollRecord) => <span className="font-bold text-white">{fmt(r.neto)}</span> },
  { key: 'estado',        header: 'Estado',      render: (r: PayrollRecord) => estadoBadge(r.estado) },
];

export default function Nomina() {
  const [search, setSearch] = useState('');

  const filtered = DEMO_PAYROLL.filter(n =>
    n.nombre.toLowerCase().includes(search.toLowerCase()) ||
    n.periodo.toLowerCase().includes(search.toLowerCase())
  );

  const totalNeto  = DEMO_PAYROLL.reduce((s, r) => s + r.neto, 0);
  const totalBonos = DEMO_PAYROLL.reduce((s, r) => s + r.bonificaciones, 0);
  const totalDed   = DEMO_PAYROLL.reduce((s, r) => s + r.deducciones, 0);
  const pagadas    = DEMO_PAYROLL.filter(r => r.estado === 'pagada').length;

  return (
    <div>
      <PageHeader
        title="Nómina"
        subtitle="Gestión de pagos y liquidaciones — Octubre 2026"
        actions={
          <>
            <button className="btn-secondary"><RefreshCw size={14} /> Recalcular</button>
            <button className="btn-secondary"><Download size={14} /> Exportar</button>
            <button className="btn-primary"><FileText size={14} /> Nueva Nómina</button>
          </>
        }
      />
      <DemoBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Neto"      value={fmt(totalNeto)}  icon={<DollarSign size={20} />} accent="bg-brand-500" />
        <StatCard title="Bonificaciones"  value={fmt(totalBonos)} icon={<TrendingUp size={20} />} accent="bg-emerald-500" />
        <StatCard title="Deducciones"     value={fmt(totalDed)}   icon={<TrendingUp size={20} />} accent="bg-red-500" />
        <StatCard title="Nóminas Pagadas" value={`${pagadas} / ${DEMO_PAYROLL.length}`} icon={<FileText size={20} />} accent="bg-violet-500" />
      </div>

      <SectionCard
        title="Registros de Nómina"
        subtitle={`Período: Octubre 2026 · ${filtered.length} registros`}
        actions={
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 h-8 text-xs w-44"
            />
          </div>
        }
      >
        <DataTable columns={COLUMNS} data={filtered} emptyMessage="No se encontraron registros de nómina" />
      </SectionCard>
    </div>
  );
}
