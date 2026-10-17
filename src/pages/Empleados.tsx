import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Download,
  Eye,
  PencilLine,
  Trash2,
  Save,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  PhoneCall,
  Shield,
} from 'lucide-react';
import { PageHeader, SectionCard, DemoBanner } from '../components/ui/Cards';
import { Avatar } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { type Employee } from '../data/demoData';
import {
  createSequentialId,
  exportCsv,
  formatCurrency,
  formatDate,
  getAbsences,
  getContracts,
  getDepartments,
  getEmployees,
  getPayrollPeriods,
  getPositions,
  initialsFromName,
  saveEmployees,
} from '../data/hrStore';

type FormTab = 'personal' | 'laboral' | 'contacto' | 'administrativo';

type EmployeeFormState = {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  direccion: string;
  cargo: string;
  departamento: string;
  jefeInmediato: string;
  fechaIngreso: string;
  tipoContrato: string;
  fechaVencimientoContrato: string;
  salarioBase: string;
  estado: Employee['estado'];
  contactoNombre: string;
  contactoTelefono: string;
  contactoParentesco: string;
  estadoCivil: string;
  eps: string;
  fondoPension: string;
  cesantias: string;
  cajaCompensacion: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  fechaAfiliacion: string;
};

const defaultEmployeeForm = (): EmployeeFormState => ({
  id: '',
  nombres: '',
  apellidos: '',
  tipoDocumento: 'CC',
  documento: '',
  fechaNacimiento: '1995-01-01',
  email: '',
  telefono: '',
  direccion: '',
  cargo: '',
  departamento: '',
  jefeInmediato: '',
  fechaIngreso: new Date().toISOString().slice(0, 10),
  tipoContrato: 'Término Indefinido',
  fechaVencimientoContrato: '',
  salarioBase: '',
  estado: 'activo',
  contactoNombre: '',
  contactoTelefono: '',
  contactoParentesco: 'Familiar',
  estadoCivil: 'Soltero(a)',
  eps: 'Sanitas',
  fondoPension: 'Porvenir',
  cesantias: 'Porvenir',
  cajaCompensacion: 'Compensar',
  banco: 'Bancolombia',
  tipoCuenta: 'Ahorros',
  numeroCuenta: '',
  fechaAfiliacion: new Date().toISOString().slice(0, 10),
});

const splitFullName = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { nombres: full.trim(), apellidos: '' };
  }
  return { nombres: parts[0], apellidos: parts.slice(1).join(' ') };
};

const statusBadge = (estado: Employee['estado']) => {
  if (estado === 'activo') return <span className="badge badge-green">Activo</span>;
  if (estado === 'vacaciones') return <span className="badge badge-yellow">Vacaciones</span>;
  return <span className="badge badge-gray">Inactivo</span>;
};

