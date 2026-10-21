import { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader, SectionCard } from '../components/ui/Cards';
import Modal from '../components/ui/Modal';
import { type CompanySettings } from '../data/demoData';
import {
  exportBackupJson,
  getCompanySettings,
  importBackupJson,
  resetToSeedData,
  saveCompanySettings,
  validateBackupFile,
  type HrDataState,
} from '../data/hrStore';

export default function Configuracion() {
  const [settings, setSettings] = useState<CompanySettings>(() => getCompanySettings());
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Restore Modal State
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedState, setImportedState] = useState<HrDataState | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setSettings(getCompanySettings());
    };
    window.addEventListener('neuracloud-hr-sync', sync);
    return () => window.removeEventListener('neuracloud-hr-sync', sync);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!settings.nombre.trim()) {
      setErrorNotice('El nombre de la empresa es obligatorio.');
      return;
    }
    if (settings.salarioMinimo <= 0) {
      setErrorNotice('El salario mínimo debe ser mayor a cero.');
      return;
    }

    saveCompanySettings(settings);
    setNotice('Configuración general y parámetros de nómina guardados correctamente.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorNotice(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const validation = validateBackupFile(content);

      if (validation.valid && validation.data) {
        setImportedState(validation.data);
        setImportSummary(
          `Archivo válido: Contiene ${validation.data.employees.length} empleados, ${validation.data.contracts.length} contratos, y ${validation.data.payrollPeriods.length} períodos de nómina.`,
        );
        setImportModalOpen(true);
      } else {
        setErrorNotice(validation.error || 'Error al validar el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const confirmImport = () => {
    if (importedState) {
      importBackupJson(importedState);
      setImportModalOpen(false);
      setImportedState(null);
      setNotice('Copia de seguridad restaurada con éxito. Todos los módulos han sido actualizados.');
    }
  };

  const confirmResetSeed = () => {
    resetToSeedData();
    setRestoreModalOpen(false);
    setNotice('Se han restaurado los datos predeterminados del sistema exitosamente.');
  };

  return (
    <div>
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Identidad corporativa, parámetros legales de nómina y gestión de copias de seguridad"
      />

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-400 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorNotice}</span>
          </div>
          <button type="button" onClick={() => setErrorNotice(null)} className="text-red-400 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Empresa */}
        <SectionCard
          title="Información de la Organización"
          subtitle="Identidad y datos comerciales que aparecen en reportes y comprobantes de nómina"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Razón Social de la Empresa</label>
              <input
                type="text"
                className="input"
                value={settings.nombre}
                onChange={e => setSettings({ ...settings, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NIT / Identificación Tributaria</label>
              <input
                type="text"
                className="input"
                value={settings.nit}
                onChange={e => setSettings({ ...settings, nit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Moneda del Sistema</label>
              <select
                className="input"
                value={settings.moneda}
                onChange={e => setSettings({ ...settings, moneda: e.target.value })}
              >
                <option value="COP">COP ($) — Peso Colombiano</option>
                <option value="USD">USD ($) — Dólar Estadounidense</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="MXN">MXN ($) — Peso Mexicano</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico de RR.HH.</label>
              <input
                type="email"
                className="input"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono Principal</label>
              <input
                type="text"
                className="input"
                value={settings.telefono}
                onChange={e => setSettings({ ...settings, telefono: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección de la Sede Principal</label>
              <input
                type="text"
                className="input"
                value={settings.direccion}
                onChange={e => setSettings({ ...settings, direccion: e.target.value })}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Parámetros de Nómina */}
        <SectionCard
          title="Parámetros Legales de Liquidación"
          subtitle="Valores legales de referencia utilizados para el cálculo de auxilio de transporte y aportes"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Salario Mínimo Legal (SMLMV)</label>
              <input
                type="number"
                min="0"
                className="input font-mono"
                value={settings.salarioMinimo}
                onChange={e => setSettings({ ...settings, salarioMinimo: Number(e.target.value) })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Base para cálculo de auxilios y topes</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Auxilio de Transporte Mensual</label>
              <input
                type="number"
                min="0"
                className="input font-mono"
                value={settings.auxilioTransporte}
                onChange={e => setSettings({ ...settings, auxilioTransporte: Number(e.target.value) })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Aplica para salarios &le; 2 SMLMV</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">% Aporte Salud (Empleado)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  className="input font-mono pr-8"
                  value={settings.pctSalud}
                  onChange={e => setSettings({ ...settings, pctSalud: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Deducción de ley estándar: 4.0%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">% Aporte Pensión (Empleado)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  className="input font-mono pr-8"
                  value={settings.pctPension}
                  onChange={e => setSettings({ ...settings, pctPension: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Deducción de ley estándar: 4.0%</p>
            </div>
          </div>
        </SectionCard>

        {/* Section 3: Notificaciones */}
        <SectionCard
          title="Preferencias de Alertas"
          subtitle="Configuración de anticipación para avisos y vencimientos"
        >
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Días de anticipación para contratos por vencer
            </label>
            <select
              className="input"
              value={settings.diasAlertaContrato}
              onChange={e => setSettings({ ...settings, diasAlertaContrato: Number(e.target.value) })}
            >
              <option value={15}>15 días de anticipación</option>
              <option value={30}>30 días de anticipación (Recomendado legal)</option>
              <option value={45}>45 días de anticipación</option>
              <option value={60}>60 días de anticipación</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Los contratos a término fijo que venzan en este rango se marcarán en amarillo en el Dashboard y la campana de notificaciones.
            </p>
          </div>
        </SectionCard>

        {/* Save button for settings */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-6 py-2.5">
            <Save size={16} /> Guardar Cambios de Configuración
          </button>
        </div>
      </form>

      {/* Section 4: Backup, Import, Restore */}
      <div className="mt-8 pt-8 border-t border-surface-border">
        <SectionCard
          title="Gestión de Datos y Copias de Seguridad"
          subtitle="Herramientas para respaldar, migrar o reiniciar el prototipo en el almacenamiento local del navegador"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Export JSON */}
            <div className="card-sm bg-slate-900/60 border-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-brand-400 mb-2">
                  <Download size={20} />
                  <h4 className="font-bold text-white text-sm">Exportar Respaldo</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Descarga un archivo JSON completo con todos los empleados, contratos, novedades y nóminas para custodia o migración.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={exportBackupJson}
                  className="btn-secondary w-full justify-center text-xs"
                >
                  <Download size={14} /> Descargar Copia JSON
                </button>
              </div>
            </div>

            {/* Import JSON */}
            <div className="card-sm bg-slate-900/60 border-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                  <Upload size={20} />
                  <h4 className="font-bold text-white text-sm">Importar Respaldo</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Carga una copia de seguridad JSON previamente exportada. El sistema validará la integridad antes de reemplazar los datos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full justify-center text-xs text-emerald-300 hover:text-emerald-200"
                >
                  <Upload size={14} /> Seleccionar Archivo JSON
                </button>
              </div>
            </div>

            {/* Restore Seed */}
            <div className="card-sm bg-slate-900/60 border-surface-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <RotateCcw size={20} />
                  <h4 className="font-bold text-white text-sm">Restaurar Datos Predeterminados</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reinicia la plataforma con la base corporativa predeterminada de colaboradores, contratos, novedades y nóminas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setRestoreModalOpen(true)}
                  className="btn-secondary w-full justify-center text-xs text-amber-300 hover:text-amber-200"
                >
                  <RotateCcw size={14} /> Restaurar Base Predeterminada
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Confirmation Modal: Reset Seed Data */}
      <Modal
        open={restoreModalOpen}
        title="¿Restaurar datos predeterminados?"
        onClose={() => setRestoreModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setRestoreModalOpen(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary bg-amber-600 hover:bg-amber-500 text-white"
              onClick={confirmResetSeed}
            >
              <RotateCcw size={14} /> Sí, Restaurar Datos Predeterminados
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
            <AlertTriangle size={20} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold">Advertencia importante</p>
              <p className="mt-1">
                Esta acción sobrescribirá todos los empleados, contratos, ausencias y períodos de nómina que hayas creado o editado en este navegador, restaurando el conjunto predeterminado del sistema.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Si deseas conservar tus cambios actuales, te recomendamos hacer clic en <strong>"Descargar Copia JSON"</strong> antes de proceder.
          </p>
        </div>
      </Modal>

      {/* Confirmation Modal: Import Backup JSON */}
      <Modal
        open={importModalOpen}
        title="Confirmar Importación de Datos"
        onClose={() => {
          setImportModalOpen(false);
          setImportedState(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setImportModalOpen(false);
                setImportedState(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={confirmImport}
            >
              <Upload size={14} /> Confirmar y Sobrescribir
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
            <FileCheck size={20} className="shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold">Estructura validada correctamente</p>
              <p className="mt-1">{importSummary}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
            <ShieldAlert size={20} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold">¿Deseas reemplazar el estado actual?</p>
              <p className="mt-1">
                Los datos actuales en LocalStorage serán reemplazados por los registros contenidos en el archivo importado.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
