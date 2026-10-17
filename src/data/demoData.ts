// Demo data for NeuraCloud HR — Mock dataset for SaaS HR prototype

export interface Employee {
  id: string;
  nombre: string;
  tipoDocumento?: string; // CC, CE, PAS, etc.
  documento?: string;
  fechaNacimiento?: string;
  cargo: string;
  departamento: string;
  jefeInmediato?: string;
  fechaIngreso: string;
  salarioBase: number;
  estado: 'activo' | 'inactivo' | 'vacaciones';
  avatar: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tipoContrato?: string;
  fechaVencimientoContrato?: string;
  contactoEmergencia?: {
    nombre: string;
    telefono: string;
    parentesco?: string;
  };
  adminInfo?: {
    estadoCivil?: string;
    eps?: string;
    fondoPension?: string;
    cesantias?: string;
    cajaCompensacion?: string;
    banco?: string;
    tipoCuenta?: string;
    numeroCuenta?: string;
    fechaAfiliacion?: string;
  };
}

export interface Contract {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  tipoContrato: 'Término Indefinido' | 'Término Fijo' | 'Obra o Labor' | 'Aprendizaje' | 'Prestación de Servicios';
  fechaInicio: string;
  fechaFin?: string;
  salario: number;
  cargo: string;
  departamento: string;
  estado: 'activo' | 'por_vencer' | 'vencido' | 'terminado';
  observaciones?: string;
}

export interface Department {
  id: string;
  nombre: string;
  descripcion: string;
  responsable: string;
  color: string;
}

export interface Position {
  id: string;
  nombre: string;
  departamentoId: string;
  departamentoNombre: string;
  salarioMin: number;
  salarioMax: number;
  descripcion?: string;
}

export interface Absence {
  id: string;
  empleadoId: string;
  nombre: string;
  tipo:
    | 'incapacidad'
    | 'vacaciones'
    | 'permiso'
    | 'ausencia'
    | 'horas_extras'
    | 'bonificacion'
    | 'licencia'
    | 'otra';
  subtipo?: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  horas?: number;
  valorEconomico?: number;
  estado: 'aprobado' | 'pendiente' | 'rechazado';
  motivo: string;
  fechaRegistro: string;
  afectaNomina?: boolean;
}

export interface PayrollPeriodItem {
  id: string;
  periodoId: string;
  empleadoId: string;
  nombre: string;
  cargo: string;
  departamento: string;
  diasLiquidados: number;
  salarioBase: number;
  salarioProporcional: number;
  auxilioTransporte: number;
  horasExtras: number;
  bonificaciones: number;
  comisiones: number;
  otrosDevengos: number;
  totalDevengado: number;
  salud: number;
  pension: number;
  anticipos: number;
  otrasDeducciones: number;
  totalDeducciones: number;
  neto: number;
  estado: 'pendiente' | 'procesada' | 'pagada';
  novedadesAplicadas?: string[];
}

