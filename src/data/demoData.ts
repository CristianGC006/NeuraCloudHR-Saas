// Demo data for NeuraCloud HR — clearly identified as placeholder data

export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  salarioBase: number;
  estado: 'activo' | 'inactivo' | 'vacaciones';
  avatar: string;
  email: string;
}

export interface PayrollRecord {
  id: string;
  empleadoId: string;
  nombre: string;
  periodo: string;
  salarioBase: number;
  bonificaciones: number;
  deducciones: number;
  neto: number;
  estado: 'procesada' | 'pendiente' | 'pagada';
}

export interface Absence {
  id: string;
  empleadoId: string;
  nombre: string;
  tipo: 'incapacidad' | 'vacaciones' | 'permiso' | 'ausencia';
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estado: 'aprobado' | 'pendiente' | 'rechazado';
  motivo: string;
}

// ── DEMO EMPLOYEES ──────────────────────────────────────────────
export const DEMO_EMPLOYEES: Employee[] = [
  { id: 'E001', nombre: 'Ana Martínez',    cargo: 'Directora de RR.HH.',   departamento: 'Recursos Humanos', fechaIngreso: '2019-03-15', salarioBase: 4800000, estado: 'activo',    avatar: 'AM', email: 'ana.martinez@neuracloud.co' },
  { id: 'E002', nombre: 'Carlos Rodríguez', cargo: 'Desarrollador Senior',  departamento: 'Tecnología',       fechaIngreso: '2020-07-01', salarioBase: 5200000, estado: 'activo',    avatar: 'CR', email: 'carlos.rodriguez@neuracloud.co' },
  { id: 'E003', nombre: 'Laura Sánchez',   cargo: 'Contadora',              departamento: 'Finanzas',         fechaIngreso: '2021-01-10', salarioBase: 3900000, estado: 'activo',    avatar: 'LS', email: 'laura.sanchez@neuracloud.co' },
  { id: 'E004', nombre: 'Miguel Torres',   cargo: 'Diseñador UX',           departamento: 'Producto',         fechaIngreso: '2021-08-22', salarioBase: 4100000, estado: 'vacaciones', avatar: 'MT', email: 'miguel.torres@neuracloud.co' },
  { id: 'E005', nombre: 'Sofía Herrera',   cargo: 'Analista de Datos',      departamento: 'Tecnología',       fechaIngreso: '2022-02-14', salarioBase: 4500000, estado: 'activo',    avatar: 'SH', email: 'sofia.herrera@neuracloud.co' },
  { id: 'E006', nombre: 'Diego Vargas',    cargo: 'Gerente Comercial',      departamento: 'Ventas',           fechaIngreso: '2018-11-05', salarioBase: 5800000, estado: 'activo',    avatar: 'DV', email: 'diego.vargas@neuracloud.co' },
  { id: 'E007', nombre: 'Valentina Cruz',  cargo: 'Marketing Manager',      departamento: 'Marketing',        fechaIngreso: '2022-06-30', salarioBase: 4300000, estado: 'activo',    avatar: 'VC', email: 'valentina.cruz@neuracloud.co' },
  { id: 'E008', nombre: 'Andrés Mora',     cargo: 'DevOps Engineer',        departamento: 'Tecnología',       fechaIngreso: '2023-01-16', salarioBase: 4700000, estado: 'inactivo',  avatar: 'AM', email: 'andres.mora@neuracloud.co' },
];

