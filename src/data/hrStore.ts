import {
  DEMO_ABSENCES,
  DEMO_COMPANY_SETTINGS,
  DEMO_CONTRACTS,
  DEMO_DEPARTMENTS,
  DEMO_EMPLOYEES,
  DEMO_PAYROLL_PERIODS,
  DEMO_POSITIONS,
  type Absence,
  type CompanySettings,
  type Contract,
  type Department,
  type Employee,
  type PayrollPeriod,
  type PayrollPeriodItem,
  type PayrollRecord,
  type Position,
} from './demoData';

export interface HrDataState {
  version: number;
  employees: Employee[];
  contracts: Contract[];
  departments: Department[];
  positions: Position[];
  absences: Absence[];
  payrollPeriods: PayrollPeriod[];
  companySettings: CompanySettings;
}

export interface AuthSession {
  username: string;
  nombre: string;
  rol: string;
  token: string;
  loginTime: string;
}

const STORAGE_KEY_V2 = 'neuracloud-hr-state-v2';
const STORAGE_KEY_V1 = 'neuracloud-hr-state-v1';
const AUTH_KEY = 'neuracloud-hr-auth';

// ── DEFAULT STATE ────────────────────────────────────────────────
export function getDefaultData(): HrDataState {
  return {
    version: 2,
    employees: JSON.parse(JSON.stringify(DEMO_EMPLOYEES)),
    contracts: JSON.parse(JSON.stringify(DEMO_CONTRACTS)),
    departments: JSON.parse(JSON.stringify(DEMO_DEPARTMENTS)),
    positions: JSON.parse(JSON.stringify(DEMO_POSITIONS)),
    absences: JSON.parse(JSON.stringify(DEMO_ABSENCES)),
    payrollPeriods: JSON.parse(JSON.stringify(DEMO_PAYROLL_PERIODS)),
    companySettings: JSON.parse(JSON.stringify(DEMO_COMPANY_SETTINGS)),
  };
}

// ── SAFE PARSING AND MIGRATION ──────────────────────────────────
function parseState(raw: string | null): HrDataState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<HrDataState>;
    if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.absences)) {
      const defaultState = getDefaultData();
      return {
        version: 2,
        employees: parsed.employees.length > 0 ? (parsed.employees as Employee[]) : defaultState.employees,
        contracts: Array.isArray(parsed.contracts) && parsed.contracts.length > 0 ? (parsed.contracts as Contract[]) : defaultState.contracts,
        departments: Array.isArray(parsed.departments) && parsed.departments.length > 0 ? (parsed.departments as Department[]) : defaultState.departments,
        positions: Array.isArray(parsed.positions) && parsed.positions.length > 0 ? (parsed.positions as Position[]) : defaultState.positions,
        absences: parsed.absences.length > 0 ? (parsed.absences as Absence[]) : defaultState.absences,
        payrollPeriods: Array.isArray(parsed.payrollPeriods) && parsed.payrollPeriods.length > 0 ? (parsed.payrollPeriods as PayrollPeriod[]) : defaultState.payrollPeriods,
        companySettings: parsed.companySettings && parsed.companySettings.nombre ? (parsed.companySettings as CompanySettings) : defaultState.companySettings,
      };
    }
  } catch (err) {
    console.error('Error parsing HR data state:', err);
    return null;
  }
  return null;
}

export function ensureSeedData(): HrDataState {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  // 1. Try v2 first
  const v2Raw = window.localStorage.getItem(STORAGE_KEY_V2);
  const parsedV2 = parseState(v2Raw);
  if (parsedV2) {
    const synced = syncBusinessState(parsedV2);
    try {
      window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(synced));
    } catch {
      // ignore
    }
    return synced;
  }

  // 2. Try v1 backwards compatible migration
  const v1Raw = window.localStorage.getItem(STORAGE_KEY_V1);
  if (v1Raw) {
    try {
      const v1Data = JSON.parse(v1Raw);
      const defaultState = getDefaultData();
      const migrated: HrDataState = {
        ...defaultState,
        employees: Array.isArray(v1Data.employees) && v1Data.employees.length >= 8 ? v1Data.employees : defaultState.employees,
        absences: Array.isArray(v1Data.absences) && v1Data.absences.length > 0 ? v1Data.absences : defaultState.absences,
      };
      const synced = syncBusinessState(migrated);
      window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(synced));
      return synced;
    } catch {
      // fallback to fresh seed
    }
  }

  // 3. Fresh seed data
  const seeded = syncBusinessState(getDefaultData());
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(seeded));
  return seeded;
}

