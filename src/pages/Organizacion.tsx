import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Briefcase,
  Plus,
  PencilLine,
  Trash2,
  Users,
  AlertCircle,
  Save,
} from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/Cards';
import Modal from '../components/ui/Modal';
import { type Department, type Position } from '../data/demoData';
import {
  createSequentialId,
  formatCurrency,
  getDepartments,
  getEmployees,
  getPositions,
  saveDepartments,
  savePositions,
} from '../data/hrStore';

export default function Organizacion() {
  const [activeTab, setActiveTab] = useState<'departamentos' | 'cargos'>('departamentos');
  const [departments, setDepartments] = useState<Department[]>(() => getDepartments());
  const [positions, setPositions] = useState<Position[]>(() => getPositions());
  const [employees, setEmployees] = useState(() => getEmployees());
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptMode, setDeptMode] = useState<'create' | 'edit'>('create');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ id: '', nombre: '', descripcion: '', responsable: '', color: '#3b82f6' });
  const [deptErrors, setDeptErrors] = useState<Record<string, string>>({});

  // Position Modal
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [posMode, setPosMode] = useState<'create' | 'edit'>('create');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [posForm, setPosForm] = useState({ id: '', nombre: '', departamentoId: '', salarioMin: '', salarioMax: '', descripcion: '' });
  const [posErrors, setPosErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const sync = () => {
      setDepartments(getDepartments());
      setPositions(getPositions());
      setEmployees(getEmployees());
    };

    sync();
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, []);

  // Compute counts
  const deptStats = useMemo(() => {
    return departments.map(dept => {
      const empCount = employees.filter(e => e.departamento.toLowerCase() === dept.nombre.toLowerCase()).length;
      const posCount = positions.filter(p => p.departamentoId === dept.id).length;
      return { ...dept, empCount, posCount };
    });
  }, [departments, employees, positions]);

  const posStats = useMemo(() => {
    return positions.map(pos => {
      const empCount = employees.filter(e => e.cargo.toLowerCase() === pos.nombre.toLowerCase()).length;
      return { ...pos, empCount };
    });
  }, [employees, positions]);

  // Department handlers
  const openCreateDept = () => {
    setDeptMode('create');
    setSelectedDept(null);
    setDeptForm({ id: '', nombre: '', descripcion: '', responsable: '', color: '#3b82f6' });
    setDeptErrors({});
    setErrorNotice(null);
    setDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setDeptMode('edit');
    setSelectedDept(dept);
    setDeptForm({
      id: dept.id,
      nombre: dept.nombre,
      descripcion: dept.descripcion,
      responsable: dept.responsable || '',
      color: dept.color || '#3b82f6',
    });
    setDeptErrors({});
    setErrorNotice(null);
    setDeptModalOpen(true);
  };

  const handleSaveDept = () => {
    const errors: Record<string, string> = {};
    if (!deptForm.nombre.trim()) errors.nombre = 'El nombre del departamento es requerido';
    if (!deptForm.descripcion.trim()) errors.descripcion = 'La descripción es requerida';

    setDeptErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: Department = {
      id: deptMode === 'edit' && selectedDept ? selectedDept.id : createSequentialId('DEP', departments),
      nombre: deptForm.nombre.trim(),
      descripcion: deptForm.descripcion.trim(),
      responsable: deptForm.responsable.trim() || 'No asignado',
      color: deptForm.color || '#3b82f6',
    };

    const next =
      deptMode === 'edit' && selectedDept
        ? departments.map(d => (d.id === selectedDept.id ? payload : d))
        : [...departments, payload];

    saveDepartments(next);
    setNotice(deptMode === 'edit' ? 'Departamento actualizado.' : 'Departamento creado exitosamente.');
    setDeptModalOpen(false);
  };

  const handleDeleteDept = (dept: Department) => {
    setErrorNotice(null);
    const empCount = employees.filter(e => e.departamento.toLowerCase() === dept.nombre.toLowerCase()).length;
    const posCount = positions.filter(p => p.departamentoId === dept.id).length;

    if (empCount > 0) {
      setErrorNotice(
        `No se puede eliminar el departamento "${dept.nombre}" porque tiene ${empCount} empleado(s) asociado(s). Reasigna los empleados primero.`,
      );
      return;
    }

    if (posCount > 0) {
      setErrorNotice(
        `No se puede eliminar el departamento "${dept.nombre}" porque tiene ${posCount} cargo(s) asociados.`,
      );
      return;
    }

    if (window.confirm(`¿Confirmas eliminar el departamento ${dept.nombre}?`)) {
      saveDepartments(departments.filter(d => d.id !== dept.id));
      setNotice(`Departamento "${dept.nombre}" eliminado.`);
    }
  };

  // Position handlers
  const openCreatePos = () => {
    setPosMode('create');
    setSelectedPos(null);
    setPosForm({
      id: '',
      nombre: '',
      departamentoId: departments[0]?.id || '',
      salarioMin: '',
      salarioMax: '',
      descripcion: '',
    });
    setPosErrors({});
    setErrorNotice(null);
    setPosModalOpen(true);
  };

  const openEditPos = (pos: Position) => {
    setPosMode('edit');
    setSelectedPos(pos);
    setPosForm({
      id: pos.id,
      nombre: pos.nombre,
      departamentoId: pos.departamentoId,
      salarioMin: String(pos.salarioMin),
      salarioMax: String(pos.salarioMax),
      descripcion: pos.descripcion || '',
    });
    setPosErrors({});
    setErrorNotice(null);
    setPosModalOpen(true);
  };

  const handleSavePos = () => {
    const errors: Record<string, string> = {};
    const min = Number(posForm.salarioMin);
    const max = Number(posForm.salarioMax);

    if (!posForm.nombre.trim()) errors.nombre = 'El nombre del cargo es requerido';
    if (!posForm.departamentoId) errors.departamentoId = 'Debes seleccionar un departamento';
    if (!Number.isFinite(min) || min <= 0) errors.salarioMin = 'Salario mínimo inválido';
    if (!Number.isFinite(max) || max < min) errors.salarioMax = 'Salario máximo no puede ser menor al mínimo';

    setPosErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const dept = departments.find(d => d.id === posForm.departamentoId);
    const payload: Position = {
      id: posMode === 'edit' && selectedPos ? selectedPos.id : createSequentialId('CAR', positions),
      nombre: posForm.nombre.trim(),
      departamentoId: posForm.departamentoId,
      departamentoNombre: dept ? dept.nombre : 'General',
      salarioMin: min,
      salarioMax: max,
      descripcion: posForm.descripcion.trim() || undefined,
    };

    const next =
      posMode === 'edit' && selectedPos
        ? positions.map(p => (p.id === selectedPos.id ? payload : p))
        : [...positions, payload];

    savePositions(next);
    setNotice(posMode === 'edit' ? 'Cargo actualizado.' : 'Cargo creado exitosamente.');
    setPosModalOpen(false);
  };

  const handleDeletePos = (pos: Position) => {
    setErrorNotice(null);
    const empCount = employees.filter(e => e.cargo.toLowerCase() === pos.nombre.toLowerCase()).length;

    if (empCount > 0) {
      setErrorNotice(
        `No se puede eliminar el cargo "${pos.nombre}" porque actualmente lo ocupan ${empCount} empleado(s). Reasigna los cargos primero.`,
      );
      return;
    }

    if (window.confirm(`¿Confirmas eliminar el cargo ${pos.nombre}?`)) {
      savePositions(positions.filter(p => p.id !== pos.id));
      setNotice(`Cargo "${pos.nombre}" eliminado.`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Estructura Organizacional"
        subtitle="Administración de departamentos, áreas funcionales y catálogo de cargos"
        actions={
          activeTab === 'departamentos' ? (
            <button type="button" className="btn-primary" onClick={openCreateDept}>
              <Plus size={15} /> Nuevo Departamento
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={openCreatePos}>
              <Plus size={15} /> Nuevo Cargo
            </button>
          )
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

      {errorNotice && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2.5">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Acción bloqueada</p>
            <p className="text-xs text-red-200 mt-0.5">{errorNotice}</p>
          </div>
          <button type="button" onClick={() => setErrorNotice(null)} className="text-red-400 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-surface-border mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('departamentos');
            setErrorNotice(null);
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'departamentos'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={16} />
          <span>Departamentos ({departments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('cargos');
            setErrorNotice(null);
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'cargos'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase size={16} />
          <span>Cargos y Posiciones ({positions.length})</span>
        </button>
      </div>

      {/* Content Tab 1: Departamentos */}
      {activeTab === 'departamentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deptStats.map(dept => (
            <div
              key={dept.id}
              className="card relative flex flex-col justify-between hover:border-slate-500/50 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dept.color }} />
                    <h3 className="text-base font-bold text-white">{dept.nombre}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{dept.id}</span>
                </div>

                <p className="text-xs text-slate-400 min-h-[40px] leading-relaxed">{dept.descripcion}</p>

                <div className="mt-4 pt-4 border-t border-surface-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Líder / Responsable:</span>
                    <span className="font-medium text-slate-200">{dept.responsable}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Cargos definidos:</span>
                    <span className="font-semibold text-slate-300">{dept.posCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Empleados activos:</span>
                    <span className="badge badge-blue font-bold">{dept.empCount} personas</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditDept(dept)}
                  className="btn-ghost px-2.5 py-1 text-xs"
                >
                  <PencilLine size={13} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDept(dept)}
                  className="btn-ghost px-2.5 py-1 text-xs text-red-300 hover:text-red-200"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Tab 2: Cargos */}
      {activeTab === 'cargos' && (
        <SectionCard title="Catálogo de Cargos Laborales" subtitle={`${positions.length} cargos estructurados`}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Banda Salarial (Min - Max)</th>
                  <th>Ocupación Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posStats.map(pos => (
                  <tr key={pos.id}>
                    <td className="font-mono text-xs text-brand-400">{pos.id}</td>
                    <td>
                      <p className="font-semibold text-white">{pos.nombre}</p>
                      {pos.descripcion && <p className="text-xs text-slate-500 mt-0.5">{pos.descripcion}</p>}
                    </td>
                    <td>
                      <span className="badge badge-blue">{pos.departamentoNombre}</span>
                    </td>
                    <td className="text-xs font-medium text-slate-300">
                      {formatCurrency(pos.salarioMin)} - {formatCurrency(pos.salarioMax)}
                    </td>
                    <td>
                      <span className="badge badge-gray flex items-center gap-1 w-fit">
                        <Users size={12} /> {pos.empCount} {pos.empCount === 1 ? 'empleado' : 'empleados'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-xs"
                          onClick={() => openEditPos(pos)}
                        >
                          <PencilLine size={13} /> Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-2 py-1 text-xs text-red-300 hover:text-red-200"
                          onClick={() => handleDeletePos(pos)}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Department Modal */}
      <Modal
        open={deptModalOpen}
        title={deptMode === 'edit' ? 'Editar Departamento' : 'Nuevo Departamento'}
        onClose={() => setDeptModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setDeptModalOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={handleSaveDept}>
              <Save size={15} /> Guardar Departamento
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Nombre del Departamento</label>
            <input
              className="input"
              value={deptForm.nombre}
              onChange={e => setDeptForm({ ...deptForm, nombre: e.target.value })}
              placeholder="Ej. Operaciones y Logística"
            />
            {deptErrors.nombre && <p className="mt-1 text-xs text-red-400">{deptErrors.nombre}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Responsable / Líder</label>
            <input
              className="input"
              value={deptForm.responsable}
              onChange={e => setDeptForm({ ...deptForm, responsable: e.target.value })}
              placeholder="Nombre del director o responsable"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Color Identificador</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={deptForm.color}
                onChange={e => setDeptForm({ ...deptForm, color: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-slate-400 font-mono">{deptForm.color}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Descripción Funcional</label>
            <textarea
              className="input min-h-[90px]"
              value={deptForm.descripcion}
              onChange={e => setDeptForm({ ...deptForm, descripcion: e.target.value })}
              placeholder="Misión y responsabilidades generales del área..."
            />
            {deptErrors.descripcion && <p className="mt-1 text-xs text-red-400">{deptErrors.descripcion}</p>}
          </div>
        </div>
      </Modal>

      {/* Position Modal */}
      <Modal
        open={posModalOpen}
        title={posMode === 'edit' ? 'Editar Cargo' : 'Nuevo Cargo'}
        onClose={() => setPosModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setPosModalOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={handleSavePos}>
              <Save size={15} /> Guardar Cargo
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-400">Título del Cargo</label>
            <input
              className="input"
              value={posForm.nombre}
              onChange={e => setPosForm({ ...posForm, nombre: e.target.value })}
              placeholder="Ej. Líder Técnico de Microservicios"
            />
            {posErrors.nombre && <p className="mt-1 text-xs text-red-400">{posErrors.nombre}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-400">Departamento Perteneciente</label>
            <select
              className="input"
              value={posForm.departamentoId}
              onChange={e => setPosForm({ ...posForm, departamentoId: e.target.value })}
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
            {posErrors.departamentoId && (
              <p className="mt-1 text-xs text-red-400">{posErrors.departamentoId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Salario Mínimo (COP)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={posForm.salarioMin}
              onChange={e => setPosForm({ ...posForm, salarioMin: e.target.value })}
              placeholder="Ej. 3500000"
            />
            {posErrors.salarioMin && <p className="mt-1 text-xs text-red-400">{posErrors.salarioMin}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Salario Máximo (COP)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={posForm.salarioMax}
              onChange={e => setPosForm({ ...posForm, salarioMax: e.target.value })}
              placeholder="Ej. 5000000"
            />
            {posErrors.salarioMax && <p className="mt-1 text-xs text-red-400">{posErrors.salarioMax}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-slate-400">Descripción del Rol</label>
            <textarea
              className="input min-h-[80px]"
              value={posForm.descripcion}
              onChange={e => setPosForm({ ...posForm, descripcion: e.target.value })}
              placeholder="Perfil requerido, competencias y responsabilidades clave..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