export interface PayrollPeriod {
  id: string;
  nombre: string; // e.g. "Octubre 2026"
  codigo: string; // e.g. "2026-10"
  fechaInicio: string;
  fechaFin: string;
  estado: 'borrador' | 'revisado' | 'cerrado';
  totalDevengado: number;
  totalDeducciones: number;
  totalNeto: number;
  empleadosCount: number;
  cerradoEl?: string;
  items: PayrollPeriodItem[];
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

export interface CompanySettings {
  nombre: string;
  nit: string;
  email: string;
  telefono: string;
  direccion: string;
  moneda: string;
  salarioMinimo: number;
  auxilioTransporte: number;
  pctSalud: number;
  pctPension: number;
  diasAlertaContrato: number;
}

// ── DEMO DEPARTMENTS ─────────────────────────────────────────────
export const DEMO_DEPARTMENTS: Department[] = [
  {
    id: 'DEP01',
    nombre: 'Tecnología',
    descripcion: 'Desarrollo de software, infraestructura cloud y soporte técnico.',
    responsable: 'Carlos Rodríguez',
    color: '#3b82f6',
  },
  {
    id: 'DEP02',
    nombre: 'Recursos Humanos',
    descripcion: 'Gestión de talento, bienestar laboral, compensación y nómina.',
    responsable: 'Ana Martínez',
    color: '#06b6d4',
  },
  {
    id: 'DEP03',
    nombre: 'Finanzas',
    descripcion: 'Contabilidad, tesorería, planeación financiera y auditoría.',
    responsable: 'Laura Sánchez',
    color: '#10b981',
  },
  {
    id: 'DEP04',
    nombre: 'Ventas',
    descripcion: 'Desarrollo de negocios comerciales, prospección y atención a clientes.',
    responsable: 'Diego Vargas',
    color: '#8b5cf6',
  },
];

// ── DEMO POSITIONS (CARGOS) ───────────────────────────────────────
export const DEMO_POSITIONS: Position[] = [
  {
    id: 'CAR01',
    nombre: 'Desarrollador Senior',
    departamentoId: 'DEP01',
    departamentoNombre: 'Tecnología',
    salarioMin: 4500000,
    salarioMax: 6500000,
    descripcion: 'Arquitectura de aplicaciones web y microservicios.',
  },
  {
    id: 'CAR02',
    nombre: 'Ingeniero DevOps',
    departamentoId: 'DEP01',
    departamentoNombre: 'Tecnología',
    salarioMin: 4200000,
    salarioMax: 5500000,
    descripcion: 'Automatización de pipelines CI/CD y despliegues cloud.',
  },
  {
    id: 'CAR03',
    nombre: 'Diseñador UX/UI',
    departamentoId: 'DEP01',
    departamentoNombre: 'Tecnología',
    salarioMin: 3500000,
    salarioMax: 4800000,
    descripcion: 'Investigación de usuarios, diseño de interfaces y prototipos.',
  },
  {
    id: 'CAR04',
    nombre: 'Analista de Datos',
    departamentoId: 'DEP01',
    departamentoNombre: 'Tecnología',
    salarioMin: 3800000,
    salarioMax: 5000000,
    descripcion: 'Modelado analítico y reportes ejecutivos.',
  },
  {
    id: 'CAR05',
    nombre: 'Directora de RR.HH.',
    departamentoId: 'DEP02',
    departamentoNombre: 'Recursos Humanos',
    salarioMin: 4500000,
    salarioMax: 6000000,
    descripcion: 'Liderazgo estratégico del departamento de personas.',
  },
  {
    id: 'CAR06',
    nombre: 'Especialista en Nómina',
    departamentoId: 'DEP02',
    departamentoNombre: 'Recursos Humanos',
    salarioMin: 2800000,
    salarioMax: 3800000,
    descripcion: 'Liquidación periódica de salarios, prestaciones y novedades.',
  },
  {
    id: 'CAR07',
    nombre: 'Contadora General',
    departamentoId: 'DEP03',
    departamentoNombre: 'Finanzas',
    salarioMin: 3500000,
    salarioMax: 4800000,
    descripcion: 'Balance general, tributación y reportes a entes de control.',
  },
  {
    id: 'CAR08',
    nombre: 'Gerente Comercial',
    departamentoId: 'DEP04',
    departamentoNombre: 'Ventas',
    salarioMin: 5000000,
    salarioMax: 7000000,
    descripcion: 'Estrategia de ventas nacionales y gestión de cuentas corporativas.',
  },
  {
    id: 'CAR09',
    nombre: 'Ejecutivo de Ventas',
    departamentoId: 'DEP04',
    departamentoNombre: 'Ventas',
    salarioMin: 2000000,
    salarioMax: 3200000,
    descripcion: 'Cierre de negocios SaaS y prospección B2B.',
  },
  {
    id: 'CAR10',
    nombre: 'Especialista de Marketing',
    departamentoId: 'DEP04',
    departamentoNombre: 'Ventas',
    salarioMin: 3200000,
    salarioMax: 4500000,
    descripcion: 'Estrategias de adquisición digital y generación de leads.',
  },
];

// ── DEMO EMPLOYEES (10 EMPLOYEES) ─────────────────────────────────
export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    nombre: 'Ana Martínez',
    tipoDocumento: 'CC',
    documento: '1020304050',
    fechaNacimiento: '1988-06-12',
    cargo: 'Directora de RR.HH.',
    departamento: 'Recursos Humanos',
    jefeInmediato: 'Gerencia General',
    fechaIngreso: '2019-03-15',
    salarioBase: 4800000,
    estado: 'activo',
    avatar: 'AM',
    email: 'ana.martinez@neuracloud.co',
    telefono: '+57 311 234 5678',
    direccion: 'Carrera 45 # 102-30, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Javier Martínez', telefono: '+57 312 987 6543', parentesco: 'Hermano' },
    adminInfo: { estadoCivil: 'Casada', eps: 'Sanitas', fondoPension: 'Porvenir', cesantias: 'Porvenir', cajaCompensacion: 'Compensar', banco: 'Bancolombia', tipoCuenta: 'Ahorros', numeroCuenta: '987-123456-01', fechaAfiliacion: '2019-03-15' },
  },
  {
    id: 'EMP002',
    nombre: 'Carlos Rodríguez',
    tipoDocumento: 'CC',
    documento: '1030405060',
    fechaNacimiento: '1992-09-24',
    cargo: 'Desarrollador Senior',
    departamento: 'Tecnología',
    jefeInmediato: 'Director de Tecnología',
    fechaIngreso: '2020-07-01',
    salarioBase: 5200000,
    estado: 'activo',
    avatar: 'CR',
    email: 'carlos.rodriguez@neuracloud.co',
    telefono: '+57 315 456 7890',
    direccion: 'Calle 127 # 19-45, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Mariana Gómez', telefono: '+57 316 789 0123', parentesco: 'Cónyuge' },
    adminInfo: { estadoCivil: 'Unión libre', eps: 'Sura', fondoPension: 'Protección', cesantias: 'Protección', cajaCompensacion: 'Cafam', banco: 'Davivienda', tipoCuenta: 'Ahorros', numeroCuenta: '045-876543-21', fechaAfiliacion: '2020-07-01' },
  },
  {
    id: 'EMP003',
    nombre: 'Laura Sánchez',
    tipoDocumento: 'CC',
    documento: '1040506070',
    fechaNacimiento: '1990-11-03',
    cargo: 'Contadora General',
    departamento: 'Finanzas',
    jefeInmediato: 'Director Financiero',
    fechaIngreso: '2021-01-10',
    salarioBase: 3900000,
    estado: 'activo',
    avatar: 'LS',
    email: 'laura.sanchez@neuracloud.co',
    telefono: '+57 318 678 9012',
    direccion: 'Carrera 7 # 140-12, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Pedro Sánchez', telefono: '+57 314 567 8901', parentesco: 'Padre' },
    adminInfo: { estadoCivil: 'Soltera', eps: 'Sanitas', fondoPension: 'Colfondos', cesantias: 'Colfondos', cajaCompensacion: 'Colsubsidio', banco: 'BBVA', tipoCuenta: 'Ahorros', numeroCuenta: '112-233445-56', fechaAfiliacion: '2021-01-10' },
  },
  {
    id: 'EMP004',
    nombre: 'Miguel Torres',
    tipoDocumento: 'CC',
    documento: '1050607080',
    fechaNacimiento: '1994-04-18',
    cargo: 'Diseñador UX/UI',
    departamento: 'Tecnología',
    jefeInmediato: 'Carlos Rodríguez',
    fechaIngreso: '2021-08-22',
    salarioBase: 4100000,
    estado: 'vacaciones',
    avatar: 'MT',
    email: 'miguel.torres@neuracloud.co',
    telefono: '+57 320 890 1234',
    direccion: 'Transversal 39 # 26-10, Bogotá',
    tipoContrato: 'Término Fijo',
    fechaVencimientoContrato: '2026-12-31',
    contactoEmergencia: { nombre: 'Carla Torres', telefono: '+57 319 012 3456', parentesco: 'Hermana' },
    adminInfo: { estadoCivil: 'Soltero', eps: 'Compensar EPS', fondoPension: 'Porvenir', cesantias: 'Porvenir', cajaCompensacion: 'Compensar', banco: 'Bancolombia', tipoCuenta: 'Corriente', numeroCuenta: '334-556677-88', fechaAfiliacion: '2021-08-22' },
  },
  {
    id: 'EMP005',
    nombre: 'Sofía Herrera',
    tipoDocumento: 'CC',
    documento: '1060708090',
    fechaNacimiento: '1995-12-08',
    cargo: 'Analista de Datos',
    departamento: 'Tecnología',
    jefeInmediato: 'Carlos Rodríguez',
    fechaIngreso: '2022-02-14',
    salarioBase: 4500000,
    estado: 'activo',
    avatar: 'SH',
    email: 'sofia.herrera@neuracloud.co',
    telefono: '+57 301 234 5678',
    direccion: 'Avenida Pepe Sierra # 15-22, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Elena Gómez', telefono: '+57 300 123 4567', parentesco: 'Madre' },
    adminInfo: { estadoCivil: 'Soltera', eps: 'Sura', fondoPension: 'Protección', cesantias: 'Protección', cajaCompensacion: 'Cafam', banco: 'Davivienda', tipoCuenta: 'Ahorros', numeroCuenta: '556-778899-00', fechaAfiliacion: '2022-02-14' },
  },
  {
    id: 'EMP006',
    nombre: 'Diego Vargas',
    tipoDocumento: 'CC',
    documento: '1070809010',
    fechaNacimiento: '1985-03-30',
    cargo: 'Gerente Comercial',
    departamento: 'Ventas',
    jefeInmediato: 'Gerencia General',
    fechaIngreso: '2018-11-05',
    salarioBase: 5800000,
    estado: 'activo',
    avatar: 'DV',
    email: 'diego.vargas@neuracloud.co',
    telefono: '+57 310 987 6543',
    direccion: 'Calle 100 # 8A-55, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Lucía Vargas', telefono: '+57 313 876 5432', parentesco: 'Cónyuge' },
    adminInfo: { estadoCivil: 'Casado', eps: 'Sanitas', fondoPension: 'Porvenir', cesantias: 'Porvenir', cajaCompensacion: 'Compensar', banco: 'Bancolombia', tipoCuenta: 'Ahorros', numeroCuenta: '778-899001-12', fechaAfiliacion: '2018-11-05' },
  },
  {
    id: 'EMP007',
    nombre: 'Valentina Cruz',
    tipoDocumento: 'CC',
    documento: '1080901020',
    fechaNacimiento: '1996-07-15',
    cargo: 'Especialista de Marketing',
    departamento: 'Ventas',
    jefeInmediato: 'Diego Vargas',
    fechaIngreso: '2022-06-30',
    salarioBase: 3600000,
    estado: 'activo',
    avatar: 'VC',
    email: 'valentina.cruz@neuracloud.co',
    telefono: '+57 317 345 6789',
    direccion: 'Carrera 15 # 85-30, Bogotá',
    tipoContrato: 'Término Fijo',
    fechaVencimientoContrato: '2026-11-15', // Expiring soon for alert test
    contactoEmergencia: { nombre: 'Rodrigo Cruz', telefono: '+57 316 234 5678', parentesco: 'Padre' },
    adminInfo: { estadoCivil: 'Soltera', eps: 'Compensar EPS', fondoPension: 'Colfondos', cesantias: 'Colfondos', cajaCompensacion: 'Compensar', banco: 'Itaú', tipoCuenta: 'Ahorros', numeroCuenta: '990-011223-34', fechaAfiliacion: '2022-06-30' },
  },
  {
    id: 'EMP008',
    nombre: 'Andrés Mora',
    tipoDocumento: 'CC',
    documento: '1090102030',
    fechaNacimiento: '1991-01-20',
    cargo: 'Ingeniero DevOps',
    departamento: 'Tecnología',
    jefeInmediato: 'Carlos Rodríguez',
    fechaIngreso: '2023-01-16',
    salarioBase: 4700000,
    estado: 'inactivo',
    avatar: 'AM',
    email: 'andres.mora@neuracloud.co',
    telefono: '+57 302 456 7890',
    direccion: 'Diagonal 45 # 19-80, Bogotá',
    tipoContrato: 'Prestación de Servicios',
    contactoEmergencia: { nombre: 'Beatriz Mora', telefono: '+57 304 567 8901', parentesco: 'Madre' },
    adminInfo: { estadoCivil: 'Soltero', eps: 'Sura', fondoPension: 'Protección', cesantias: 'Protección', cajaCompensacion: 'Cafam', banco: 'Bancolombia', tipoCuenta: 'Ahorros', numeroCuenta: '123-456789-00', fechaAfiliacion: '2023-01-16' },
  },
  {
    id: 'EMP009',
    nombre: 'Camilo Restrepo',
    tipoDocumento: 'CC',
    documento: '1011223344',
    fechaNacimiento: '1997-08-10',
    cargo: 'Ejecutivo de Ventas',
    departamento: 'Ventas',
    jefeInmediato: 'Diego Vargas',
    fechaIngreso: '2024-02-01',
    salarioBase: 2400000,
    estado: 'activo',
    avatar: 'CR',
    email: 'camilo.restrepo@neuracloud.co',
    telefono: '+57 312 654 9870',
    direccion: 'Calle 53 # 21-40, Bogotá',
    tipoContrato: 'Término Fijo',
    fechaVencimientoContrato: '2026-11-05', // Expiring soon for alert test
    contactoEmergencia: { nombre: 'Gloria Restrepo', telefono: '+57 311 876 5432', parentesco: 'Madre' },
    adminInfo: { estadoCivil: 'Soltero', eps: 'Sanitas', fondoPension: 'Porvenir', cesantias: 'Porvenir', cajaCompensacion: 'Compensar', banco: 'Bancolombia', tipoCuenta: 'Ahorros', numeroCuenta: '334-998877-66', fechaAfiliacion: '2024-02-01' },
  },
  {
    id: 'EMP010',
    nombre: 'Mariana Gómez',
    tipoDocumento: 'CC',
    documento: '1022334455',
    fechaNacimiento: '1993-05-14',
    cargo: 'Especialista en Nómina',
    departamento: 'Recursos Humanos',
    jefeInmediato: 'Ana Martínez',
    fechaIngreso: '2024-05-15',
    salarioBase: 3200000,
    estado: 'activo',
    avatar: 'MG',
    email: 'mariana.gomez@neuracloud.co',
    telefono: '+57 314 321 0987',
    direccion: 'Carrera 68 # 80-15, Bogotá',
    tipoContrato: 'Término Indefinido',
    contactoEmergencia: { nombre: 'Esteban Gómez', telefono: '+57 315 210 9876', parentesco: 'Hermano' },
    adminInfo: { estadoCivil: 'Soltera', eps: 'Sura', fondoPension: 'Protección', cesantias: 'Protección', cajaCompensacion: 'Colsubsidio', banco: 'Davivienda', tipoCuenta: 'Ahorros', numeroCuenta: '556-112233-44', fechaAfiliacion: '2024-05-15' },
  },
];

