import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  Download,
  Eye,
  PencilLine,
  Lock,
  Unlock,
  Printer,
  Plus,
  RefreshCw,
  Search,
  FileText,
} from 'lucide-react';
import { PageHeader, SectionCard, StatCard } from '../components/ui/Cards';
import Modal from '../components/ui/Modal';
import { type PayrollPeriod, type PayrollPeriodItem } from '../data/demoData';
import {
  exportCsv,
  formatCurrency,
  formatDate,
  generatePeriodDraft,
  getCompanySettings,
  getPayrollPeriods,
  savePayrollPeriods,
} from '../data/hrStore';

export default function Nomina() {
  const company = getCompanySettings();
  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => getPayrollPeriods());
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const list = getPayrollPeriods();
    return list.find(p => p.estado !== 'cerrado')?.id || list[list.length - 1]?.id || '';
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | PayrollPeriodItem['estado']>('todos');
  const [notice, setNotice] = useState<string | null>(null);

  // Voucher / Printable Payslip Modal
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucherItem, setSelectedVoucherItem] = useState<PayrollPeriodItem | null>(null);

  // Edit Item Modal
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PayrollPeriodItem | null>(null);
  const [editForm, setEditForm] = useState({
    diasLiquidados: 30,
    horasExtras: 0,
    bonificaciones: 0,
    anticipos: 0,
    otrasDeducciones: 0,
  });

  // Create Period Modal
  const [createPeriodModalOpen, setCreatePeriodModalOpen] = useState(false);
  const [newPeriodForm, setNewPeriodForm] = useState({
    nombre: 'Noviembre 2026',
    codigo: '2026-11',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-30',
  });

  useEffect(() => {
    const sync = () => {
      const updated = getPayrollPeriods();
      setPeriods(updated);
      if (!selectedPeriodId && updated.length > 0) {
        setSelectedPeriodId(updated[updated.length - 1].id);
      }
    };
    sync();
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, [selectedPeriodId]);

  const currentPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  const isClosed = currentPeriod?.estado === 'cerrado';

  // Filter items of current period
  const filteredItems = useMemo(() => {
    if (!currentPeriod) return [];
    const q = search.toLowerCase();
    return currentPeriod.items.filter(item => {
      const matchStatus = statusFilter === 'todos' || item.estado === statusFilter;
      const matchSearch =
        item.nombre.toLowerCase().includes(q) ||
        item.cargo.toLowerCase().includes(q) ||
        item.departamento.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [currentPeriod, search, statusFilter]);

  // Actions on Period
  const handleGenerateDraft = () => {
    if (isClosed) {
      setNotice('No se puede regenerar un período cerrado. Reábrelo primero si necesitas actualizarlo.');
      return;
    }
    if (!currentPeriod) return;

    if (window.confirm(`¿Deseas recalcular y sincronizar el borrador de ${currentPeriod.nombre}?`)) {
      const refreshed = generatePeriodDraft(
        currentPeriod.nombre,
        currentPeriod.codigo,
        currentPeriod.fechaInicio,
        currentPeriod.fechaFin,
      );

      const next = periods.map(p => (p.id === currentPeriod.id ? { ...refreshed, id: currentPeriod.id } : p));
      savePayrollPeriods(next);
      setNotice(`Borrador de ${currentPeriod.nombre} recalculado con novedades y empleados activos.`);
    }
  };

  const handleToggleClosePeriod = () => {
    if (!currentPeriod) return;

    if (currentPeriod.estado === 'cerrado') {
      // Reopen
      if (window.confirm(`¿Deseas reabrir el período ${currentPeriod.nombre} para realizar modificaciones?`)) {
        const next = periods.map(p =>
          p.id === currentPeriod.id ? { ...p, estado: 'revisado' as const, cerradoEl: undefined } : p,
        );
        savePayrollPeriods(next);
        setNotice(`Período ${currentPeriod.nombre} reabierto.`);
      }
    } else {
      // Close
      if (window.confirm(`¿Confirmas cerrar definitivamente la liquidación de ${currentPeriod.nombre}? Todas las líneas se marcarán como pagadas.`)) {
        const next = periods.map(p => {
          if (p.id === currentPeriod.id) {
            return {
              ...p,
              estado: 'cerrado' as const,
              cerradoEl: new Date().toISOString(),
              items: p.items.map(i => ({ ...i, estado: 'pagada' as const })),
            };
          }
          return p;
        });
        savePayrollPeriods(next);
        setNotice(`Período ${currentPeriod.nombre} cerrado y marcado como pagado.`);
      }
    }
  };

  // Open voucher
  const handleOpenVoucher = (item: PayrollPeriodItem) => {
    setSelectedVoucherItem(item);
    setVoucherModalOpen(true);
  };

  // Print voucher
  const handlePrintVoucher = () => {
    window.print();
  };

  // Open Edit Item
  const handleOpenEditItem = (item: PayrollPeriodItem) => {
    if (isClosed) {
      setNotice('El período está cerrado. No se permiten modificaciones directas.');
      return;
    }
    setEditingItem(item);
    setEditForm({
      diasLiquidados: item.diasLiquidados,
      horasExtras: item.horasExtras,
      bonificaciones: item.bonificaciones,
      anticipos: item.anticipos,
      otrasDeducciones: item.otrasDeducciones,
    });
    setEditItemModalOpen(true);
  };

  const handleSaveItemEdit = () => {
    if (!editingItem || !currentPeriod) return;

    const dias = Math.max(0, Math.min(30, editForm.diasLiquidados));
    const salarioBase = editingItem.salarioBase;
    const salarioProporcional = Math.round((salarioBase / 30) * dias);

    // Transport allowance if eligible
    const hasAux = salarioBase <= company.salarioMinimo * 2;
    const auxilioTransporte = hasAux ? Math.round((company.auxilioTransporte / 30) * dias) : 0;

    const horasExtras = Number(editForm.horasExtras) || 0;
    const bonificaciones = Number(editForm.bonificaciones) || 0;
    const anticipos = Number(editForm.anticipos) || 0;
    const otrasDeducciones = Number(editForm.otrasDeducciones) || 0;

    const totalDevengado =
      salarioProporcional + auxilioTransporte + horasExtras + bonificaciones + editingItem.comisiones;

    const baseCotizacion = salarioProporcional + horasExtras;
    const salud = Math.round(baseCotizacion * (company.pctSalud / 100));
    const pension = Math.round(baseCotizacion * (company.pctPension / 100));
    const totalDeducciones = salud + pension + anticipos + otrasDeducciones;
    const neto = Math.max(0, totalDevengado - totalDeducciones);

    const updatedItem: PayrollPeriodItem = {
      ...editingItem,
      diasLiquidados: dias,
      salarioProporcional,
      auxilioTransporte,
      horasExtras,
      bonificaciones,
      anticipos,
      otrasDeducciones,
      salud,
      pension,
      totalDevengado,
      totalDeducciones,
      neto,
    };

    const nextItems = currentPeriod.items.map(i => (i.id === editingItem.id ? updatedItem : i));
    const totalDev = nextItems.reduce((acc, i) => acc + i.totalDevengado, 0);
    const totalDed = nextItems.reduce((acc, i) => acc + i.totalDeducciones, 0);
    const totalNet = nextItems.reduce((acc, i) => acc + i.neto, 0);

    const nextPeriods = periods.map(p =>
      p.id === currentPeriod.id
        ? {
            ...p,
            items: nextItems,
            totalDevengado: totalDev,
            totalDeducciones: totalDed,
            totalNeto: totalNet,
          }
        : p,
    );

    savePayrollPeriods(nextPeriods);
    setEditItemModalOpen(false);
    setEditingItem(null);
    setNotice(`Liquidación de ${editingItem.nombre} actualizada correctamente.`);
  };

  // Create new period
  const handleCreatePeriod = () => {
    if (!newPeriodForm.nombre.trim() || !newPeriodForm.codigo.trim()) {
      alert('Nombre y código de período son requeridos.');
      return;
    }

    const draft = generatePeriodDraft(
      newPeriodForm.nombre.trim(),
      newPeriodForm.codigo.trim(),
      newPeriodForm.fechaInicio,
      newPeriodForm.fechaFin,
    );

    const next = [...periods, draft];
    savePayrollPeriods(next);
    setSelectedPeriodId(draft.id);
    setCreatePeriodModalOpen(false);
    setNotice(`Nuevo período ${draft.nombre} creado e inicializado con colaboradores activos.`);
  };

  const exportPeriodCsv = () => {
    if (!currentPeriod) return;
    exportCsv(
      `nomina_${currentPeriod.codigo}.csv`,
      currentPeriod.items.map(i => ({
        id: i.id,
        empleado: i.nombre,
        cargo: i.cargo,
        departamento: i.departamento,
        dias: i.diasLiquidados,
        salarioBase: i.salarioBase,
        salarioProp: i.salarioProporcional,
        auxTransporte: i.auxilioTransporte,
        horasExtras: i.horasExtras,
        bonificaciones: i.bonificaciones,
        totalDevengado: i.totalDevengado,
        salud: i.salud,
        pension: i.pension,
        anticipos: i.anticipos,
        totalDeducciones: i.totalDeducciones,
        netoPagar: i.neto,
        estado: i.estado,
      })),
    );
  };

  return (
    <div>
      <PageHeader
        title="Liquidación de Nómina"
        subtitle="Cálculo periódico de salarios, auxilios, novedades aprobadas y aportes a seguridad social"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={exportPeriodCsv}
            >
              <Download size={14} /> Exportar Período
            </button>
            {!isClosed && (
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={handleGenerateDraft}
              >
                <RefreshCw size={14} /> Recalcular Borrador
              </button>
            )}
            <button
              type="button"
              className={`text-xs ${isClosed ? 'btn-secondary text-amber-300' : 'btn-primary'}`}
              onClick={handleToggleClosePeriod}
            >
              {isClosed ? (
                <>
                  <Unlock size={14} /> Reabrir Período
                </>
              ) : (
                <>
                  <Lock size={14} /> Cerrar Período
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => setCreatePeriodModalOpen(true)}
            >
              <Plus size={14} /> Nuevo Período
            </button>
          </div>
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

      {/* Period Selection Bar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-card border border-surface-border mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-2">Período Activo:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {periods.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriodId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  p.id === selectedPeriodId
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/50'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>{p.nombre}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    p.estado === 'cerrado'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : p.estado === 'revisado'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {p.estado}
                </span>
              </button>
            ))}
          </div>
        </div>

        {currentPeriod && (
          <div className="flex items-center gap-3 text-xs pr-2">
            <span className="text-slate-500">
              Vigencia: {formatDate(currentPeriod.fechaInicio)} &rarr; {formatDate(currentPeriod.fechaFin)}
            </span>
            {isClosed ? (
              <span className="badge badge-green flex items-center gap-1">
                <Lock size={12} /> Liquidación Cerrada
              </span>
            ) : (
              <span className="badge badge-yellow flex items-center gap-1">
                <RefreshCw size={12} /> Editable
              </span>
            )}
          </div>
        )}
      </div>

      {/* Period Summary KPI Cards */}
      {currentPeriod && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Devengado"
            value={formatCurrency(currentPeriod.totalDevengado)}
            icon={<DollarSign size={20} />}
            subtitle="Salarios, auxilios y bonos"
            accent="bg-brand-500"
          />
          <StatCard
            title="Total Deducciones"
            value={formatCurrency(currentPeriod.totalDeducciones)}
            icon={<DollarSign size={20} />}
            subtitle="Salud (4%), Pensión (4%) y otros"
            accent="bg-red-500"
          />
          <StatCard
            title="Neto Estimado a Pagar"
            value={formatCurrency(currentPeriod.totalNeto)}
            icon={<DollarSign size={20} />}
            subtitle="Desembolso total del período"
            accent="bg-emerald-500"
          />
          <StatCard
            title="Colaboradores"
            value={currentPeriod.items.length}
            icon={<FileText size={20} />}
            subtitle={`${currentPeriod.items.filter(i => i.estado === 'pagada').length} con pago procesado`}
            accent="bg-violet-500"
          />
        </div>
      )}

      {/* Period Details Table */}
      <SectionCard
        title={`Detalle de Liquidación — ${currentPeriod?.nombre || ''}`}
        subtitle={`${filteredItems.length} colaboradores en este período`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'todos' | PayrollPeriodItem['estado'])}
              className="input h-8 text-xs w-32"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesada">Procesada</option>
              <option value="pagada">Pagada</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                <th>Empleado</th>
                <th>Días</th>
                <th>Salario Base</th>
                <th>Aux. Transp.</th>
                <th>Extras / Bonos</th>
                <th>Devengado</th>
                <th>Salud (4%)</th>
                <th>Pensión (4%)</th>
                <th>Total Deduc.</th>
                <th>Neto a Pagar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <p className="font-semibold text-white text-sm">{item.nombre}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.cargo} · {item.departamento}
                    </p>
                  </td>
                  <td className="text-center font-mono text-slate-300">{item.diasLiquidados}</td>
                  <td className="text-xs text-slate-300">{formatCurrency(item.salarioBase)}</td>
                  <td className="text-xs text-slate-400">
                    {item.auxilioTransporte > 0 ? formatCurrency(item.auxilioTransporte) : '—'}
                  </td>
                  <td className="text-xs text-emerald-400">
                    {item.horasExtras + item.bonificaciones > 0
                      ? formatCurrency(item.horasExtras + item.bonificaciones)
                      : '—'}
                  </td>
                  <td className="text-xs font-semibold text-slate-200">
                    {formatCurrency(item.totalDevengado)}
                  </td>
                  <td className="text-xs text-red-400">{formatCurrency(item.salud)}</td>
                  <td className="text-xs text-red-400">{formatCurrency(item.pension)}</td>
                  <td className="text-xs font-semibold text-red-300">
                    {formatCurrency(item.totalDeducciones)}
                  </td>
                  <td className="text-sm font-bold text-white">
                    {formatCurrency(item.neto)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.estado === 'pagada'
                          ? 'badge-green'
                          : item.estado === 'procesada'
                          ? 'badge-blue'
                          : 'badge-yellow'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenVoucher(item)}
                        className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                        title="Ver Comprobante de Nómina"
                      >
                        <Eye size={14} />
                      </button>
                      {!isClosed && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          className="btn-ghost p-1.5 text-xs text-slate-300 hover:text-white"
                          title="Ajustar Novedades"
                        >
                          <PencilLine size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Printable Payslip Voucher Modal */}
      <Modal
        open={voucherModalOpen}
        title="Comprobante Individual de Pago de Nómina"
        onClose={() => setVoucherModalOpen(false)}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-slate-500">Documento de liquidación generado por NeuraCloud HR SaaS</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setVoucherModalOpen(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handlePrintVoucher}
              >
                <Printer size={15} /> Imprimir Comprobante
              </button>
            </div>
          </div>
        }
      >
        {selectedVoucherItem && (
          <div className="p-4 sm:p-6 bg-slate-950/80 rounded-2xl border border-surface-border text-slate-200 printable-voucher">
            {/* Voucher Header */}
            <div className="flex items-start justify-between pb-4 border-b border-surface-border">
              <div>
                <h2 className="text-lg font-bold text-white">{company.nombre}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">NIT: {company.nit}</p>
                <p className="text-xs text-slate-400">{company.direccion}</p>
              </div>
              <div className="text-right">
                <span className="badge badge-blue text-xs font-semibold">COMPROBANTE DE PAGO</span>
                <p className="text-xs font-bold text-white mt-1.5">Período: {currentPeriod?.nombre}</p>
                <p className="text-[11px] text-slate-500 font-mono">{selectedVoucherItem.id}</p>
              </div>
            </div>

            {/* Employee Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 rounded-xl bg-white/5 text-xs">
              <div>
                <p className="text-slate-500 uppercase">Colaborador</p>
                <p className="font-bold text-white mt-0.5">{selectedVoucherItem.nombre}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Cargo</p>
                <p className="font-medium text-slate-200 mt-0.5">{selectedVoucherItem.cargo}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Días Liquidados</p>
                <p className="font-bold text-white mt-0.5">{selectedVoucherItem.diasLiquidados} días</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase">Salario Base</p>
                <p className="font-bold text-white mt-0.5">{formatCurrency(selectedVoucherItem.salarioBase)}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs my-4">
              {/* Devengos */}
              <div className="p-3 rounded-xl bg-slate-900 border border-surface-border">
                <p className="font-bold text-emerald-400 uppercase tracking-wider mb-2 border-b border-surface-border/60 pb-1">
                  1. Conceptos Devengados
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Salario Básico Proporcional:</span>
                    <span className="font-medium">{formatCurrency(selectedVoucherItem.salarioProporcional)}</span>
                  </div>
                  {selectedVoucherItem.auxilioTransporte > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auxilio de Transporte Legal:</span>
                      <span className="font-medium">{formatCurrency(selectedVoucherItem.auxilioTransporte)}</span>
                    </div>
                  )}
                  {selectedVoucherItem.horasExtras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Horas Extras y Recargos:</span>
                      <span className="font-medium text-emerald-300">
                        {formatCurrency(selectedVoucherItem.horasExtras)}
                      </span>
                    </div>
                  )}
                  {selectedVoucherItem.bonificaciones > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bonificaciones / Incentivos:</span>
                      <span className="font-medium text-emerald-300">
                        {formatCurrency(selectedVoucherItem.bonificaciones)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-surface-border flex justify-between font-bold text-white">
                    <span>Total Devengado:</span>
                    <span>{formatCurrency(selectedVoucherItem.totalDevengado)}</span>
                  </div>
                </div>
              </div>

              {/* Deducciones */}
              <div className="p-3 rounded-xl bg-slate-900 border border-surface-border">
                <p className="font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-surface-border/60 pb-1">
                  2. Conceptos Deducidos
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aporte Salud ({company.pctSalud}%):</span>
                    <span className="font-medium text-red-300">{formatCurrency(selectedVoucherItem.salud)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aporte Pensión ({company.pctPension}%):</span>
                    <span className="font-medium text-red-300">{formatCurrency(selectedVoucherItem.pension)}</span>
                  </div>
                  {selectedVoucherItem.anticipos > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Anticipos de Nómina:</span>
                      <span className="font-medium text-red-300">{formatCurrency(selectedVoucherItem.anticipos)}</span>
                    </div>
                  )}
                  {selectedVoucherItem.otrasDeducciones > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Otras Deducciones / Descuentos:</span>
                      <span className="font-medium text-red-300">
                        {formatCurrency(selectedVoucherItem.otrasDeducciones)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-surface-border flex justify-between font-bold text-white">
                    <span>Total Deducciones:</span>
                    <span className="text-red-400">{formatCurrency(selectedVoucherItem.totalDeducciones)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Neto Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-900/60 to-surface-card border border-brand-500/40 flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase text-brand-300 font-semibold tracking-wider">Neto a Consignar</p>
                <p className="text-2xl font-black text-white mt-0.5">{formatCurrency(selectedVoucherItem.neto)}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Transferencia Bancaria ACH</p>
                <p className="text-[11px] text-emerald-400 font-semibold">Estado: {selectedVoucherItem.estado}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-surface-border text-center text-xs">
              <div>
                <div className="border-b border-slate-600 w-3/4 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-300">Firma del Pagador</p>
                <p className="text-[11px] text-slate-500">NeuraCloud HR Technologies S.A.S.</p>
              </div>
              <div>
                <div className="border-b border-slate-600 w-3/4 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-300">Firma del Trabajador</p>
                <p className="text-[11px] text-slate-500">{selectedVoucherItem.nombre}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Adjust Item / Line Modal */}
      <Modal
        open={editItemModalOpen}
        title={`Ajustar Liquidación: ${editingItem?.nombre}`}
        onClose={() => setEditItemModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditItemModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveItemEdit}
            >
              Guardar y Recalcular
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Días Laborados (0 a 30)</label>
            <input
              type="number"
              min="0"
              max="30"
              className="input font-mono"
              value={editForm.diasLiquidados}
              onChange={e => setEditForm({ ...editForm, diasLiquidados: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Horas Extras y Recargos ($)</label>
            <input
              type="number"
              min="0"
              className="input font-mono"
              value={editForm.horasExtras}
              onChange={e => setEditForm({ ...editForm, horasExtras: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Bonificaciones Adicionales ($)</label>
            <input
              type="number"
              min="0"
              className="input font-mono"
              value={editForm.bonificaciones}
              onChange={e => setEditForm({ ...editForm, bonificaciones: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Anticipos Descontables ($)</label>
            <input
              type="number"
              min="0"
              className="input font-mono"
              value={editForm.anticipos}
              onChange={e => setEditForm({ ...editForm, anticipos: Number(e.target.value) })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1">Otras Deducciones ($)</label>
            <input
              type="number"
              min="0"
              className="input font-mono"
              value={editForm.otrasDeducciones}
              onChange={e => setEditForm({ ...editForm, otrasDeducciones: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Create New Period Modal */}
      <Modal
        open={createPeriodModalOpen}
        title="Crear Nuevo Período de Nómina"
        onClose={() => setCreatePeriodModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCreatePeriodModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCreatePeriod}
            >
              Crear Período
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Nombre del Período</label>
            <input
              type="text"
              className="input"
              value={newPeriodForm.nombre}
              onChange={e => setNewPeriodForm({ ...newPeriodForm, nombre: e.target.value })}
              placeholder="Ej. Noviembre 2026"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Código Identificador</label>
            <input
              type="text"
              className="input font-mono"
              value={newPeriodForm.codigo}
              onChange={e => setNewPeriodForm({ ...newPeriodForm, codigo: e.target.value })}
              placeholder="2026-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                className="input"
                value={newPeriodForm.fechaInicio}
                onChange={e => setNewPeriodForm({ ...newPeriodForm, fechaInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Fecha de Finalización</label>
              <input
                type="date"
                className="input"
                value={newPeriodForm.fechaFin}
                onChange={e => setNewPeriodForm({ ...newPeriodForm, fechaFin: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
