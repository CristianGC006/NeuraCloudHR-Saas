import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  PencilLine,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Clock,
  DollarSign,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { type Absence } from '../data/demoData';
import {
  createSequentialId,
  exportCsv,
  formatCurrency,
  formatDate,
  getAbsenceOverlap,
  getAbsences,
  getEmployees,
  saveAbsences,
} from '../data/hrStore';

type AbsenceFormState = {
  id: string;
  empleadoId: string;
  tipo: Absence['tipo'];
  subtipo: string;
  fechaInicio: string;
  fechaFin: string;
  dias: string;
  horas: string;
  valorEconomico: string;
  motivo: string;
  estado: Absence['estado'];
};

const defaultAbsenceForm = (): AbsenceFormState => ({
  id: '',
  empleadoId: '',
  tipo: 'incapacidad',
  subtipo: 'Enfermedad general - EPS',
  fechaInicio: new Date().toISOString().slice(0, 10),
  fechaFin: new Date().toISOString().slice(0, 10),
  dias: '1',
  horas: '0',
  valorEconomico: '0',
  motivo: '',
  estado: 'pendiente',
});

const tipoBadge = (tipo: Absence['tipo']) => {
  switch (tipo) {
    case 'incapacidad':
      return <span className="badge badge-red">Incapacidad</span>;
    case 'vacaciones':
      return <span className="badge badge-yellow">Vacaciones</span>;
    case 'permiso':
      return <span className="badge badge-blue">Permiso</span>;
    case 'horas_extras':
      return <span className="badge badge-green">Horas Extras</span>;
    case 'bonificacion':
      return <span className="badge badge-green">Bonificación</span>;
    case 'licencia':
      return <span className="badge badge-blue">Licencia</span>;
    default:
      return <span className="badge badge-gray">{tipo}</span>;
  }
};

const estadoBadge = (estado: Absence['estado']) => {
  if (estado === 'aprobado') return <span className="badge badge-green">Aprobado</span>;
  if (estado === 'pendiente') return <span className="badge badge-yellow">Pendiente</span>;
  return <span className="badge badge-red">Rechazado</span>;
};