// ── DEMO CONTRACTS (10 CONTRACTS) ─────────────────────────────────
export const DEMO_CONTRACTS: Contract[] = [
  {
    id: 'CTR001',
    empleadoId: 'EMP001',
    empleadoNombre: 'Ana Martínez',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2019-03-15',
    salario: 4800000,
    cargo: 'Directora de RR.HH.',
    departamento: 'Recursos Humanos',
    estado: 'activo',
    observaciones: 'Contrato a término indefinido con cláusula de confidencialidad y dedicación exclusiva.',
  },
  {
    id: 'CTR002',
    empleadoId: 'EMP002',
    empleadoNombre: 'Carlos Rodríguez',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2020-07-01',
    salario: 5200000,
    cargo: 'Desarrollador Senior',
    departamento: 'Tecnología',
    estado: 'activo',
    observaciones: 'Modalidad de trabajo remoto 100% y cláusula de propiedad intelectual sobre desarrollos.',
  },
  {
    id: 'CTR003',
    empleadoId: 'EMP003',
    empleadoNombre: 'Laura Sánchez',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2021-01-10',
    salario: 3900000,
    cargo: 'Contadora General',
    departamento: 'Finanzas',
    estado: 'activo',
    observaciones: 'Pacto de reserva profesional y manejo de información contable sensible.',
  },
  {
    id: 'CTR004',
    empleadoId: 'EMP004',
    empleadoNombre: 'Miguel Torres',
    tipoContrato: 'Término Fijo',
    fechaInicio: '2025-01-01',
    fechaFin: '2026-12-31',
    salario: 4100000,
    cargo: 'Diseñador UX/UI',
    departamento: 'Tecnología',
    estado: 'activo',
    observaciones: 'Contrato a 24 meses renovable por común acuerdo.',
  },
  {
    id: 'CTR005',
    empleadoId: 'EMP005',
    empleadoNombre: 'Sofía Herrera',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2022-02-14',
    salario: 4500000,
    cargo: 'Analista de Datos',
    departamento: 'Tecnología',
    estado: 'activo',
    observaciones: 'Acuerdo de no competencia y confidencialidad de algoritmos y métricas internas.',
  },
  {
    id: 'CTR006',
    empleadoId: 'EMP006',
    empleadoNombre: 'Diego Vargas',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2018-11-05',
    salario: 5800000,
    cargo: 'Gerente Comercial',
    departamento: 'Ventas',
    estado: 'activo',
    observaciones: 'Incluye esquema variable por cumplimiento de metas trimestrales de ventas.',
  },
  {
    id: 'CTR007',
    empleadoId: 'EMP007',
    empleadoNombre: 'Valentina Cruz',
    tipoContrato: 'Término Fijo',
    fechaInicio: '2025-11-15',
    fechaFin: '2026-11-15', // Vence pronto
    salario: 3600000,
    cargo: 'Especialista de Marketing',
    departamento: 'Ventas',
    estado: 'por_vencer',
    observaciones: 'Próximo a vencer en 30 días. En evaluación para renovación a término indefinido.',
  },
  {
    id: 'CTR008',
    empleadoId: 'EMP008',
    empleadoNombre: 'Andrés Mora',
    tipoContrato: 'Prestación de Servicios',
    fechaInicio: '2023-01-16',
    fechaFin: '2024-01-15',
    salario: 4700000,
    cargo: 'Ingeniero DevOps',
    departamento: 'Tecnología',
    estado: 'terminado',
    observaciones: 'Contrato finalizado por culminación del objeto contractual.',
  },
  {
    id: 'CTR009',
    empleadoId: 'EMP009',
    empleadoNombre: 'Camilo Restrepo',
    tipoContrato: 'Término Fijo',
    fechaInicio: '2026-05-05',
    fechaFin: '2026-11-05', // Vence pronto
    salario: 2400000,
    cargo: 'Ejecutivo de Ventas',
    departamento: 'Ventas',
    estado: 'por_vencer',
    observaciones: 'Periodo de prueba superado. Requiere preaviso de renovación o no prórroga antes del 20 de Oct.',
  },
  {
    id: 'CTR010',
    empleadoId: 'EMP010',
    empleadoNombre: 'Mariana Gómez',
    tipoContrato: 'Término Indefinido',
    fechaInicio: '2024-05-15',
    salario: 3200000,
    cargo: 'Especialista en Nómina',
    departamento: 'Recursos Humanos',
    estado: 'activo',
    observaciones: 'Contrato a término indefinido con período de prueba legal cumplido satisfactoriamente.',
  },
];