export function readHrData(): HrDataState {
  return ensureSeedData();
}

export function persistHrData(nextData: HrDataState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(nextData));
    window.dispatchEvent(new Event('neuracloud-hr-sync'));
  } catch (err) {
    console.error('Failed to persist HR data to localStorage:', err);
  }
}

// ── AUTHENTICATION ──────────────────────────────────────────────
export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function loginDemo(usernameInput: string, passwordInput: string): { success: boolean; message?: string; session?: AuthSession } {
  const user = usernameInput.trim();
  const pass = passwordInput.trim();

  // Demonstration validation strictly check credentials
  if (user === 'admin' && pass === 'admin') {
    const session: AuthSession = {
      username: 'admin',
      nombre: 'Administrador RR.HH.',
      rol: 'Administrador SaaS',
      token: `auth-token-${Date.now()}`,
      loginTime: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event('neuracloud-hr-auth-change'));
    }
    return { success: true, session };
  }

  return { success: false, message: 'Usuario o contraseña incorrectos. Verifica tus credenciales de acceso.' };
}

export function logoutDemo(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('neuracloud-hr-auth-change'));
  }
}

// ── EMPLOYEES CRUD ──────────────────────────────────────────────
export function getEmployees(): Employee[] {
  return readHrData().employees;
}

export function saveEmployees(employees: Employee[]): void {
  const state = readHrData();
  const synced = syncBusinessState({ ...state, employees });
  persistHrData(synced);
}

export function deleteEmployee(employeeId: string): void {
  const state = readHrData();
  const nextEmployees = state.employees.filter(e => e.id !== employeeId);
  const synced = syncBusinessState({ ...state, employees: nextEmployees });
  persistHrData(synced);
}

export function getEmployeeById(employeeId: string): Employee | undefined {
  return getEmployees().find(emp => emp.id === employeeId);
}

export function getEmployeeLabel(employeeId: string): string {
  return getEmployeeById(employeeId)?.nombre ?? 'Empleado no disponible';
}

// ── CONTRACTS CRUD ──────────────────────────────────────────────
export function getContracts(): Contract[] {
  const contracts = readHrData().contracts;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dynamically update status for active contracts with end dates
  return contracts.map(contract => {
    if (contract.estado === 'terminado') return contract;
    if (contract.fechaFin) {
      const endDate = new Date(`${contract.fechaFin}T00:00:00`);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return { ...contract, estado: 'vencido' };
      }
      if (diffDays <= 30) {
        return { ...contract, estado: 'por_vencer' };
      }
    }
    return contract;
  });
}

export function saveContracts(contracts: Contract[]): void {
  const state = readHrData();
  const updatedEmployees = state.employees.map(emp => {
    const ctr = contracts.find(c => c.empleadoId === emp.id);
    if (!ctr) return emp;
    return {
      ...emp,
      salarioBase: ctr.salario,
      cargo: ctr.cargo || emp.cargo,
      departamento: ctr.departamento || emp.departamento,
      tipoContrato: ctr.tipoContrato || emp.tipoContrato,
      fechaVencimientoContrato: ctr.fechaFin,
    };
  });
  const synced = syncBusinessState({ ...state, employees: updatedEmployees, contracts });
  persistHrData(synced);
}

// ── DEPARTMENTS & POSITIONS CRUD ────────────────────────────────
export function getDepartments(): Department[] {
  return readHrData().departments;
}

export function saveDepartments(departments: Department[]): void {
  const state = readHrData();
  persistHrData({ ...state, departments });
}

export function getPositions(): Position[] {
  return readHrData().positions;
}

export function savePositions(positions: Position[]): void {
  const state = readHrData();
  persistHrData({ ...state, positions });
}

// ── ABSENCES / NOVEDADES CRUD ───────────────────────────────────
export function getAbsences(): Absence[] {
  return readHrData().absences;
}

export function saveAbsences(absences: Absence[]): void {
  const state = readHrData();
  const synced = syncBusinessState({ ...state, absences });
  persistHrData(synced);
}

