import { Board, User, Label, Team, UserRole, TeamPrivacy } from './types';

// Represents the global pool of users in the system that can be invited to teams.
export const INITIAL_USERS: User[] = [
  { 
    id: 'user-1', 
    name: 'Juan Esteban Uribe (Project Manager)', 
    avatar: 'https://picsum.photos/id/1011/32/32', 
    profileSummary: 'Project Manager. Responsable de coordinar el equipo, definir roadmap, dar seguimiento a tareas y asegurar cumplimiento de plazos. Especialización: Gestión de proyectos ágiles. Keywords: Estrategia, Organización, Coordinación.',
    isSystemAdmin: true,
  },
  { 
    id: 'user-2', 
    name: 'Andrés Cárdenas (UX/UI Designer)', 
    avatar: 'https://picsum.photos/id/1012/32/32', 
    profileSummary: 'UX/UI Designer. Responsable de diseñar wireframes, prototipos y experiencia de usuario intuitiva. Especialización: Figma, Design Systems. Keywords: Diseño, UX, UI.' 
  },
  { 
    id: 'user-3', 
    name: 'Valentina Ríos (Frontend Developer)', 
    avatar: 'https://picsum.photos/id/1013/32/32', 
    profileSummary: 'Frontend Developer. Responsable de construir interfaces interactivas con React y Tailwind. Especialización: JavaScript, React, TypeScript. Keywords: Desarrollo, Frontend, UI.' 
  },
  { 
    id: 'user-4', 
    name: 'Santiago Pérez (Backend Developer)', 
    avatar: 'https://picsum.photos/id/1014/32/32', 
    profileSummary: 'Backend Developer. Responsable de diseñar APIs escalables, manejar bases de datos y lógica del servidor. Especialización: Node.js, Python, PostgreSQL. Keywords: Desarrollo, Backend, API.' 
  },
  { 
    id: 'user-5', 
    name: 'Camilo Torres (DevOps Engineer)', 
    avatar: 'https://picsum.photos/id/1015/32/32', 
    profileSummary: 'DevOps Engineer. Responsable de configurar CI/CD, manejar despliegues y garantizar infraestructura en la nube. Especialización: AWS, Docker, Kubernetes. Keywords: Infraestructura, Automatización, DevOps.' 
  },
  { 
    id: 'user-6', 
    name: 'Mariana López (QA Engineer)', 
    avatar: 'https://picsum.photos/id/1016/32/32', 
    profileSummary: 'QA Engineer. Responsable de diseñar e implementar pruebas automáticas y manuales, garantizar la calidad del software. Especialización: Cypress, Selenium, Jest. Keywords: QA, Testing, Calidad.' 
  },
  { 
    id: 'user-7', 
    name: 'Felipe Ramírez (Data Scientist)', 
    avatar: 'https://picsum.photos/id/1018/32/32', 
    profileSummary: 'Data Scientist. Responsable de definir métricas de uso, analizar datos de usuarios y proponer mejoras basadas en evidencia. Especialización: Python, Pandas, Machine Learning. Keywords: Datos, Analítica, IA.' 
  },
  { 
    id: 'user-8', 
    name: 'Natalia Herrera (Market Strategy Analyst)', 
    avatar: 'https://picsum.photos/id/1019/32/32', 
    profileSummary: 'Market Strategy Analyst. Responsable de realizar estudios de mercado, definir pricing y estrategias de lanzamiento. Especialización: Investigación de mercado, Competencia, SaaS Strategy. Keywords: Estrategia, Mercado, Negocios.' 
  },
  { 
    id: 'user-9', 
    name: 'Julián Suárez (Technical Writer)', 
    avatar: 'https://picsum.photos/id/1020/32/32', 
    profileSummary: 'Technical Writer. Responsable de crear documentación clara para desarrolladores y usuarios finales. Especialización: Markdown, Docusaurus, Documentación API. Keywords: Documentación, Comunicación, Soporte.' 
  }
];