// ── DEMO NOVEDADES / ABSENCES (8 NOVEDADES) ───────────────────────
export const DEMO_ABSENCES: Absence[] = [
  {
    id: 'NOV001',
    empleadoId: 'EMP004',
    nombre: 'Miguel Torres',
    tipo: 'vacaciones',
    subtipo: 'Vacaciones individuales',
    fechaInicio: '2026-10-07',
    fechaFin: '2026-10-18',
    dias: 10,
    estado: 'aprobado',
    motivo: 'Vacaciones anuales correspondientes al período legal 2024-2025.',
    fechaRegistro: '2026-09-25',
    afectaNomina: true,
  },
  {
    id: 'NOV002',
    empleadoId: 'EMP003',
    nombre: 'Laura Sánchez',
    tipo: 'incapacidad',
    subtipo: 'Enfermedad general - EPS',
    fechaInicio: '2026-10-12',
    fechaFin: '2026-10-16',
    dias: 4,
    estado: 'aprobado',
    motivo: 'Cuadro viral respiratorio certificado por EPS Sanitas.',
    fechaRegistro: '2026-10-12',
    afectaNomina: true,
  },
  {
    id: 'NOV003',
    empleadoId: 'EMP007',
    nombre: 'Valentina Cruz',
    tipo: 'permiso',
    subtipo: 'Permiso remunerado',
    fechaInicio: '2026-10-14',
    fechaFin: '2026-10-14',
    dias: 1,
    estado: 'pendiente',
    motivo: 'Cita médica especializada y exámenes diagnósticos.',
    fechaRegistro: '2026-10-10',
    afectaNomina: false,
  },
  {
    id: 'NOV004',
    empleadoId: 'EMP001',
    nombre: 'Ana Martínez',
    tipo: 'incapacidad',
    subtipo: 'Accidente de trabajo - ARL',
    fechaInicio: '2026-09-20',
    fechaFin: '2026-09-25',
    dias: 5,
    estado: 'aprobado',
    motivo: 'Esguince de tobillo en desplazamiento laboral certificado por ARL Positiva.',
    fechaRegistro: '2026-09-20',
    afectaNomina: true,
  },
  {
    id: 'NOV005',
    empleadoId: 'EMP005',
    nombre: 'Sofía Herrera',
    tipo: 'ausencia',
    subtipo: 'Ausencia no justificada',
    fechaInicio: '2026-10-10',
    fechaFin: '2026-10-10',
    dias: 1,
    estado: 'rechazado',
    motivo: 'Ausencia laboral sin soporte ni aviso previo. En trámite de descargos.',
    fechaRegistro: '2026-10-10',
    afectaNomina: true,
  },
  {
    id: 'NOV006',
    empleadoId: 'EMP002',
    nombre: 'Carlos Rodríguez',
    tipo: 'permiso',
    subtipo: 'Permiso remunerado',
    fechaInicio: '2026-10-20',
    fechaFin: '2026-10-21',
    dias: 2,
    estado: 'pendiente',
    motivo: 'Calamidad doméstica por reparación urgente de inmueble familiar.',
    fechaRegistro: '2026-10-14',
    afectaNomina: false,
  },
  {
    id: 'NOV007',
    empleadoId: 'EMP009',
    nombre: 'Camilo Restrepo',
    tipo: 'horas_extras',
    subtipo: 'Horas extras diurnas y festivas',
    fechaInicio: '2026-10-15',
    fechaFin: '2026-10-15',
    dias: 1,
    horas: 8,
    valorEconomico: 120000,
    estado: 'aprobado',
    motivo: 'Acompañamiento a stand corporativo en feria comercial de fin de semana.',
    fechaRegistro: '2026-10-16',
    afectaNomina: true,
  },
  {
    id: 'NOV008',
    empleadoId: 'EMP006',
    nombre: 'Diego Vargas',
    tipo: 'bonificacion',
    subtipo: 'Bonificación comercial no constitutiva de salario',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-31',
    dias: 30,
    valorEconomico: 650000,
    estado: 'aprobado',
    motivo: 'Cumplimiento extraordinario de meta de prospección comercial en Q3.',
    fechaRegistro: '2026-10-02',
    afectaNomina: true,
  },
];