export function getAbsenceOverlap(
  employeeId: string,
  startDate: string,
  endDate: string,
  ignoreId?: string,
): Absence[] {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();

  return getAbsences().filter(absence => {
    if (absence.empleadoId !== employeeId) return false;
    if (ignoreId && absence.id === ignoreId) return false;
    if (absence.estado === 'rechazado') return false;

    const currentStart = new Date(`${absence.fechaInicio}T00:00:00`).getTime();
    const currentEnd = new Date(`${absence.fechaFin}T00:00:00`).getTime();

    return currentStart <= end && currentEnd >= start;
  });
}

// ── PAYROLL MANAGEMENT ──────────────────────────────────────────
export function getPayrollPeriods(): PayrollPeriod[] {
  return readHrData().payrollPeriods;
}

export function savePayrollPeriods(payrollPeriods: PayrollPeriod[]): void {
  const state = readHrData();
  persistHrData({ ...state, payrollPeriods });
}

export function getPayrollPeriodById(periodId: string): PayrollPeriod | undefined {
  return getPayrollPeriods().find(period => period.id === periodId);
}

// For compatibility with previous views that queried flat PayrollRecord[]
export function getPayroll(): PayrollRecord[] {
  const periods = getPayrollPeriods();
  const activePeriod = periods.find(p => p.estado !== 'cerrado') || periods[periods.length - 1];
  if (!activePeriod) return [];

  return activePeriod.items.map(item => ({
    id: item.id,
    empleadoId: item.empleadoId,
    nombre: item.nombre,
    periodo: activePeriod.nombre,
    salarioBase: item.salarioBase,
    bonificaciones: item.bonificaciones + item.horasExtras + item.comisiones + item.auxilioTransporte,
    deducciones: item.totalDeducciones,
    neto: item.neto,
    estado: item.estado,
  }));
}

export function savePayroll(flatRecords: PayrollRecord[]): void {
  const periods = getPayrollPeriods();
  if (periods.length === 0) return;

  const targetPeriodIndex = periods.findIndex(p => p.estado !== 'cerrado');
  const index = targetPeriodIndex >= 0 ? targetPeriodIndex : periods.length - 1;
  const current = periods[index];

  const updatedItems: PayrollPeriodItem[] = current.items.map(item => {
    const matched = flatRecords.find(r => r.id === item.id || r.empleadoId === item.empleadoId);
    if (!matched) return item;
    return {
      ...item,
      salarioBase: matched.salarioBase,
      bonificaciones: matched.bonificaciones,
      totalDeducciones: matched.deducciones,
      neto: matched.neto,
      estado: matched.estado,
    };
  });

  const totalDev = updatedItems.reduce((acc, i) => acc + i.totalDevengado, 0);
  const totalDed = updatedItems.reduce((acc, i) => acc + i.totalDeducciones, 0);
  const totalNet = updatedItems.reduce((acc, i) => acc + i.neto, 0);

  periods[index] = {
    ...current,
    items: updatedItems,
    totalDevengado: totalDev,
    totalDeducciones: totalDed,
    totalNeto: totalNet,
  };

  savePayrollPeriods(periods);
}

// Payroll calculation engine
export function calculatePayrollItem(
  employee: Employee,
  periodNovedades: Absence[],
  settings: CompanySettings,
  daysWorked = 30,
): PayrollPeriodItem {
  const salarioBase = employee.salarioBase;
  const salarioProporcional = Math.round((salarioBase / 30) * daysWorked);

  // Auxilio de transporte: eligible if salary <= 2 minimum wages
  const hasAuxilio = salarioBase <= settings.salarioMinimo * 2;
  const auxilioTransporte = hasAuxilio ? Math.round((settings.auxilioTransporte / 30) * daysWorked) : 0;

  // Gather approved novedades for this employee
  let horasExtras = 0;
  let bonificaciones = 0;
  let comisiones = 0;
  let otrosDevengos = 0;
  let anticipos = 0;
  let otrasDeducciones = 0;
  const novedadesAplicadas: string[] = [];

  periodNovedades.forEach(nov => {
    if (nov.empleadoId === employee.id && nov.estado === 'aprobado') {
      novedadesAplicadas.push(nov.id);
      if (nov.tipo === 'horas_extras') {
        horasExtras += nov.valorEconomico || 0;
      } else if (nov.tipo === 'bonificacion') {
        bonificaciones += nov.valorEconomico || 0;
      } else if (nov.tipo === 'ausencia') {
        // Unjustified absence discounts
        otrasDeducciones += Math.round((salarioBase / 30) * nov.dias);
      }
    }
  });

  const totalDevengado =
    salarioProporcional + auxilioTransporte + horasExtras + bonificaciones + comisiones + otrosDevengos;

  // Health and pension base does not include transport allowance
  const baseCotizacion = salarioProporcional + horasExtras;
  const salud = Math.round(baseCotizacion * (settings.pctSalud / 100));
  const pension = Math.round(baseCotizacion * (settings.pctPension / 100));

  const totalDeducciones = salud + pension + anticipos + otrasDeducciones;
  const neto = Math.max(0, totalDevengado - totalDeducciones);

  return {
    id: `PAY-${employee.id}-${Date.now().toString().slice(-4)}`,
    periodoId: '',
    empleadoId: employee.id,
    nombre: employee.nombre,
    cargo: employee.cargo,
    departamento: employee.departamento,
    diasLiquidados: daysWorked,
    salarioBase,
    salarioProporcional,
    auxilioTransporte,
    horasExtras,
    bonificaciones,
    comisiones,
    otrosDevengos,
    totalDevengado,
    salud,
    pension,
    anticipos,
    otrasDeducciones,
    totalDeducciones,
    neto,
    estado: 'pendiente',
    novedadesAplicadas,
  };
}