// Labels Data - updated to the new design system
export const LABELS: { [key: string]: Label } = {
  CRITICAL: { id: 'lab-1', text: 'Crítico', color: 'bg-danger-light text-danger-text' },
  HIGH: { id: 'lab-2', text: 'Prioridad Alta', color: 'bg-warning-light text-warning-text' },
  MEDIUM: { id: 'lab-3', text: 'Prioridad Media', color: 'bg-info-light text-info-text' },
  LOW: { id: 'lab-4', text: 'Prioridad Baja', color: 'bg-gray-light text-gray-text' },
  BACKEND: { id: 'lab-5', text: 'Backend', color: 'bg-gray-light text-gray-text' },
  FRONTEND: { id: 'lab-6', text: 'Frontend', color: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  UI_UX: { id: 'lab-7', text: 'UI/UX', color: 'bg-accent-light text-accent-text' },
  BUG: { id: 'lab-8', text: 'Bug', color: 'bg-danger-light text-danger-text' },
  FEATURE: { id: 'lab-9', text: 'Feature', color: 'bg-secondary-light text-secondary-text' },
  QUESTION: { id: 'lab-10', text: 'Pregunta', color: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
  QA: { id: 'lab-11', text: 'QA', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' },
  DOCS: { id: 'lab-12', text: 'Documentación', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' },
  EPIC: { id: 'lab-13', text: 'Epic', color: 'bg-accent-light text-accent-text' },
  FUTURE: { id: 'lab-14', text: 'Futuro', color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  BLOG: { id: 'lab-15', text: 'Blog', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  TIKTOK: { id: 'lab-16', text: 'TikTok', color: 'bg-black text-white dark:bg-gray-200 dark:text-black' },
  REELS: { id: 'lab-17', text: 'Reels', color: 'bg-pink-200 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' },
  NEWSLETTER: { id: 'lab-18', text: 'Newsletter', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
  LEAD: { id: 'lab-19', text: 'Lead', color: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'},
  NEGOTIATION: { id: 'lab-20', text: 'Negociación', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'},
  WON: { id: 'lab-21', text: 'Ganado', color: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300'},
  LOST: { id: 'lab-22', text: 'Perdido', color: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300'},
  STRATEGY: { id: 'lab-23', text: 'Estrategia', color: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
};

// Team Color Utility
const TEAM_COLORS = [
  'from-blue-500 to-sky-400',
  'from-green-500 to-emerald-400',
  'from-purple-500 to-violet-400',
  'from-red-500 to-rose-400',
  'from-amber-500 to-yellow-400',
  'from-indigo-500 to-cyan-400',
  'from-pink-500 to-fuchsia-400',
];

export const getTeamColor = (teamId: string): string => {
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash % TEAM_COLORS.length);
  return TEAM_COLORS[index];
};

// Initial data is now structured around teams.
export const initialTeamsData: Team[] = [
  {
    id: 'team-1',
    name: 'Equipo de Desarrollo Kortex',
    privacy: TeamPrivacy.Public,
    members: [
      { userId: 'user-1', role: UserRole.Admin },   // Juan Esteban Uribe (PM)
      { userId: 'user-2', role: UserRole.Member },  // Andrés Cárdenas (Designer)
      { userId: 'user-3', role: UserRole.Member },  // Valentina Ríos (Frontend)
      { userId: 'user-4', role: UserRole.Member },  // Santiago Pérez (Backend)
      { userId: 'user-5', role: UserRole.Member },  // Camilo Torres (DevOps)
      { userId: 'user-6', role: UserRole.Member },  // Mariana López (QA)
    ],
    boards: [
      {
        id: 'board-1',
        teamId: 'team-1',
        title: "Co-Gestión: App de Gastos y Tareas del Hogar",
        lists: [
          {
            id: 'list-1',
            title: '📝 Product Backlog',
            cards: [
              {
                id: 'card-1-1',
                title: 'HU-01: Como usuario, quiero registrar un gasto y dividirlo entre miembros del hogar.',
                description: 'Permitir a los usuarios registrar desembolsos, especificar participantes, adjuntar recibos y calcular deudas.',
                labels: [LABELS.FEATURE, LABELS.HIGH],
                members: [],
              },
              {
                id: 'card-1-2',
                title: 'HU-02: Como usuario, quiero crear tareas domésticas (puntuales o recurrentes) y asignarlas.',
                description: 'Permitir la creación, asignación (manual o rotativa), seguimiento y notificación de las tareas del hogar.',
                labels: [LABELS.FEATURE, LABELS.HIGH],
                members: [],
              },
               {
                id: 'card-1-3',
                title: 'HU-03: Como usuario, quiero ver un dashboard con mi saldo y mis tareas pendientes.',
                description: 'Ofrecer una visión clara y resumida del estado financiero del grupo y el calendario de tareas.',
                labels: [LABELS.FEATURE, LABELS.MEDIUM],
                members: [],
              },
              {
                id: 'card-1-4',
                title: 'HU-04: Como usuario, quiero recibir notificaciones sobre nuevos gastos y tareas.',
                description: 'Implementar alertas en tiempo real para mantener a los usuarios informados.',
                labels: [LABELS.FEATURE, LABELS.MEDIUM],
                members: [],
              },
              {
                id: 'card-1-5',
                title: 'EPIC-01: Sistema de Autenticación y Gestión de Grupos (Hogares).',
                description: 'Desarrollar el registro de usuarios, inicio de sesión y la capacidad de crear/unirse a grupos de convivencia.',
                labels: [LABELS.EPIC, LABELS.CRITICAL],
                members: [],
              },
            ],
          },
          {
            id: 'list-2',
            title: '🎨 Diseño UI/UX',
            cards: [
              {
                id: 'card-2-1',
                title: 'DSN-01: Diseñar wireframes y flujo de usuario para el registro de gastos.',
                labels: [LABELS.UI_UX],
                members: [INITIAL_USERS[1]], // Andrés Cárdenas
              },
              {
                id: 'card-2-2',
                title: 'DSN-02: Diseñar la interfaz del módulo de gestión de tareas.',
                labels: [LABELS.UI_UX],
                members: [INITIAL_USERS[1]], // Andrés Cárdenas
              },
              {
                id: 'card-2-3',
                title: 'DSN-03: Crear prototipo interactivo en Figma del dashboard principal.',
                labels: [LABELS.UI_UX],
                members: [INITIAL_USERS[1]], // Andrés Cárdenas
              },
            ],
          },
          {
            id: 'list-3',
            title: '📋 Sprint Backlog',
            cards: [
              {
                id: 'card-3-1',
                title: 'TSK-PM-01: Definir y priorizar historias de usuario para el MVP.',
                description: 'Detallar los criterios de aceptación para las funcionalidades clave del primer lanzamiento.',
                labels: [LABELS.DOCS],
                members: [INITIAL_USERS[0]], // Juan Esteban Uribe
              },
              {
                id: 'card-3-2',
                title: 'TSK-ARC-01: Diseñar la arquitectura del software (Cliente-Servidor, API RESTful).',
                description: 'Definir la estructura del backend, base de datos y la comunicación con el frontend.',
                labels: [LABELS.BACKEND, LABELS.DOCS],
                members: [INITIAL_USERS[3], INITIAL_USERS[4]], // Santiago Pérez, Camilo Torres
              },
            ],
          },
          {
            id: 'list-4',
            title: '➡️ Por Hacer (Sprint 1)',
            cards: [
              {
                id: 'card-4-1',
                title: 'TSK-BE-01: Configurar el backend (Node.js/Express) y la base de datos (PostgreSQL).',
                labels: [LABELS.BACKEND, LABELS.HIGH],
                members: [INITIAL_USERS[3]], // Santiago Pérez
                checklist: {
                  title: 'Criterios de Aceptación',
                  items: [
                    { id: 'chk-4-1-1', text: 'Proyecto Node.js inicializado.', completed: false },
                    { id: 'chk-4-1-2', text: 'Conexión a la base de datos PostgreSQL establecida.', completed: false },
                    { id: 'chk-4-1-3', text: 'Estructura de carpetas definida.', completed: false },
                  ],
                },
              },
              {
                id: 'card-4-2',
                title: 'TSK-BE-02: Implementar endpoints de API para autenticación de usuarios (registro/login).',
                labels: [LABELS.BACKEND, LABELS.CRITICAL],
                members: [INITIAL_USERS[3]], // Santiago Pérez
              },
              {
                id: 'card-4-3',
                title: 'TSK-FE-01: Estructurar el proyecto Frontend e implementar la navegación básica.',
                labels: [LABELS.FRONTEND, LABELS.HIGH],
                members: [INITIAL_USERS[2]], // Valentina Ríos
              },
              {
                id: 'card-4-4',
                title: 'TSK-FE-02: Desarrollar la UI para el registro de usuarios y el login.',
                labels: [LABELS.FRONTEND, LABELS.CRITICAL],
                members: [INITIAL_USERS[2]], // Valentina Ríos
              },
              {
                id: 'card-4-5',
                title: 'TSK-QA-01: Preparar el entorno de pruebas y la estrategia de QA para el MVP.',
                labels: [LABELS.QA],
                members: [INITIAL_USERS[5]], // Mariana López
              },
            ],
          },
          {
            id: 'list-5',
            title: '⚙️ En Proceso',
            cards: [],
          },
          {
            id: 'list-6',
            title: '✅ Hecho',
            cards: [],
          },
        ]
      },
    ],
    activityLog: [],
  },
];