// ── DEMO COMPANY SETTINGS ─────────────────────────────────────────
export const DEMO_COMPANY_SETTINGS: CompanySettings = {
  nombre: 'NeuraCloud HR Technologies S.A.S.',
  nit: '901.458.789-1',
  email: 'contacto@neuracloud.co',
  telefono: '+57 (601) 745-8900',
  direccion: 'Calle 93B # 13-45, Oficina 502, Bogotá, Colombia',
  moneda: 'COP',
  salarioMinimo: 1300000,
  auxilioTransporte: 162000,
  pctSalud: 4.0,
  pctPension: 4.0,
  diasAlertaContrato: 30,
};

// ── DEMO PAYROLL PERIODS ─────────────────────────────────────────
export const DEMO_PAYROLL_PERIODS: PayrollPeriod[] = [
  {
    id: 'PER202609',
    nombre: 'Septiembre 2026',
    codigo: '2026-09',
    fechaInicio: '2026-09-01',
    fechaFin: '2026-09-30',
    estado: 'cerrado',
    totalDevengado: 38400000,
    totalDeducciones: 3072000,
    totalNeto: 35328000,
    empleadosCount: 9,
    cerradoEl: '2026-09-30T17:00:00Z',
    items: [
      {
        id: 'PAY0901',
        periodoId: 'PER202609',
        empleadoId: 'EMP001',
        nombre: 'Ana Martínez',
        cargo: 'Directora de RR.HH.',
        departamento: 'Recursos Humanos',
        diasLiquidados: 30,
        salarioBase: 4800000,
        salarioProporcional: 4800000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 4800000,
        salud: 192000,
        pension: 192000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 384000,
        neto: 4416000,
        estado: 'pagada',
      },
      {
        id: 'PAY0902',
        periodoId: 'PER202609',
        empleadoId: 'EMP002',
        nombre: 'Carlos Rodríguez',
        cargo: 'Desarrollador Senior',
        departamento: 'Tecnología',
        diasLiquidados: 30,
        salarioBase: 5200000,
        salarioProporcional: 5200000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 5200000,
        salud: 208000,
        pension: 208000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 416000,
        neto: 4784000,
        estado: 'pagada',
      },
    ],
  },
  {
    id: 'PER202610',
    nombre: 'Octubre 2026',
    codigo: '2026-10',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-10-31',
    estado: 'revisado',
    totalDevengado: 38782000,
    totalDeducciones: 2984000,
    totalNeto: 35798000,
    empleadosCount: 9,
    items: [
      {
        id: 'PAY1001',
        periodoId: 'PER202610',
        empleadoId: 'EMP001',
        nombre: 'Ana Martínez',
        cargo: 'Directora de RR.HH.',
        departamento: 'Recursos Humanos',
        diasLiquidados: 30,
        salarioBase: 4800000,
        salarioProporcional: 4800000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 250000,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 5050000,
        salud: 192000,
        pension: 192000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 384000,
        neto: 4666000,
        estado: 'procesada',
      },
      {
        id: 'PAY1002',
        periodoId: 'PER202610',
        empleadoId: 'EMP002',
        nombre: 'Carlos Rodríguez',
        cargo: 'Desarrollador Senior',
        departamento: 'Tecnología',
        diasLiquidados: 30,
        salarioBase: 5200000,
        salarioProporcional: 5200000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 300000,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 5500000,
        salud: 208000,
        pension: 208000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 416000,
        neto: 5084000,
        estado: 'procesada',
      },
      {
        id: 'PAY1003',
        periodoId: 'PER202610',
        empleadoId: 'EMP003',
        nombre: 'Laura Sánchez',
        cargo: 'Contadora General',
        departamento: 'Finanzas',
        diasLiquidados: 30,
        salarioBase: 3900000,
        salarioProporcional: 3900000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 3900000,
        salud: 156000,
        pension: 156000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 312000,
        neto: 3588000,
        estado: 'procesada',
      },
      {
        id: 'PAY1004',
        periodoId: 'PER202610',
        empleadoId: 'EMP004',
        nombre: 'Miguel Torres',
        cargo: 'Diseñador UX/UI',
        departamento: 'Tecnología',
        diasLiquidados: 30,
        salarioBase: 4100000,
        salarioProporcional: 4100000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 4100000,
        salud: 164000,
        pension: 164000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 328000,
        neto: 3772000,
        estado: 'pendiente',
        novedadesAplicadas: ['NOV001'],
      },
      {
        id: 'PAY1005',
        periodoId: 'PER202610',
        empleadoId: 'EMP005',
        nombre: 'Sofía Herrera',
        cargo: 'Analista de Datos',
        departamento: 'Tecnología',
        diasLiquidados: 30,
        salarioBase: 4500000,
        salarioProporcional: 4500000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 200000,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 4700000,
        salud: 180000,
        pension: 180000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 360000,
        neto: 4340000,
        estado: 'procesada',
      },
      {
        id: 'PAY1006',
        periodoId: 'PER202610',
        empleadoId: 'EMP006',
        nombre: 'Diego Vargas',
        cargo: 'Gerente Comercial',
        departamento: 'Ventas',
        diasLiquidados: 30,
        salarioBase: 5800000,
        salarioProporcional: 5800000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 650000,
        comisiones: 350000,
        otrosDevengos: 0,
        totalDevengado: 6800000,
        salud: 232000,
        pension: 232000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 464000,
        neto: 6336000,
        estado: 'procesada',
        novedadesAplicadas: ['NOV008'],
      },
      {
        id: 'PAY1007',
        periodoId: 'PER202610',
        empleadoId: 'EMP007',
        nombre: 'Valentina Cruz',
        cargo: 'Especialista de Marketing',
        departamento: 'Ventas',
        diasLiquidados: 30,
        salarioBase: 3600000,
        salarioProporcional: 3600000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 150000,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 3750000,
        salud: 144000,
        pension: 144000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 288000,
        neto: 3462000,
        estado: 'pendiente',
      },
      {
        id: 'PAY1008',
        periodoId: 'PER202610',
        empleadoId: 'EMP009',
        nombre: 'Camilo Restrepo',
        cargo: 'Ejecutivo de Ventas',
        departamento: 'Ventas',
        diasLiquidados: 30,
        salarioBase: 2400000,
        salarioProporcional: 2400000,
        auxilioTransporte: 162000, // <= 2 minimum wages
        horasExtras: 120000,
        bonificaciones: 0,
        comisiones: 180000,
        otrosDevengos: 0,
        totalDevengado: 2862000,
        salud: 96000,
        pension: 96000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 192000,
        neto: 2670000,
        estado: 'procesada',
        novedadesAplicadas: ['NOV007'],
      },
      {
        id: 'PAY1009',
        periodoId: 'PER202610',
        empleadoId: 'EMP010',
        nombre: 'Mariana Gómez',
        cargo: 'Especialista en Nómina',
        departamento: 'Recursos Humanos',
        diasLiquidados: 30,
        salarioBase: 3200000,
        salarioProporcional: 3200000,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        comisiones: 0,
        otrosDevengos: 0,
        totalDevengado: 3200000,
        salud: 128000,
        pension: 128000,
        anticipos: 0,
        otrasDeducciones: 0,
        totalDeducciones: 256000,
        neto: 2944000,
        estado: 'procesada',
      },
    ],
  },
];