export function generatePeriodDraft(
  nombre: string,
  codigo: string,
  fechaInicio: string,
  fechaFin: string,
): PayrollPeriod {
  const state = readHrData();
  const settings = state.companySettings;
  const activeEmployees = state.employees.filter(e => e.estado !== 'inactivo');
  const novedades = state.absences;

  const items: PayrollPeriodItem[] = activeEmployees.map(emp => {
    const item = calculatePayrollItem(emp, novedades, settings, 30);
    return {
      ...item,
      periodoId: codigo,
    };
  });

  const totalDevengado = items.reduce((sum, i) => sum + i.totalDevengado, 0);
  const totalDeducciones = items.reduce((sum, i) => sum + i.totalDeducciones, 0);
  const totalNeto = items.reduce((sum, i) => sum + i.neto, 0);

  return {
    id: `PER-${codigo.replace(/[^a-zA-Z0-9]/g, '')}`,
    nombre,
    codigo,
    fechaInicio,
    fechaFin,
    estado: 'borrador',
    totalDevengado,
    totalDeducciones,
    totalNeto,
    empleadosCount: items.length,
    items,
  };
}

// ── UNIFIED BUSINESS RECONCILIATION ENGINE ──────────────────────
export function syncBusinessState(state: HrDataState): HrDataState {
  const employees = state.employees || [];
  const settings = state.companySettings;
  const absences = state.absences || [];

  // 1. Sync contracts with current employees
  const currentEmpIds = new Set(employees.map(e => e.id));
  const contracts = (state.contracts || []).filter(c => currentEmpIds.has(c.empleadoId));

  employees.forEach(emp => {
    const existingIndex = contracts.findIndex(c => c.empleadoId === emp.id);
    if (existingIndex >= 0) {
      const ctr = contracts[existingIndex];
      contracts[existingIndex] = {
        ...ctr,
        empleadoNombre: emp.nombre,
        cargo: emp.cargo,
        departamento: emp.departamento,
        salario: emp.salarioBase,
        tipoContrato: (emp.tipoContrato as Contract['tipoContrato']) || ctr.tipoContrato,
        fechaFin: emp.fechaVencimientoContrato !== undefined ? emp.fechaVencimientoContrato : ctr.fechaFin,
        estado:
          emp.estado === 'inactivo'
            ? 'terminado'
            : ctr.estado === 'terminado'
            ? 'activo'
            : ctr.estado,
      };
    } else if (emp.estado !== 'inactivo') {
      contracts.push({
        id: createSequentialId('CTR', contracts),
        empleadoId: emp.id,
        empleadoNombre: emp.nombre,
        cargo: emp.cargo,
        departamento: emp.departamento,
        tipoContrato: (emp.tipoContrato as Contract['tipoContrato']) || 'Término Indefinido',
        fechaInicio: emp.fechaIngreso || new Date().toISOString().slice(0, 10),
        fechaFin: emp.fechaVencimientoContrato,
        salario: emp.salarioBase,
        estado: 'activo',
        observaciones: 'Sincronizado automáticamente con el registro de colaboradores',
      });
    }
  });

  // 2. Sync Payroll Periods
  let payrollPeriods = [...(state.payrollPeriods || [])];
  if (payrollPeriods.length === 0) {
    const draft = generatePeriodDraft('Octubre 2026', '2026-10', '2026-10-01', '2026-10-31');
    payrollPeriods = [draft];
  }

  // Active employees for payroll calculations
  const activeEmployees = employees.filter(e => e.estado !== 'inactivo');

  payrollPeriods = payrollPeriods.map(period => {
    // Only synchronize unclosed periods (e.g. borrador, revisado)
    if (period.estado === 'cerrado') return period;

    const updatedItems: PayrollPeriodItem[] = [];

    // For every active employee, update or create item
    activeEmployees.forEach(emp => {
      const existing = period.items.find(i => i.empleadoId === emp.id);
      if (existing) {
        // Recalculate with updated salary and department/cargo, preserving line adjustments
        const dias = existing.diasLiquidados ?? 30;
        const salarioBase = emp.salarioBase;
        const salarioProporcional = Math.round((salarioBase / 30) * dias);
        const hasAux = salarioBase <= settings.salarioMinimo * 2;
        const auxilioTransporte = hasAux ? Math.round((settings.auxilioTransporte / 30) * dias) : 0;

        const horasExtras = existing.horasExtras || 0;
        const bonificaciones = existing.bonificaciones || 0;
        const comisiones = existing.comisiones || 0;
        const otrosDevengos = existing.otrosDevengos || 0;
        const anticipos = existing.anticipos || 0;
        const otrasDeducciones = existing.otrasDeducciones || 0;

        const totalDevengado =
          salarioProporcional + auxilioTransporte + horasExtras + bonificaciones + comisiones + otrosDevengos;
        const baseCotizacion = salarioProporcional + horasExtras;
        const salud = Math.round(baseCotizacion * (settings.pctSalud / 100));
        const pension = Math.round(baseCotizacion * (settings.pctPension / 100));
        const totalDeducciones = salud + pension + anticipos + otrasDeducciones;
        const neto = Math.max(0, totalDevengado - totalDeducciones);

        updatedItems.push({
          ...existing,
          nombre: emp.nombre,
          cargo: emp.cargo,
          departamento: emp.departamento,
          diasLiquidados: dias,
          salarioBase,
          salarioProporcional,
          auxilioTransporte,
          totalDevengado,
          salud,
          pension,
          totalDeducciones,
          neto,
        });
      } else {
        // Brand new employee in this period
        const newItem = calculatePayrollItem(emp, absences, settings, 30);
        newItem.periodoId = period.id;
        updatedItems.push(newItem);
      }
    });

    const totalDevengado = updatedItems.reduce((acc, i) => acc + i.totalDevengado, 0);
    const totalDeducciones = updatedItems.reduce((acc, i) => acc + i.totalDeducciones, 0);
    const totalNeto = updatedItems.reduce((acc, i) => acc + i.neto, 0);

    return {
      ...period,
      items: updatedItems,
      totalDevengado,
      totalDeducciones,
      totalNeto,
      empleadosCount: updatedItems.length,
    };
  });

  // 3. Sync absences: remove absences for deleted employees
  const validAbsences = absences.filter(a => currentEmpIds.has(a.empleadoId));

  return {
    ...state,
    employees,
    contracts,
    payrollPeriods,
    absences: validAbsences,
  };
}