// ── DEMO PAYROLL ─────────────────────────────────────────────────
export const DEMO_PAYROLL: PayrollRecord[] = [
  { id: 'N001', empleadoId: 'E001', nombre: 'Ana Martínez',    periodo: 'Oct 2026', salarioBase: 4800000, bonificaciones: 480000,  deducciones: 864000,  neto: 4416000, estado: 'pagada'    },
  { id: 'N002', empleadoId: 'E002', nombre: 'Carlos Rodríguez', periodo: 'Oct 2026', salarioBase: 5200000, bonificaciones: 520000,  deducciones: 936000,  neto: 4784000, estado: 'pagada'    },
  { id: 'N003', empleadoId: 'E003', nombre: 'Laura Sánchez',   periodo: 'Oct 2026', salarioBase: 3900000, bonificaciones: 200000,  deducciones: 702000,  neto: 3398000, estado: 'procesada' },
  { id: 'N004', empleadoId: 'E004', nombre: 'Miguel Torres',   periodo: 'Oct 2026', salarioBase: 4100000, bonificaciones: 0,       deducciones: 738000,  neto: 3362000, estado: 'pendiente' },
  { id: 'N005', empleadoId: 'E005', nombre: 'Sofía Herrera',   periodo: 'Oct 2026', salarioBase: 4500000, bonificaciones: 450000,  deducciones: 810000,  neto: 4140000, estado: 'procesada' },
  { id: 'N006', empleadoId: 'E006', nombre: 'Diego Vargas',    periodo: 'Oct 2026', salarioBase: 5800000, bonificaciones: 1160000, deducciones: 1044000, neto: 5916000, estado: 'pagada'    },
  { id: 'N007', empleadoId: 'E007', nombre: 'Valentina Cruz',  periodo: 'Oct 2026', salarioBase: 4300000, bonificaciones: 300000,  deducciones: 774000,  neto: 3826000, estado: 'pendiente' },
  { id: 'N008', empleadoId: 'E008', nombre: 'Andrés Mora',     periodo: 'Oct 2026', salarioBase: 4700000, bonificaciones: 0,       deducciones: 0,       neto: 0,       estado: 'pendiente' },
];

// ── DEMO ABSENCES ────────────────────────────────────────────────
export const DEMO_ABSENCES: Absence[] = [
  { id: 'A001', empleadoId: 'E004', nombre: 'Miguel Torres',   tipo: 'vacaciones',  fechaInicio: '2026-10-07', fechaFin: '2026-10-18', dias: 10, estado: 'aprobado',  motivo: 'Vacaciones anuales' },
  { id: 'A002', empleadoId: 'E003', nombre: 'Laura Sánchez',   tipo: 'incapacidad', fechaInicio: '2026-10-12', fechaFin: '2026-10-16', dias: 4,  estado: 'aprobado',  motivo: 'Enfermedad general - EPS' },
  { id: 'A003', empleadoId: 'E007', nombre: 'Valentina Cruz',  tipo: 'permiso',     fechaInicio: '2026-10-14', fechaFin: '2026-10-14', dias: 1,  estado: 'pendiente', motivo: 'Cita médica' },
  { id: 'A004', empleadoId: 'E001', nombre: 'Ana Martínez',    tipo: 'incapacidad', fechaInicio: '2026-09-20', fechaFin: '2026-09-25', dias: 5,  estado: 'aprobado',  motivo: 'Accidente laboral' },
  { id: 'A005', empleadoId: 'E005', nombre: 'Sofía Herrera',   tipo: 'ausencia',    fechaInicio: '2026-10-10', fechaFin: '2026-10-10', dias: 1,  estado: 'rechazado', motivo: 'Ausencia injustificada' },
  { id: 'A006', empleadoId: 'E002', nombre: 'Carlos Rodríguez', tipo: 'permiso',    fechaInicio: '2026-10-20', fechaFin: '2026-10-21', dias: 2,  estado: 'pendiente', motivo: 'Calamidad doméstica' },
];

// ── DASHBOARD KPIs ───────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalEmpleados: 8,
  empleadosActivos: 6,
  empleadosVacaciones: 1,
  empleadosInactivos: 1,
  nominaMensual: 29920000,
  nominaAnterior: 28500000,
  ausenciasActivas: 3,
  incapacidadesActivas: 2,
};

export const PAYROLL_MONTHLY = [
  { mes: 'May', total: 27800000 },
  { mes: 'Jun', total: 28100000 },
  { mes: 'Jul', total: 28400000 },
  { mes: 'Ago', total: 27900000 },
  { mes: 'Sep', total: 28500000 },
  { mes: 'Oct', total: 29920000 },
];

export const DEPT_DISTRIBUTION = [
  { name: 'Tecnología',       value: 3, color: '#3b82f6' },
  { name: 'Ventas',           value: 1, color: '#8b5cf6' },
  { name: 'Recursos Humanos', value: 1, color: '#06b6d4' },
  { name: 'Finanzas',         value: 1, color: '#10b981' },
  { name: 'Producto',         value: 1, color: '#f59e0b' },
  { name: 'Marketing',        value: 1, color: '#ec4899' },
];