// Flat payroll records representation for backwards compatibility
export const DEMO_PAYROLL: PayrollRecord[] = DEMO_PAYROLL_PERIODS[1].items.map(item => ({
  id: item.id,
  empleadoId: item.empleadoId,
  nombre: item.nombre,
  periodo: 'Oct 2026',
  salarioBase: item.salarioBase,
  bonificaciones: item.bonificaciones + item.horasExtras + item.comisiones + item.auxilioTransporte,
  deducciones: item.totalDeducciones,
  neto: item.neto,
  estado: item.estado,
}));

export const DASHBOARD_STATS = {
  totalEmpleados: 10,
  empleadosActivos: 8,
  empleadosVacaciones: 1,
  empleadosInactivos: 1,
  nominaMensual: 35798000,
  nominaAnterior: 35328000,
  ausenciasActivas: 3,
  incapacidadesActivas: 2,
};

export const PAYROLL_MONTHLY = [
  { mes: 'May', total: 32500000 },
  { mes: 'Jun', total: 33100000 },
  { mes: 'Jul', total: 33900000 },
  { mes: 'Ago', total: 34200000 },
  { mes: 'Sep', total: 35328000 },
  { mes: 'Oct', total: 35798000 },
];

export const DEPT_DISTRIBUTION = [
  { name: 'Tecnología', value: 4, color: '#3b82f6' },
  { name: 'Ventas', value: 3, color: '#8b5cf6' },
  { name: 'Recursos Humanos', value: 2, color: '#06b6d4' },
  { name: 'Finanzas', value: 1, color: '#10b981' },
];