export default function Empleados() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [departments, setDepartments] = useState(() => getDepartments());
  const [positions, setPositions] = useState(() => getPositions());

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<'todos' | Employee['estado']>('todos');
  const [deptFilter, setDeptFilter] = useState('todos');
  const [cargoFilter, setCargoFilter] = useState('todos');

  // Sorting
  const [sortField, setSortField] = useState<'nombre' | 'fechaIngreso' | 'salarioBase'>('nombre');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<FormTab>('personal');
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(defaultEmployeeForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setEmployees(getEmployees());
      setDepartments(getDepartments());
      setPositions(getPositions());
    };
    sync();
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, []);

  // Filter and Sort
  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase();

    const result = employees.filter(emp => {
      const matchStatus = statusFilter === 'todos' || emp.estado === statusFilter;
      const matchDept = deptFilter === 'todos' || emp.departamento === deptFilter;
      const matchCargo = cargoFilter === 'todos' || emp.cargo === cargoFilter;

      const matchSearch =
        emp.nombre.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.id.toLowerCase().includes(query) ||
        (emp.documento && emp.documento.includes(query)) ||
        emp.cargo.toLowerCase().includes(query) ||
        emp.departamento.toLowerCase().includes(query);

      return matchStatus && matchDept && matchCargo && matchSearch;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nombre') cmp = a.nombre.localeCompare(b.nombre);
      else if (sortField === 'fechaIngreso') cmp = a.fechaIngreso.localeCompare(b.fechaIngreso);
      else if (sortField === 'salarioBase') cmp = a.salarioBase - b.salarioBase;
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [cargoFilter, deptFilter, employees, search, sortAsc, sortField, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, page]);

  const handleSort = (field: 'nombre' | 'fechaIngreso' | 'salarioBase') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const openCreateModal = () => {
    setMode('create');
    setSelectedEmployee(null);
    const initialDept = departments[0]?.nombre || 'Recursos Humanos';
    const initialCargo = positions.find(p => p.departamentoNombre === initialDept)?.nombre || positions[0]?.nombre || '';

    setForm({
      ...defaultEmployeeForm(),
      departamento: initialDept,
      cargo: initialCargo,
    });
    setFormErrors({});
    setModalTab('personal');
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    const { nombres, apellidos } = splitFullName(emp.nombre);
    setMode('edit');
    setSelectedEmployee(emp);
    setForm({
      id: emp.id,
      nombres,
      apellidos,
      tipoDocumento: emp.tipoDocumento || 'CC',
      documento: emp.documento || '',
      fechaNacimiento: emp.fechaNacimiento || '1995-01-01',
      email: emp.email,
      telefono: emp.telefono || '',
      direccion: emp.direccion || '',
      cargo: emp.cargo,
      departamento: emp.departamento,
      jefeInmediato: emp.jefeInmediato || '',
      fechaIngreso: emp.fechaIngreso,
      tipoContrato: emp.tipoContrato || 'Término Indefinido',
      fechaVencimientoContrato: emp.fechaVencimientoContrato || '',
      salarioBase: String(emp.salarioBase),
      estado: emp.estado,
      contactoNombre: emp.contactoEmergencia?.nombre || '',
      contactoTelefono: emp.contactoEmergencia?.telefono || '',
      contactoParentesco: emp.contactoEmergencia?.parentesco || 'Familiar',
      estadoCivil: emp.adminInfo?.estadoCivil || 'Soltero(a)',
      eps: emp.adminInfo?.eps || 'Sanitas',
      fondoPension: emp.adminInfo?.fondoPension || 'Porvenir',
      cesantias: emp.adminInfo?.cesantias || 'Porvenir',
      cajaCompensacion: emp.adminInfo?.cajaCompensacion || 'Compensar',
      banco: emp.adminInfo?.banco || 'Bancolombia',
      tipoCuenta: emp.adminInfo?.tipoCuenta || 'Ahorros',
      numeroCuenta: emp.adminInfo?.numeroCuenta || '',
      fechaAfiliacion: emp.adminInfo?.fechaAfiliacion || emp.fechaIngreso,
    });
    setFormErrors({});
    setModalTab('personal');
    setModalOpen(true);
  };

  const openViewModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setMode('view');
    setModalTab('personal');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const sal = Number(form.salarioBase);

    if (!form.nombres.trim()) errors.nombres = 'Nombres requeridos';
    if (!form.apellidos.trim()) errors.apellidos = 'Apellidos requeridos';
    if (!form.documento.trim()) errors.documento = 'Número de documento requerido';

    // Duplicate document verification
    const dupDoc = employees.find(
      e => e.documento === form.documento.trim() && (mode === 'create' || e.id !== selectedEmployee?.id),
    );
    if (dupDoc) {
      errors.documento = `El documento ya pertenece a ${dupDoc.nombre} (${dupDoc.id})`;
    }

    if (!form.email.trim()) errors.email = 'Correo electrónico requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Formato de correo no válido';
    }

    if (!form.cargo.trim()) errors.cargo = 'Cargo requerido';
    if (!form.departamento.trim()) errors.departamento = 'Departamento requerido';
    if (!form.fechaIngreso) errors.fechaIngreso = 'Fecha de ingreso requerida';
    if (!Number.isFinite(sal) || sal <= 0) errors.salarioBase = 'Salario debe ser mayor a 0';

    if (form.tipoContrato === 'Término Fijo' && form.fechaVencimientoContrato) {
      if (new Date(form.fechaVencimientoContrato) <= new Date(form.fechaIngreso)) {
        errors.fechaVencimientoContrato = 'La fecha de vencimiento debe ser posterior a la de ingreso';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEmployee = () => {
    if (!validateForm()) return;

    const fullName = `${form.nombres.trim()} ${form.apellidos.trim()}`;
    const sal = Number(form.salarioBase);

    const payload: Employee = {
      id: mode === 'edit' && selectedEmployee ? selectedEmployee.id : createSequentialId('EMP', employees),
      nombre: fullName,
      tipoDocumento: form.tipoDocumento,
      documento: form.documento.trim(),
      fechaNacimiento: form.fechaNacimiento || undefined,
      email: form.email.trim(),
      telefono: form.telefono.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      cargo: form.cargo.trim(),
      departamento: form.departamento.trim(),
      jefeInmediato: form.jefeInmediato.trim() || undefined,
      fechaIngreso: form.fechaIngreso,
      tipoContrato: form.tipoContrato,
      fechaVencimientoContrato: form.fechaVencimientoContrato || undefined,
      salarioBase: sal,
      estado: form.estado,
      avatar: initialsFromName(fullName),
      contactoEmergencia: form.contactoNombre.trim()
        ? {
            nombre: form.contactoNombre.trim(),
            telefono: form.contactoTelefono.trim(),
            parentesco: form.contactoParentesco.trim(),
          }
        : undefined,
      adminInfo: {
        estadoCivil: form.estadoCivil,
        eps: form.eps,
        fondoPension: form.fondoPension,
        cesantias: form.cesantias,
        cajaCompensacion: form.cajaCompensacion,
        banco: form.banco,
        tipoCuenta: form.tipoCuenta,
        numeroCuenta: form.numeroCuenta.trim() || undefined,
        fechaAfiliacion: form.fechaAfiliacion,
      },
    };

    const next =
      mode === 'edit' && selectedEmployee
        ? employees.map(e => (e.id === selectedEmployee.id ? payload : e))
        : [...employees, payload];

    saveEmployees(next);
    setNotice(mode === 'edit' ? 'Empleado actualizado correctamente.' : 'Empleado creado con éxito.');
    closeModal();
  };

  const handleDeleteEmployee = (emp: Employee) => {
    const relatedContracts = getContracts().some(c => c.empleadoId === emp.id);
    const relatedAbsences = getAbsences().some(a => a.empleadoId === emp.id);
    const relatedPayroll = getPayrollPeriods().some(p => p.items.some(i => i.empleadoId === emp.id));

    if (relatedContracts || relatedAbsences || relatedPayroll) {
      setNotice(
        `No se puede eliminar al empleado "${emp.nombre}" porque tiene contratos, nóminas o ausencias históricas asociadas. Puedes cambiar su estado a "Inactivo" en su lugar.`,
      );
      return;
    }

    if (window.confirm(`¿Confirmas eliminar permanentemente a ${emp.nombre} (${emp.id})?`)) {
      saveEmployees(employees.filter(e => e.id !== emp.id));
      setNotice(`Empleado ${emp.nombre} eliminado.`);
    }
  };

  const exportEmployees = () => {
    exportCsv(
      'empleados.csv',
      filteredEmployees.map(e => ({
        id: e.id,
        nombre: e.nombre,
        tipoDoc: e.tipoDocumento || 'CC',
        documento: e.documento || '',
        correo: e.email,
        telefono: e.telefono || '',
        cargo: e.cargo,
        departamento: e.departamento,
        fechaIngreso: e.fechaIngreso,
        tipoContrato: e.tipoContrato || 'Indefinido',
        salarioBase: e.salarioBase,
        estado: e.estado,
      })),
    );
  };

  return (
    <div>
      <PageHeader
        title="Directorio de Empleados"
        subtitle={`${employees.length} colaboradores en nómina`}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={exportEmployees}>
              <Download size={15} /> Exportar CSV
            </button>
            <button type="button" className="btn-primary" onClick={openCreateModal}>
              <UserPlus size={15} /> Nuevo Empleado
            </button>
          </>
        }
      />
      <DemoBanner />

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-400 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <SectionCard
        title="Listado de Personal"
        subtitle={`${filteredEmployees.length} empleados coincidentes`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Dept */}
            <select
              value={deptFilter}
              onChange={e => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="input h-8 text-xs w-36"
            >
              <option value="todos">Todos los dptos.</option>
              {departments.map(d => (
                <option key={d.id} value={d.nombre}>
                  {d.nombre}
                </option>
              ))}
            </select>

            {/* Filter by Cargo */}
            <select
              value={cargoFilter}
              onChange={e => {
                setCargoFilter(e.target.value);
                setPage(1);
              }}
              className="input h-8 text-xs w-36"
            >
              <option value="todos">Todos los cargos</option>
              {positions.map(p => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as 'todos' | Employee['estado']);
                setPage(1);
              }}
              className="input h-8 text-xs w-28"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="inactivo">Inactivos</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, doc..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input pl-8 h-8 text-xs w-44"
              />
            </div>
          </div>
        }
      >
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort('nombre')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Empleado</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Documento</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort('fechaIngreso')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Ingreso</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Modalidad</th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort('salarioBase')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Salario Base</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-slate-500 py-10">
                    No se encontraron colaboradores registrados
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td className="font-mono text-xs text-brand-400">{emp.id}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={emp.avatar} />
                        <div>
                          <p className="font-semibold text-white text-sm">{emp.nombre}</p>
                          <p className="text-[11px] text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-300 font-mono">
                      {emp.tipoDocumento || 'CC'} {emp.documento || 'No reg.'}
                    </td>
                    <td className="text-xs text-slate-300">{emp.cargo}</td>
                    <td>
                      <span className="badge badge-blue">{emp.departamento}</span>
                    </td>
                    <td className="text-xs text-slate-400">{formatDate(emp.fechaIngreso)}</td>
                    <td className="text-xs text-slate-400">{emp.tipoContrato || 'Indefinido'}</td>
                    <td className="text-xs font-semibold text-white">{formatCurrency(emp.salarioBase)}</td>
                    <td>{statusBadge(emp.estado)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                          title="Ver detalle"
                          onClick={() => openViewModal(emp)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                          title="Editar empleado"
                          onClick={() => openEditModal(emp)}
                        >
                          <PencilLine size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-ghost p-1.5 text-xs text-red-400 hover:text-red-300"
                          title="Eliminar empleado"
                          onClick={() => handleDeleteEmployee(emp)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-surface-border text-xs text-slate-400">
            <div>
              Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredEmployees.length)} de{' '}
              {filteredEmployees.length} registros
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn-ghost p-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-semibold text-white">
                Pág. {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="btn-ghost p-1.5 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Modal: View / Edit / Create Employee */}
      <Modal
        open={modalOpen}
        title={
          mode === 'view'
            ? `Expediente: ${selectedEmployee?.nombre} (${selectedEmployee?.id})`
            : mode === 'edit'
            ? `Editar Empleado: ${selectedEmployee?.nombre}`
            : 'Registrar Nuevo Colaborador'
        }
        onClose={closeModal}
        footer={
          mode === 'view' ? (
            <div className="flex justify-end">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cerrar Expediente
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSaveEmployee}>
                <Save size={15} /> Guardar Colaborador
              </button>
            </div>
          )
        }
      >
        {/* Navigation Tabs for Form Sections */}
        <div className="flex items-center gap-2 border-b border-surface-border mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setModalTab('personal')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 cursor-pointer transition-colors ${
              modalTab === 'personal'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} /> Información Personal
          </button>
          <button
            type="button"
            onClick={() => setModalTab('laboral')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 cursor-pointer transition-colors ${
              modalTab === 'laboral'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase size={14} /> Información Laboral
          </button>
          <button
            type="button"
            onClick={() => setModalTab('contacto')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 cursor-pointer transition-colors ${
              modalTab === 'contacto'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall size={14} /> Emergencia
          </button>
          <button
            type="button"
            onClick={() => setModalTab('administrativo')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 cursor-pointer transition-colors ${
              modalTab === 'administrativo'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} /> Seguridad Social y Pago
          </button>
        </div>

        {/* View Mode */}
        {mode === 'view' && selectedEmployee ? (
          <div className="space-y-4 text-xs text-slate-300">
            {modalTab === 'personal' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 uppercase">Nombre Completo</p>
                  <p className="font-semibold text-white text-sm mt-0.5">{selectedEmployee.nombre}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Documento de Identidad</p>
                  <p className="font-mono text-white mt-0.5">
                    {selectedEmployee.tipoDocumento || 'CC'} {selectedEmployee.documento || 'No informado'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Fecha de Nacimiento</p>
                  <p className="mt-0.5">{formatDate(selectedEmployee.fechaNacimiento || '')}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Correo Electrónico</p>
                  <p className="mt-0.5 text-brand-400">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Teléfono de Contacto</p>
                  <p className="mt-0.5">{selectedEmployee.telefono || 'No informado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Dirección de Residencia</p>
                  <p className="mt-0.5">{selectedEmployee.direccion || 'No informada'}</p>
                </div>
              </div>
            )}

            {modalTab === 'laboral' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 uppercase">Código del Empleado</p>
                  <p className="font-mono text-brand-400 mt-0.5">{selectedEmployee.id}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Estado Laboral</p>
                  <div className="mt-0.5">{statusBadge(selectedEmployee.estado)}</div>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Cargo</p>
                  <p className="font-medium text-white mt-0.5">{selectedEmployee.cargo}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Departamento</p>
                  <p className="font-medium text-white mt-0.5">{selectedEmployee.departamento}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Jefe Inmediato</p>
                  <p className="mt-0.5">{selectedEmployee.jefeInmediato || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Fecha de Ingreso</p>
                  <p className="mt-0.5">{formatDate(selectedEmployee.fechaIngreso)}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Modalidad Contractual</p>
                  <p className="mt-0.5">{selectedEmployee.tipoContrato || 'Indefinido'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Salario Básico Mensual</p>
                  <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(selectedEmployee.salarioBase)}</p>
                </div>
              </div>
            )}

            {modalTab === 'contacto' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 uppercase">Nombre del Contacto</p>
                  <p className="font-medium text-white mt-0.5">
                    {selectedEmployee.contactoEmergencia?.nombre || 'No registrado'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Teléfono de Emergencia</p>
                  <p className="font-mono text-white mt-0.5">
                    {selectedEmployee.contactoEmergencia?.telefono || 'No registrado'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 uppercase">Parentesco / Relación</p>
                  <p className="mt-0.5">{selectedEmployee.contactoEmergencia?.parentesco || 'Familiar'}</p>
                </div>
              </div>
            )}

            {modalTab === 'administrativo' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 uppercase">Estado Civil</p>
                  <p className="mt-0.5">{selectedEmployee.adminInfo?.estadoCivil || 'No informado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">EPS Afiliada</p>
                  <p className="mt-0.5 font-medium text-white">{selectedEmployee.adminInfo?.eps || 'No registrada'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Fondo de Pensiones</p>
                  <p className="mt-0.5">{selectedEmployee.adminInfo?.fondoPension || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Fondo de Cesantías</p>
                  <p className="mt-0.5">{selectedEmployee.adminInfo?.cesantias || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Caja de Compensación</p>
                  <p className="mt-0.5">{selectedEmployee.adminInfo?.cajaCompensacion || 'No registrada'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Banco para Nómina</p>
                  <p className="mt-0.5">{selectedEmployee.adminInfo?.banco || 'Bancolombia'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Tipo y No. de Cuenta</p>
                  <p className="mt-0.5 font-mono">
                    {selectedEmployee.adminInfo?.tipoCuenta || 'Ahorros'} -{' '}
                    {selectedEmployee.adminInfo?.numeroCuenta || 'No registrada'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Fecha de Afiliación</p>
                  <p className="mt-0.5">{formatDate(selectedEmployee.adminInfo?.fechaAfiliacion || '')}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Create / Edit Form */
          <div>
            {modalTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Nombres *</label>
                  <input
                    className="input"
                    value={form.nombres}
                    onChange={e => setForm({ ...form, nombres: e.target.value })}
                    placeholder="Ej. Juan Andrés"
                  />
                  {formErrors.nombres && <p className="mt-1 text-xs text-red-400">{formErrors.nombres}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Apellidos *</label>
                  <input
                    className="input"
                    value={form.apellidos}
                    onChange={e => setForm({ ...form, apellidos: e.target.value })}
                    placeholder="Ej. Pérez Gómez"
                  />
                  {formErrors.apellidos && <p className="mt-1 text-xs text-red-400">{formErrors.apellidos}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Tipo de Documento</label>
                  <select
                    className="input"
                    value={form.tipoDocumento}
                    onChange={e => setForm({ ...form, tipoDocumento: e.target.value })}
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PAS">Pasaporte (PAS)</option>
                    <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Número de Documento *</label>
                  <input
                    className="input font-mono"
                    value={form.documento}
                    onChange={e => setForm({ ...form, documento: e.target.value })}
                    placeholder="Ej. 1020304050"
                  />
                  {formErrors.documento && <p className="mt-1 text-xs text-red-400">{formErrors.documento}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fecha de Nacimiento</label>
                  <input
                    className="input"
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Correo Electrónico *</label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="juan.perez@neuracloud.co"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Teléfono</label>
                  <input
                    className="input"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Dirección de Residencia</label>
                  <input
                    className="input"
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Calle 100 # 15-20, Bogotá"
                  />
                </div>
              </div>
            )}

            {modalTab === 'laboral' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Departamento *</label>
                  <select
                    className="input"
                    value={form.departamento}
                    onChange={e => {
                      const newDept = e.target.value;
                      const relatedPos = positions.find(p => p.departamentoNombre === newDept);
                      setForm({
                        ...form,
                        departamento: newDept,
                        cargo: relatedPos ? relatedPos.nombre : form.cargo,
                      });
                    }}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.nombre}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                  {formErrors.departamento && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.departamento}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Cargo *</label>
                  <select
                    className="input"
                    value={form.cargo}
                    onChange={e => setForm({ ...form, cargo: e.target.value })}
                  >
                    {positions.map(p => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre} ({p.departamentoNombre})
                      </option>
                    ))}
                  </select>
                  {formErrors.cargo && <p className="mt-1 text-xs text-red-400">{formErrors.cargo}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Jefe Inmediato</label>
                  <input
                    className="input"
                    value={form.jefeInmediato}
                    onChange={e => setForm({ ...form, jefeInmediato: e.target.value })}
                    placeholder="Nombre del líder o supervisor"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fecha de Ingreso *</label>
                  <input
                    className="input"
                    type="date"
                    value={form.fechaIngreso}
                    onChange={e => setForm({ ...form, fechaIngreso: e.target.value })}
                  />
                  {formErrors.fechaIngreso && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.fechaIngreso}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Tipo de Contrato</label>
                  <select
                    className="input"
                    value={form.tipoContrato}
                    onChange={e => setForm({ ...form, tipoContrato: e.target.value })}
                  >
                    <option value="Término Indefinido">Término Indefinido</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Obra o Labor">Obra o Labor</option>
                    <option value="Aprendizaje">Aprendizaje</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fecha Vencimiento (Si aplica)</label>
                  <input
                    className="input"
                    type="date"
                    value={form.fechaVencimientoContrato}
                    onChange={e => setForm({ ...form, fechaVencimientoContrato: e.target.value })}
                  />
                  {formErrors.fechaVencimientoContrato && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.fechaVencimientoContrato}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Salario Básico Mensual (COP) *</label>
                  <input
                    className="input font-mono"
                    type="number"
                    min="0"
                    value={form.salarioBase}
                    onChange={e => setForm({ ...form, salarioBase: e.target.value })}
                    placeholder="Ej. 4200000"
                  />
                  {formErrors.salarioBase && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.salarioBase}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Estado Laboral</label>
                  <select
                    className="input"
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value as Employee['estado'] })}
                  >
                    <option value="activo">Activo</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            )}

            {modalTab === 'contacto' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-slate-400">Nombre del Contacto de Emergencia</label>
                  <input
                    className="input"
                    value={form.contactoNombre}
                    onChange={e => setForm({ ...form, contactoNombre: e.target.value })}
                    placeholder="Ej. Carolina Pérez"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Teléfono de Emergencia</label>
                  <input
                    className="input"
                    value={form.contactoTelefono}
                    onChange={e => setForm({ ...form, contactoTelefono: e.target.value })}
                    placeholder="+57 310 987 6543"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Parentesco</label>
                  <select
                    className="input"
                    value={form.contactoParentesco}
                    onChange={e => setForm({ ...form, contactoParentesco: e.target.value })}
                  >
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Madre/Padre">Madre / Padre</option>
                    <option value="Hermano(a)">Hermano(a)</option>
                    <option value="Hijo(a)">Hijo(a)</option>
                    <option value="Familiar">Otro Familiar</option>
                    <option value="Amigo(a)">Amigo(a) cercano</option>
                  </select>
                </div>
              </div>
            )}

            {modalTab === 'administrativo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Estado Civil</label>
                  <select
                    className="input"
                    value={form.estadoCivil}
                    onChange={e => setForm({ ...form, estadoCivil: e.target.value })}
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Unión libre">Unión libre</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">EPS</label>
                  <select
                    className="input"
                    value={form.eps}
                    onChange={e => setForm({ ...form, eps: e.target.value })}
                  >
                    <option value="Sanitas">Sanitas</option>
                    <option value="Sura">Sura</option>
                    <option value="Compensar EPS">Compensar EPS</option>
                    <option value="Salud Total">Salud Total</option>
                    <option value="Nueva EPS">Nueva EPS</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fondo de Pensiones</label>
                  <select
                    className="input"
                    value={form.fondoPension}
                    onChange={e => setForm({ ...form, fondoPension: e.target.value })}
                  >
                    <option value="Porvenir">Porvenir</option>
                    <option value="Protección">Protección</option>
                    <option value="Colfondos">Colfondos</option>
                    <option value="Colpensiones">Colpensiones</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fondo de Cesantías</label>
                  <select
                    className="input"
                    value={form.cesantias}
                    onChange={e => setForm({ ...form, cesantias: e.target.value })}
                  >
                    <option value="Porvenir">Porvenir</option>
                    <option value="Protección">Protección</option>
                    <option value="Colfondos">Colfondos</option>
                    <option value="FNA">Fondo Nacional del Ahorro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Caja de Compensación</label>
                  <select
                    className="input"
                    value={form.cajaCompensacion}
                    onChange={e => setForm({ ...form, cajaCompensacion: e.target.value })}
                  >
                    <option value="Compensar">Compensar</option>
                    <option value="Cafam">Cafam</option>
                    <option value="Colsubsidio">Colsubsidio</option>
                    <option value="Comfama">Comfama</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Banco de Pago</label>
                  <input
                    className="input"
                    value={form.banco}
                    onChange={e => setForm({ ...form, banco: e.target.value })}
                    placeholder="Bancolombia, Davivienda, etc."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Tipo de Cuenta</label>
                  <select
                    className="input"
                    value={form.tipoCuenta}
                    onChange={e => setForm({ ...form, tipoCuenta: e.target.value })}
                  >
                    <option value="Ahorros">Cuenta de Ahorros</option>
                    <option value="Corriente">Cuenta Corriente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Número de Cuenta</label>
                  <input
                    className="input font-mono"
                    value={form.numeroCuenta}
                    onChange={e => setForm({ ...form, numeroCuenta: e.target.value })}
                    placeholder="000-000000-00"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
