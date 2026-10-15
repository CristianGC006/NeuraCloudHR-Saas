import { useState } from 'react';
import { Search, UserPlus, Filter, Download } from 'lucide-react';
import { PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import { DataTable, Avatar } from '../components/ui/Table';
import { DEMO_EMPLOYEES, type Employee } from '../data/demoData';

const statoBadge = (estado: Employee['estado']) => {
  if (estado === 'activo')     return <span className="badge badge-green">Activo</span>;
  if (estado === 'vacaciones') return <span className="badge badge-yellow">Vacaciones</span>;
  return <span className="badge badge-gray">Inactivo</span>;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const COLUMNS = [
  {
    key: 'nombre',
    header: 'Empleado',
    render: (row: Employee) => (
      <div className="flex items-center gap-3">
        <Avatar initials={row.avatar} />
        <div>
          <p className="font-medium text-slate-200 text-sm">{row.nombre}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'cargo',         header: 'Cargo',         render: (r: Employee) => <span className="text-slate-300">{r.cargo}</span> },
  { key: 'departamento',  header: 'Departamento',   render: (r: Employee) => <span className="badge badge-blue">{r.departamento}</span> },
  { key: 'fechaIngreso',  header: 'Fecha Ingreso',  render: (r: Employee) => <span className="text-slate-400 text-xs">{r.fechaIngreso}</span> },
  { key: 'salarioBase',   header: 'Salario Base',   render: (r: Employee) => <span className="font-semibold text-slate-200">{fmt(r.salarioBase)}</span> },
  { key: 'estado',        header: 'Estado',         render: (r: Employee) => statoBadge(r.estado) },
];

export default function Empleados() {
  const [search, setSearch] = useState('');

  const filtered = DEMO_EMPLOYEES.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.departamento.toLowerCase().includes(search.toLowerCase()) ||
    e.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const activos    = DEMO_EMPLOYEES.filter(e => e.estado === 'activo').length;
  const vacaciones = DEMO_EMPLOYEES.filter(e => e.estado === 'vacaciones').length;
  const inactivos  = DEMO_EMPLOYEES.filter(e => e.estado === 'inactivo').length;

  return (
    <div>
      <PageHeader
        title="Empleados"
        subtitle={`${DEMO_EMPLOYEES.length} empleados registrados`}
        actions={
          <>
            <button className="btn-secondary"><Download size={15} /> Exportar</button>
            <button className="btn-primary"><UserPlus size={15} /> Nuevo Empleado</button>
          </>
        }
      />
      <DemoBanner />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-sm flex items-center gap-3">
          <span className="badge badge-green text-sm">{activos}</span>
          <span className="text-xs text-slate-500">Activos</span>
        </div>
        <div className="card-sm flex items-center gap-3">
          <span className="badge badge-yellow text-sm">{vacaciones}</span>
          <span className="text-xs text-slate-500">Vacaciones</span>
        </div>
        <div className="card-sm flex items-center gap-3">
          <span className="badge badge-gray text-sm">{inactivos}</span>
          <span className="text-xs text-slate-500">Inactivos</span>
        </div>
      </div>

      {/* Table card */}
      <SectionCard
        title="Directorio de Empleados"
        subtitle="Lista completa del personal"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-8 text-xs w-48"
              />
            </div>
            <button className="btn-ghost py-1.5"><Filter size={14} /></button>
          </div>
        }
      >
        <DataTable columns={COLUMNS} data={filtered} emptyMessage="No se encontraron empleados" />
      </SectionCard>
    </div>
  );
}