export default function Incapacidades() {
  const [absences, setAbsences] = useState<Absence[]>(() => getAbsences());
  const [employees, setEmployees] = useState(() => getEmployees());
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | Absence['estado']>('todos');
  const [empFilter, setEmpFilter] = useState('todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<Absence | null>(null);
  const [form, setForm] = useState<AbsenceFormState>(defaultAbsenceForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setAbsences(getAbsences());
      setEmployees(getEmployees());
    };
    sync();
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return absences.filter(record => {
      const matchSearch =
        record.nombre.toLowerCase().includes(q) ||
        record.motivo.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q);
      const matchTipo = tipoFilter === 'todos' || record.tipo === tipoFilter;
      const matchStatus = statusFilter === 'todos' || record.estado === statusFilter;
      const matchEmp = empFilter === 'todos' || record.empleadoId === empFilter;

      return matchSearch && matchTipo && matchStatus && matchEmp;
    });
  }, [absences, empFilter, search, statusFilter, tipoFilter]);

  const totals = useMemo(
    () => ({
      incapacidades: absences.filter(i => i.tipo === 'incapacidad').length,
      vacaciones: absences.filter(i => i.tipo === 'vacaciones').length,
      permisos: absences.filter(i => i.tipo === 'permiso').length,
      horasExtras: absences.filter(i => i.tipo === 'horas_extras').length,
      pendientes: absences.filter(i => i.estado === 'pendiente').length,
      aprobadas: absences.filter(i => i.estado === 'aprobado').length,
    }),
    [absences],
  );

  const openCreateModal = () => {
    setMode('create');
    setSelectedRecord(null);
    setForm(defaultAbsenceForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (rec: Absence) => {
    setMode('edit');
    setSelectedRecord(rec);
    setForm({
      id: rec.id,
      empleadoId: rec.empleadoId,
      tipo: rec.tipo,
      subtipo: rec.subtipo || '',
      fechaInicio: rec.fechaInicio,
      fechaFin: rec.fechaFin,
      dias: String(rec.dias),
      horas: String(rec.horas || 0),
      valorEconomico: String(rec.valorEconomico || 0),
      motivo: rec.motivo,
      estado: rec.estado,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openViewModal = (rec: Absence) => {
    setMode('view');
    setSelectedRecord(rec);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.empleadoId) errors.empleadoId = 'Debes seleccionar un empleado';
    if (!form.fechaInicio) errors.fechaInicio = 'Fecha de inicio requerida';
    if (!form.fechaFin) errors.fechaFin = 'Fecha de finalización requerida';
    if (form.fechaInicio && form.fechaFin && new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      errors.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio';
    }
    if (!form.motivo.trim()) errors.motivo = 'El motivo u observación es obligatorio';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAbsence = () => {
    if (!validateForm()) return;

    const emp = employees.find(e => e.id === form.empleadoId);
    if (!emp) return;

    const start = new Date(`${form.fechaInicio}T00:00:00`).getTime();
    const end = new Date(`${form.fechaFin}T00:00:00`).getTime();
    const calculatedDays = Math.max(1, Math.round((end - start) / 86400000) + 1);

    const overlap = getAbsenceOverlap(form.empleadoId, form.fechaInicio, form.fechaFin, selectedRecord?.id);

    const payload: Absence = {
      id: mode === 'edit' && selectedRecord ? selectedRecord.id : createSequentialId('NOV', absences),
      empleadoId: form.empleadoId,
      nombre: emp.nombre,
      tipo: form.tipo,
      subtipo: form.subtipo.trim() || undefined,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      dias: calculatedDays,
      horas: Number(form.horas) || undefined,
      valorEconomico: Number(form.valorEconomico) || undefined,
      motivo: form.motivo.trim(),
      estado: form.estado,
      fechaRegistro: selectedRecord ? selectedRecord.fechaRegistro : new Date().toISOString().slice(0, 10),
      afectaNomina: form.tipo === 'horas_extras' || form.tipo === 'bonificacion' || form.tipo === 'incapacidad',
    };

    const next =
      mode === 'edit' && selectedRecord
        ? absences.map(i => (i.id === selectedRecord.id ? payload : i))
        : [...absences, payload];

    saveAbsences(next);
    setNotice(
      overlap.length > 0
        ? `Novedad guardada. Advertencia: Se detectó solapamiento con ${overlap.length} registro(s) previo(s).`
        : 'Novedad laboral registrada correctamente.',
    );
    closeModal();
  };

  const handleApprove = (rec: Absence) => {
    const next = absences.map(a => (a.id === rec.id ? { ...a, estado: 'aprobado' as const } : a));
    saveAbsences(next);
    setNotice(`Novedad ${rec.id} de ${rec.nombre} aprobada.`);
  };

  const handleReject = (rec: Absence) => {
    const next = absences.map(a => (a.id === rec.id ? { ...a, estado: 'rechazado' as const } : a));
    saveAbsences(next);
    setNotice(`Novedad ${rec.id} de ${rec.nombre} rechazada.`);
  };

  const handleDelete = (rec: Absence) => {
    if (window.confirm(`¿Confirmas eliminar la novedad ${rec.id} de ${rec.nombre}?`)) {
      saveAbsences(absences.filter(a => a.id !== rec.id));
      setNotice(`Novedad ${rec.id} eliminada.`);
    }
  };

  const exportNovedadesCsv = () => {
    exportCsv(
      'novedades_laborales.csv',
      filtered.map(a => ({
        id: a.id,
        empleado: a.nombre,
        tipo: a.tipo,
        subtipo: a.subtipo || '',
        fechaInicio: a.fechaInicio,
        fechaFin: a.fechaFin,
        dias: a.dias,
        horas: a.horas || 0,
        valorEconomico: a.valorEconomico || 0,
        estado: a.estado,
        motivo: a.motivo,
      })),
    );
  };

  const overlapAlert =
    form.empleadoId && form.fechaInicio && form.fechaFin
      ? getAbsenceOverlap(form.empleadoId, form.fechaInicio, form.fechaFin, selectedRecord?.id)
      : [];

  return (
    <div>
      <PageHeader
        title="Incapacidades, Ausencias y Novedades"
        subtitle="Control de permisos, licencias, horas extras y novedades con impacto en nómina"
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={exportNovedadesCsv}>
              <Download size={14} /> Exportar CSV
            </button>
            <button type="button" className="btn-primary" onClick={openCreateModal}>
              <Plus size={14} /> Nueva Novedad
            </button>
          </>
        }
      />

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-400 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400 uppercase font-semibold">Incapacidades</p>
            <p className="text-2xl font-bold text-red-300 mt-1">{totals.incapacidades}</p>
          </div>
          <span className="badge-red p-2 rounded-xl">
            <AlertTriangle size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 uppercase font-semibold">Pendientes Revisión</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{totals.pendientes}</p>
          </div>
          <span className="badge-yellow p-2 rounded-xl">
            <Clock size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 uppercase font-semibold">Aprobadas</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{totals.aprobadas}</p>
          </div>
          <span className="badge-green p-2 rounded-xl">
            <CheckCircle2 size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-400 uppercase font-semibold">Horas Extras / Bonos</p>
            <p className="text-2xl font-bold text-brand-300 mt-1">{totals.horasExtras}</p>
          </div>
          <span className="badge-blue p-2 rounded-xl">
            <DollarSign size={18} />
          </span>
        </div>
      </div>

      {/* Table Card */}
      <SectionCard
        title="Registro de Novedades"
        subtitle={`${filtered.length} novedades según filtros seleccionados`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={empFilter}
              onChange={e => setEmpFilter(e.target.value)}
              className="input h-8 text-xs w-36"
            >
              <option value="todos">Todos los colaboradores</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>

            <select
              value={tipoFilter}
              onChange={e => setTipoFilter(e.target.value)}
              className="input h-8 text-xs w-32"
            >
              <option value="todos">Todos los tipos</option>
              <option value="incapacidad">Incapacidad</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="permiso">Permiso</option>
              <option value="horas_extras">Horas extras</option>
              <option value="bonificacion">Bonificación</option>
              <option value="ausencia">Ausencia injustificada</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'todos' | Absence['estado'])}
              className="input h-8 text-xs w-28"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar novedad..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-8 text-xs w-40"
              />
            </div>
          </div>
        }
      >
        <DataTable
          columns={[
            {
              key: 'id',
              header: 'ID',
              render: (row: Absence) => <span className="font-mono text-xs text-brand-400">{row.id}</span>,
            },
            {
              key: 'nombre',
              header: 'Colaborador',
              render: (row: Absence) => (
                <div>
                  <p className="font-semibold text-white text-sm">{row.nombre}</p>
                  <p className="text-[11px] text-slate-500">{row.subtipo || row.tipo}</p>
                </div>
              ),
            },
            {
              key: 'tipo',
              header: 'Tipología',
              render: (row: Absence) => tipoBadge(row.tipo),
            },
            {
              key: 'fechas',
              header: 'Período / Fecha',
              render: (row: Absence) => (
                <div className="text-xs">
                  <span className="text-slate-300">{formatDate(row.fechaInicio)}</span>
                  {row.fechaFin !== row.fechaInicio && (
                    <>
                      <span className="text-slate-500 mx-1">&rarr;</span>
                      <span className="text-slate-400">{formatDate(row.fechaFin)}</span>
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'dias',
              header: 'Días / Horas',
              render: (row: Absence) => (
                <span className="text-xs font-semibold text-slate-200">
                  {row.horas ? `${row.horas} hrs` : `${row.dias} d`}
                </span>
              ),
            },
            {
              key: 'valor',
              header: 'Impacto ($)',
              render: (row: Absence) => (
                <span className="text-xs font-mono text-emerald-400">
                  {row.valorEconomico ? formatCurrency(row.valorEconomico) : '—'}
                </span>
              ),
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (row: Absence) => estadoBadge(row.estado),
            },
            {
              key: 'actions',
              header: 'Acciones',
              render: (row: Absence) => (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                    title="Ver detalle"
                    onClick={() => openViewModal(row)}
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                    title="Editar"
                    onClick={() => openEditModal(row)}
                  >
                    <PencilLine size={13} />
                  </button>
                  {row.estado === 'pendiente' && (
                    <>
                      <button
                        type="button"
                        className="btn-ghost p-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        title="Aprobar novedad"
                        onClick={() => handleApprove(row)}
                      >
                        <CheckCircle2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost p-1.5 text-xs text-red-400 hover:bg-red-500/10"
                        title="Rechazar novedad"
                        onClick={() => handleReject(row)}
                      >
                        <XCircle size={13} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn-ghost p-1.5 text-xs text-red-400 hover:text-red-300"
                    title="Eliminar"
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="No se encontraron novedades registradas"
        />
      </SectionCard>

      {/* Modal: View / Edit / Create */}
      <Modal
        open={modalOpen}
        title={
          mode === 'view'
            ? `Detalle de Novedad: ${selectedRecord?.id}`
            : mode === 'edit'
            ? `Editar Novedad: ${selectedRecord?.id}`
            : 'Registrar Nueva Novedad Laboral'
        }
        onClose={closeModal}
        footer={
          mode === 'view' ? (
            <div className="flex justify-end">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSaveAbsence}>
                <Save size={15} /> Guardar Novedad
              </button>
            </div>
          )
        }
      >
        {mode === 'view' && selectedRecord ? (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <p className="text-base font-bold text-white">{selectedRecord.nombre}</p>
                <p className="text-slate-500 mt-0.5">{selectedRecord.subtipo || selectedRecord.tipo}</p>
              </div>
              <div>{estadoBadge(selectedRecord.estado)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 uppercase">Tipología</p>
                <div className="mt-1">{tipoBadge(selectedRecord.tipo)}</div>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Duración</p>
                <p className="font-semibold text-white mt-1">
                  {selectedRecord.horas ? `${selectedRecord.horas} horas` : `${selectedRecord.dias} días`}
                </p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Fecha Inicial</p>
                <p className="text-slate-200 mt-0.5">{formatDate(selectedRecord.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Fecha Final</p>
                <p className="text-slate-200 mt-0.5">{formatDate(selectedRecord.fechaFin)}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Impacto Económico</p>
                <p className="font-mono text-emerald-400 font-semibold mt-0.5">
                  {selectedRecord.valorEconomico ? formatCurrency(selectedRecord.valorEconomico) : 'Sin impacto directo'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Fecha de Radicación</p>
                <p className="text-slate-400 mt-0.5">{formatDate(selectedRecord.fechaRegistro)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border">
              <p className="text-slate-500 uppercase mb-1">Motivo / Soporte Laboral</p>
              <p className="p-3 rounded-xl bg-slate-900 border border-surface-border text-slate-300">
                {selectedRecord.motivo}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="mb-1 block text-slate-400">Colaborador *</label>
              <select
                className="input"
                value={form.empleadoId}
                onChange={e => setForm({ ...form, empleadoId: e.target.value })}
              >
                <option value="">Selecciona un colaborador</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.id}) — {e.cargo}
                  </option>
                ))}
              </select>
              {formErrors.empleadoId && <p className="mt-1 text-red-400">{formErrors.empleadoId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-slate-400">Tipo de Novedad *</label>
              <select
                className="input"
                value={form.tipo}
                onChange={e => {
                  const t = e.target.value as Absence['tipo'];
                  setForm({
                    ...form,
                    tipo: t,
                    subtipo:
                      t === 'incapacidad'
                        ? 'Enfermedad general - EPS'
                        : t === 'horas_extras'
                        ? 'Horas extras diurnas'
                        : t === 'bonificacion'
                        ? 'Bonificación comercial'
                        : t === 'permiso'
                        ? 'Permiso remunerado'
                        : '',
                  });
                }}
              >
                <option value="incapacidad">Incapacidad (EPS / ARL)</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="permiso">Permiso</option>
                <option value="horas_extras">Horas Extras</option>
                <option value="bonificacion">Bonificación</option>
                <option value="licencia">Licencia</option>
                <option value="ausencia">Ausencia no justificada</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-slate-400">Detalle / Subtipo</label>
              <input
                className="input"
                value={form.subtipo}
                onChange={e => setForm({ ...form, subtipo: e.target.value })}
                placeholder="Ej. Cita médica, Maternidad, etc."
              />
            </div>

            <div>
              <label className="mb-1 block text-slate-400">Fecha de Inicio *</label>
              <input
                type="date"
                className="input"
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              />
              {formErrors.fechaInicio && <p className="mt-1 text-red-400">{formErrors.fechaInicio}</p>}
            </div>

            <div>
              <label className="mb-1 block text-slate-400">Fecha de Fin *</label>
              <input
                type="date"
                className="input"
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
              />
              {formErrors.fechaFin && <p className="mt-1 text-red-400">{formErrors.fechaFin}</p>}
            </div>

            {form.tipo === 'horas_extras' && (
              <div>
                <label className="mb-1 block text-slate-400">Número de Horas</label>
                <input
                  type="number"
                  min="0"
                  className="input font-mono"
                  value={form.horas}
                  onChange={e => setForm({ ...form, horas: e.target.value })}
                />
              </div>
            )}

            {(form.tipo === 'horas_extras' || form.tipo === 'bonificacion') && (
              <div>
                <label className="mb-1 block text-slate-400">Valor Económico Liquidable (COP)</label>
                <input
                  type="number"
                  min="0"
                  className="input font-mono"
                  value={form.valorEconomico}
                  onChange={e => setForm({ ...form, valorEconomico: e.target.value })}
                  placeholder="Ej. 150000"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-slate-400">Estado de la Solicitud</label>
              <select
                className="input"
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as Absence['estado'] })}
              >
                <option value="pendiente">Pendiente de Aprobación</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-slate-400">Motivo / Justificación *</label>
              <textarea
                className="input min-h-[80px]"
                value={form.motivo}
                onChange={e => setForm({ ...form, motivo: e.target.value })}
                placeholder="Descripción del evento, radicado médico o justificación..."
              />
              {formErrors.motivo && <p className="mt-1 text-red-400">{formErrors.motivo}</p>}
            </div>

            {overlapAlert.length > 0 && (
              <div className="md:col-span-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Solapamiento de fechas detectado</p>
                  <p className="mt-0.5">
                    El colaborador ya cuenta con {overlapAlert.length} novedad(es) en este rango de fechas ({overlapAlert.map(o => o.id).join(', ')}).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
