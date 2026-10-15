import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import { DEMO_ABSENCES, type Absence } from '../data/demoData';

const tipoBadge = (tipo: Absence['tipo']) => {
  const map: Record<Absence['tipo'], string> = {
    incapacidad: 'badge-red',
    vacaciones:  'badge-yellow',
    permiso:     'badge-blue',
    ausencia:    'badge-gray',
  };
  return <span className={`badge ${map[tipo]}`}>{tipo}</span>;
};

const estadoBadge = (estado: Absence['estado']) => {
  if (estado === 'aprobado')  return <span className="badge badge-green">Aprobado</span>;
  if (estado === 'pendiente') return <span className="badge badge-yellow">Pendiente</span>;
  return <span className="badge badge-red">Rechazado</span>;
};

const COLUMNS = [
  { key: 'id',          header: 'ID',        render: (r: Absence) => <span className="text-xs text-slate-500 font-mono">{r.id}</span> },
  { key: 'nombre',      header: 'Empleado',  render: (r: Absence) => <span className="font-medium text-slate-200">{r.nombre}</span> },
  { key: 'tipo',        header: 'Tipo',      render: (r: Absence) => tipoBadge(r.tipo) },
  { key: 'motivo',      header: 'Motivo',    render: (r: Absence) => <span className="text-slate-400 text-xs">{r.motivo}</span> },
  { key: 'fechaInicio', header: 'Inicio',    render: (r: Absence) => <span className="text-slate-400 text-xs">{r.fechaInicio}</span> },
  { key: 'fechaFin',    header: 'Fin',       render: (r: Absence) => <span className="text-slate-400 text-xs">{r.fechaFin}</span> },
  { key: 'dias',        header: 'Días',      render: (r: Absence) => <span className="font-semibold text-slate-300">{r.dias}</span> },
  { key: 'estado',      header: 'Estado',    render: (r: Absence) => estadoBadge(r.estado) },
];

export default function Incapacidades() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  const filtered = DEMO_ABSENCES.filter(a => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.motivo.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === 'todos' || a.tipo === tipoFilter;
    return matchSearch && matchTipo;
  });

  const incapacidades = DEMO_ABSENCES.filter(a => a.tipo === 'incapacidad').length;
  const vacaciones    = DEMO_ABSENCES.filter(a => a.tipo === 'vacaciones').length;
  const permisos      = DEMO_ABSENCES.filter(a => a.tipo === 'permiso').length;
  const pendientes    = DEMO_ABSENCES.filter(a => a.estado === 'pendiente').length;

  return (
    <div>
      <PageHeader
        title="Incapacidades y Ausencias"
        subtitle="Control de novedades de personal"
        actions={
          <>
            <button className="btn-primary"><Plus size={14} /> Nueva Novedad</button>
          </>
        }
      />
      <DemoBanner />

      {/* Quick counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Incapacidades', value: incapacidades, cls: 'badge-red' },
          { label: 'Vacaciones',    value: vacaciones,    cls: 'badge-yellow' },
          { label: 'Permisos',      value: permisos,      cls: 'badge-blue' },
          { label: 'Pendientes',    value: pendientes,    cls: 'badge-yellow' },
        ].map(item => (
          <div key={item.label} className="card-sm flex items-center gap-3">
            <span className={`badge ${item.cls} text-sm`}>{item.value}</span>
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      <SectionCard
        title="Registro de Novedades"
        subtitle={`${filtered.length} registros`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={tipoFilter}
              onChange={e => setTipoFilter(e.target.value)}
              className="input h-8 text-xs w-36"
            >
              <option value="todos">Todos los tipos</option>
              <option value="incapacidad">Incapacidad</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="permiso">Permiso</option>
              <option value="ausencia">Ausencia</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-8 text-xs w-40"
              />
            </div>
          </div>
        }
      >
        <DataTable columns={COLUMNS} data={filtered} emptyMessage="No se encontraron novedades" />
      </SectionCard>
    </div>
  );
}
