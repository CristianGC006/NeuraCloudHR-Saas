import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  FileSignature,
  Download,
  Plus,
  Eye,
  PencilLine,
  Trash2,
  Save,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import { DataTable } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { type Contract } from '../data/demoData';
import {
  createSequentialId,
  exportCsv,
  formatCurrency,
  formatDate,
  getContracts,
  getEmployees,
  saveContracts,
} from '../data/hrStore';

type ContractFormState = {
  id: string;
  empleadoId: string;
  tipoContrato: Contract['tipoContrato'];
  fechaInicio: string;
  fechaFin: string;
  salario: string;
  cargo: string;
  departamento: string;
  estado: Contract['estado'];
  observaciones: string;
};

const defaultContractForm = (): ContractFormState => ({
  id: '',
  empleadoId: '',
  tipoContrato: 'Término Indefinido',
  fechaInicio: new Date().toISOString().slice(0, 10),
  fechaFin: '',
  salario: '',
  cargo: '',
  departamento: '',
  estado: 'activo',
  observaciones: '',
});

const estadoBadge = (estado: Contract['estado']) => {
  if (estado === 'activo') return <span className="badge badge-green">Activo</span>;
  if (estado === 'por_vencer') return <span className="badge badge-yellow">Por Vencer</span>;
  if (estado === 'vencido') return <span className="badge badge-red">Vencido</span>;
  return <span className="badge badge-gray">Terminado</span>;
};