// ── COMPANY SETTINGS CRUD ───────────────────────────────────────
export function getCompanySettings(): CompanySettings {
  return readHrData().companySettings;
}

export function saveCompanySettings(companySettings: CompanySettings): void {
  const state = readHrData();
  const synced = syncBusinessState({ ...state, companySettings });
  persistHrData(synced);
}

// ── SYSTEM ALERTS ───────────────────────────────────────────────
export interface SystemAlert {
  id: string;
  tipo: 'contrato' | 'novedad' | 'nomina';
  titulo: string;
  descripcion: string;
  severidad: 'urgente' | 'aviso' | 'info';
  fecha?: string;
  enlace: string;
}

export function getSystemAlerts(): SystemAlert[] {
  const contracts = getContracts();
  const absences = getAbsences();
  const periods = getPayrollPeriods();
  const alerts: SystemAlert[] = [];

  // Contracts expiring soon or expired
  contracts.forEach(contract => {
    if (contract.estado === 'por_vencer') {
      alerts.push({
        id: `alert-ctr-${contract.id}`,
        tipo: 'contrato',
        titulo: `Contrato por vencer: ${contract.empleadoNombre}`,
        descripcion: `Contrato ${contract.tipoContrato} finaliza el ${contract.fechaFin}. Prepara renovación o prórroga.`,
        severidad: 'urgente',
        fecha: contract.fechaFin,
        enlace: '/contratos',
      });
    } else if (contract.estado === 'vencido') {
      alerts.push({
        id: `alert-ctr-exp-${contract.id}`,
        tipo: 'contrato',
        titulo: `Contrato vencido: ${contract.empleadoNombre}`,
        descripcion: `El contrato finalizó el ${contract.fechaFin} y requiere regularización.`,
        severidad: 'urgente',
        fecha: contract.fechaFin,
        enlace: '/contratos',
      });
    }
  });

  // Pending absences
  const pendingAbsences = absences.filter(a => a.estado === 'pendiente');
  if (pendingAbsences.length > 0) {
    alerts.push({
      id: 'alert-pending-absences',
      tipo: 'novedad',
      titulo: `${pendingAbsences.length} novedades pendientes de aprobación`,
      descripcion: `Existen solicitudes de incapacidad, permisos o vacaciones a la espera de visto bueno.`,
      severidad: 'aviso',
      enlace: '/incapacidades',
    });
  }

  // Draft payroll
  const draftPeriod = periods.find(p => p.estado === 'borrador');
  if (draftPeriod) {
    alerts.push({
      id: `alert-draft-period-${draftPeriod.id}`,
      tipo: 'nomina',
      titulo: `Nómina en borrador: ${draftPeriod.nombre}`,
      descripcion: 'El período actual aún está en borrador. Revisa y liquida antes del cierre del mes.',
      severidad: 'info',
      enlace: '/nomina',
    });
  }

  return alerts;
}