export default function Contratos() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [contracts, setContracts] = useState<Contract[]>(() => getContracts());
  const [employees, setEmployees] = useState(() => getEmployees());
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | Contract['estado']>('todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [form, setForm] = useState<ContractFormState>(defaultContractForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setContracts(getContracts());
      setEmployees(getEmployees());
    };

    sync();
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return contracts.filter(ctr => {
      const matchType = typeFilter === 'todos' || ctr.tipoContrato === typeFilter;
      const matchStatus = statusFilter === 'todos' || ctr.estado === statusFilter;
      const matchSearch =
        ctr.empleadoNombre.toLowerCase().includes(query) ||
        ctr.cargo.toLowerCase().includes(query) ||
        ctr.id.toLowerCase().includes(query) ||
        ctr.departamento.toLowerCase().includes(query);

      return matchType && matchStatus && matchSearch;
    });
  }, [contracts, search, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    const activos = contracts.filter(c => c.estado === 'activo').length;
    const porVencer = contracts.filter(c => c.estado === 'por_vencer').length;
    const vencidos = contracts.filter(c => c.estado === 'vencido').length;
    const terminados = contracts.filter(c => c.estado === 'terminado').length;
    return { activos, porVencer, vencidos, terminados };
  }, [contracts]);

  const openCreateModal = () => {
    setMode('create');
    setSelectedContract(null);
    setForm(defaultContractForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (ctr: Contract) => {
    setMode('edit');
    setSelectedContract(ctr);
    setForm({
      id: ctr.id,
      empleadoId: ctr.empleadoId,
      tipoContrato: ctr.tipoContrato,
      fechaInicio: ctr.fechaInicio,
      fechaFin: ctr.fechaFin || '',
      salario: String(ctr.salario),
      cargo: ctr.cargo,
      departamento: ctr.departamento,
      estado: ctr.estado,
      observaciones: ctr.observaciones || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openViewModal = (ctr: Contract) => {
    setMode('view');
    setSelectedContract(ctr);
    setForm({
      id: ctr.id,
      empleadoId: ctr.empleadoId,
      tipoContrato: ctr.tipoContrato,
      fechaInicio: ctr.fechaInicio,
      fechaFin: ctr.fechaFin || '',
      salario: String(ctr.salario),
      cargo: ctr.cargo,
      departamento: ctr.departamento,
      estado: ctr.estado,
      observaciones: ctr.observaciones || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedContract(null);
    setFormErrors({});
  };

  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setForm(prev => ({
        ...prev,
        empleadoId: emp.id,
        cargo: emp.cargo,
        departamento: emp.departamento,
        salario: String(emp.salarioBase),
      }));
    } else {
      setForm(prev => ({ ...prev, empleadoId: empId }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const sal = Number(form.salario);

    if (!form.empleadoId) errors.empleadoId = 'Debes seleccionar un empleado';
    if (!form.tipoContrato) errors.tipoContrato = 'El tipo de contrato es obligatorio';
    if (!form.fechaInicio) errors.fechaInicio = 'La fecha de inicio es requerida';
    if (!Number.isFinite(sal) || sal <= 0) errors.salario = 'El salario debe ser mayor a 0';

    if (form.tipoContrato === 'Término Fijo') {
      if (!form.fechaFin) {
        errors.fechaFin = 'Los contratos a término fijo requieren fecha de finalización';
      } else if (new Date(form.fechaFin) <= new Date(form.fechaInicio)) {
        errors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveContract = () => {
    if (!validateForm()) return;

    const emp = employees.find(e => e.id === form.empleadoId);
    const empName = emp ? emp.nombre : 'Empleado no asignado';
    const sal = Number(form.salario);

    // Auto-calculate initial status
    let estado = form.estado;
    if (form.fechaFin && estado !== 'terminado') {
      const diff = Math.ceil((new Date(form.fechaFin).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (diff < 0) estado = 'vencido';
      else if (diff <= 30) estado = 'por_vencer';
      else estado = 'activo';
    }

    const payload: Contract = {
      id: mode === 'edit' && selectedContract ? selectedContract.id : createSequentialId('CTR', contracts),
      empleadoId: form.empleadoId,
      empleadoNombre: empName,
      tipoContrato: form.tipoContrato,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin || undefined,
      salario: sal,
      cargo: form.cargo || emp?.cargo || 'General',
      departamento: form.departamento || emp?.departamento || 'General',
      estado,
      observaciones: form.observaciones.trim() || undefined,
    };

    const next =
      mode === 'edit' && selectedContract
        ? contracts.map(c => (c.id === selectedContract.id ? payload : c))
        : [...contracts, payload];

    saveContracts(next);
    setNotice(mode === 'edit' ? 'Contrato actualizado correctamente.' : 'Contrato creado correctamente.');
    closeModal();
  };

  const handleDeleteContract = (ctr: Contract) => {
    if (window.confirm(`¿Estás seguro de eliminar el contrato ${ctr.id} de ${ctr.empleadoNombre}?`)) {
      saveContracts(contracts.filter(c => c.id !== ctr.id));
      setNotice(`Contrato ${ctr.id} eliminado.`);
    }
  };

  const exportContracts = () => {
    exportCsv(
      'contratos.csv',
      filtered.map(c => ({
        id: c.id,
        empleado: c.empleadoNombre,
        tipoContrato: c.tipoContrato,
        cargo: c.cargo,
        departamento: c.departamento,
        salario: c.salario,
        fechaInicio: c.fechaInicio,
        fechaFin: c.fechaFin || 'Indefinido',
        estado: c.estado,
        observaciones: c.observaciones || '',
      })),
    );
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Contratos"
        subtitle={`${contracts.length} contratos laborales registrados`}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={exportContracts}>
              <Download size={15} /> Exportar
            </button>
            <button type="button" className="btn-primary" onClick={openCreateModal}>
              <Plus size={15} /> Nuevo Contrato
            </button>
          </>
        }
      />
      <DemoBanner />

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Activos</p>
            <p className="text-2xl font-bold text-white mt-1">{metrics.activos}</p>
          </div>
          <span className="badge-green p-2 rounded-xl">
            <CheckCircle2 size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 uppercase font-semibold">Por Vencer (&le; 30d)</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{metrics.porVencer}</p>
          </div>
          <span className="badge-yellow p-2 rounded-xl">
            <Clock size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-400 uppercase font-semibold">Vencidos</p>
            <p className="text-2xl font-bold text-red-300 mt-1">{metrics.vencidos}</p>
          </div>
          <span className="badge-red p-2 rounded-xl">
            <AlertTriangle size={18} />
          </span>
        </div>

        <div className="card-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Terminados</p>
            <p className="text-2xl font-bold text-slate-300 mt-1">{metrics.terminados}</p>
          </div>
          <span className="badge-gray p-2 rounded-xl">
            <FileSignature size={18} />
          </span>
        </div>
      </div>

      {/* Expiry Warning Callout if any are expiring */}
      {metrics.porVencer > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-white">
              Atención: {metrics.porVencer} contrato(s) próximo(s) a vencer
            </p>
            <p className="mt-0.5 text-amber-200/90">
              Revisa oportunamente los términos legales para emitir las cartas de preaviso de prórroga o terminación contractual.
            </p>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <SectionCard
        title="Directorio de Contratos"
        subtitle={`${filtered.length} contratos según filtros`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="input h-8 text-xs w-36"
            >
              <option value="todos">Todos los tipos</option>
              <option value="Término Indefinido">Término Indefinido</option>
              <option value="Término Fijo">Término Fijo</option>
              <option value="Obra o Labor">Obra o Labor</option>
              <option value="Aprendizaje">Aprendizaje</option>
              <option value="Prestación de Servicios">Prestación de Servicios</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'todos' | Contract['estado'])}
              className="input h-8 text-xs w-32"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="por_vencer">Por vencer</option>
              <option value="vencido">Vencido</option>
              <option value="terminado">Terminado</option>
            </select>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar contrato..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 h-8 text-xs w-44"
              />
            </div>
          </div>
        }
      >
        <DataTable
          columns={[
            {
              key: 'id',
              header: 'Código',
              render: (row: Contract) => <span className="font-mono text-xs text-brand-400">{row.id}</span>,
            },
            {
              key: 'empleadoNombre',
              header: 'Empleado',
              render: (row: Contract) => (
                <div>
                  <p className="font-medium text-slate-200 text-sm">{row.empleadoNombre}</p>
                  <p className="text-[11px] text-slate-500">{row.cargo}</p>
                </div>
              ),
            },
            {
              key: 'tipoContrato',
              header: 'Modalidad',
              render: (row: Contract) => <span className="badge badge-blue">{row.tipoContrato}</span>,
            },
            {
              key: 'fechas',
              header: 'Vigencia',
              render: (row: Contract) => (
                <div className="text-xs">
                  <span className="text-slate-300">{formatDate(row.fechaInicio)}</span>
                  <span className="text-slate-500 mx-1">&rarr;</span>
                  <span className={row.estado === 'por_vencer' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                    {row.fechaFin ? formatDate(row.fechaFin) : 'Indefinido'}
                  </span>
                </div>
              ),
            },
            {
              key: 'salario',
              header: 'Salario Pactado',
              render: (row: Contract) => (
                <span className="font-semibold text-slate-200">{formatCurrency(row.salario)}</span>
              ),
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (row: Contract) => estadoBadge(row.estado),
            },
            {
              key: 'actions',
              header: 'Acciones',
              render: (row: Contract) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => openViewModal(row)}
                  >
                    <Eye size={13} /> Ver
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => openEditModal(row)}
                  >
                    <PencilLine size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs text-red-300 hover:text-red-200"
                    onClick={() => handleDeleteContract(row)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="No se encontraron contratos registrados"
        />
      </SectionCard>

      {/* Modal View / Edit / Create */}
      <Modal
        open={modalOpen}
        title={
          mode === 'view'
            ? 'Detalle del Contrato'
            : mode === 'edit'
            ? 'Editar Contrato Laboral'
            : 'Nuevo Contrato Laboral'
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
              <button type="button" className="btn-primary" onClick={handleSaveContract}>
                <Save size={15} /> Guardar Contrato
              </button>
            </div>
          )
        }
      >
        {mode === 'view' && selectedContract ? (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <p className="text-xl font-bold text-white">{selectedContract.empleadoNombre}</p>
                <p className="text-xs text-brand-400 font-mono mt-0.5">{selectedContract.id}</p>
              </div>
              <div>{estadoBadge(selectedContract.estado)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Modalidad Contractual</p>
                <p className="font-medium text-slate-200 mt-0.5">{selectedContract.tipoContrato}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Salario Asignado</p>
                <p className="font-bold text-white mt-0.5">{formatCurrency(selectedContract.salario)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Cargo</p>
                <p className="font-medium text-slate-200 mt-0.5">{selectedContract.cargo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Departamento</p>
                <p className="font-medium text-slate-200 mt-0.5">{selectedContract.departamento}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Fecha de Inicio</p>
                <p className="text-slate-300 mt-0.5">{formatDate(selectedContract.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Fecha de Finalización</p>
                <p className="text-slate-300 mt-0.5">
                  {selectedContract.fechaFin ? formatDate(selectedContract.fechaFin) : 'Término indefinido'}
                </p>
              </div>
            </div>

            {selectedContract.observaciones && (
              <div className="pt-2 border-t border-surface-border">
                <p className="text-xs text-slate-500 uppercase mb-1">Cláusulas y Observaciones</p>
                <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-surface-border">
                  {selectedContract.observaciones}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-400">Empleado Asociado</label>
              <select
                className="input"
                value={form.empleadoId}
                onChange={e => handleEmployeeSelect(e.target.value)}
              >
                <option value="">Selecciona un empleado</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.id}) — {e.cargo}
                  </option>
                ))}
              </select>
              {formErrors.empleadoId && (
                <p className="mt-1 text-xs text-red-400">{formErrors.empleadoId}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Tipo de Contrato</label>
              <select
                className="input"
                value={form.tipoContrato}
                onChange={e =>
                  setForm({ ...form, tipoContrato: e.target.value as Contract['tipoContrato'] })
                }
              >
                <option value="Término Indefinido">Término Indefinido</option>
                <option value="Término Fijo">Término Fijo</option>
                <option value="Obra o Labor">Obra o Labor</option>
                <option value="Aprendizaje">Aprendizaje</option>
                <option value="Prestación de Servicios">Prestación de Servicios</option>
              </select>
              {formErrors.tipoContrato && (
                <p className="mt-1 text-xs text-red-400">{formErrors.tipoContrato}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Salario Pactado (COP)</label>
              <input
                className="input"
                type="number"
                min="0"
                value={form.salario}
                onChange={e => setForm({ ...form, salario: e.target.value })}
                placeholder="Ej. 4500000"
              />
              {formErrors.salario && (
                <p className="mt-1 text-xs text-red-400">{formErrors.salario}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Fecha de Inicio</label>
              <input
                className="input"
                type="date"
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              />
              {formErrors.fechaInicio && (
                <p className="mt-1 text-xs text-red-400">{formErrors.fechaInicio}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Fecha de Fin {form.tipoContrato === 'Término Fijo' && <span className="text-amber-400">*</span>}
              </label>
              <input
                className="input"
                type="date"
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
              />
              {formErrors.fechaFin && (
                <p className="mt-1 text-xs text-red-400">{formErrors.fechaFin}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Cargo</label>
              <input
                className="input"
                value={form.cargo}
                onChange={e => setForm({ ...form, cargo: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Departamento</label>
              <input
                className="input"
                value={form.departamento}
                onChange={e => setForm({ ...form, departamento: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Estado del Contrato</label>
              <select
                className="input"
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as Contract['estado'] })}
              >
                <option value="activo">Activo</option>
                <option value="por_vencer">Por vencer</option>
                <option value="vencido">Vencido</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-400">Observaciones y Cláusulas</label>
              <textarea
                className="input min-h-[90px]"
                value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Cláusulas de exclusividad, período de prueba, teletrabajo, etc."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