// ── BACKUP & RESTORE ────────────────────────────────────────────
export function exportBackupJson(): void {
  const state = readHrData();
  const exportPayload = {
    app: 'NeuraCloud HR SaaS',
    version: state.version,
    exportedAt: new Date().toISOString(),
    data: state,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neuracloud_hr_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateBackupFile(fileContent: string): { valid: boolean; data?: HrDataState; error?: string } {
  try {
    const parsed = JSON.parse(fileContent);
    const candidate = parsed.data || parsed;

    if (
      candidate &&
      Array.isArray(candidate.employees) &&
      Array.isArray(candidate.absences) &&
      candidate.employees.length > 0
    ) {
      const defaultState = getDefaultData();
      const sanitized: HrDataState = {
        version: 2,
        employees: candidate.employees,
        contracts: Array.isArray(candidate.contracts) ? candidate.contracts : defaultState.contracts,
        departments: Array.isArray(candidate.departments) ? candidate.departments : defaultState.departments,
        positions: Array.isArray(candidate.positions) ? candidate.positions : defaultState.positions,
        absences: candidate.absences,
        payrollPeriods: Array.isArray(candidate.payrollPeriods) ? candidate.payrollPeriods : defaultState.payrollPeriods,
        companySettings: candidate.companySettings || defaultState.companySettings,
      };
      return { valid: true, data: sanitized };
    }
    return { valid: false, error: 'El archivo JSON no tiene la estructura requerida de NeuraCloud HR.' };
  } catch {
    return { valid: false, error: 'El archivo no contiene un formato JSON válido.' };
  }
}

export function importBackupJson(state: HrDataState): void {
  persistHrData(state);
}

export function resetToSeedData(): void {
  const seeded = getDefaultData();
  persistHrData(seeded);
}

// ── ID GENERATOR & HELPERS ──────────────────────────────────────
export function createSequentialId(prefix: string, items: Array<{ id: string }>): string {
  let counter = 1;
  let id = `${prefix}${String(counter).padStart(3, '0')}`;

  while (items.some(item => item.id === id)) {
    counter += 1;
    id = `${prefix}${String(counter).padStart(3, '0')}`;
  }

  return id;
}

export function formatCurrency(value: number, currencyCode = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function initialsFromName(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'HR'
  );
}

export function exportCsv(filename: string, rows: Record<string, string | number>[]): void {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(';'),
    ...rows.map(row =>
      headers
        .map(key => `"${String(row[key] ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
