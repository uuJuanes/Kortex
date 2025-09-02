


import { BoardTemplate } from '../types';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { UsersGroupIcon } from '../components/icons/UsersGroupIcon';
import { LightBulbIcon } from '../components/icons/LightBulbIcon';
import { CodeBracketIcon } from '../components/icons/CodeBracketIcon';
import { DocumentDuplicateIcon } from '../components/icons/DocumentDuplicateIcon';

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'template-blank',
    name: 'Tablero en Blanco',
    description: 'Empieza desde cero con un tablero Kanban simple: Por Hacer, En Progreso y Hecho.',
    icon: DocumentDuplicateIcon,
    category: 'Personal',
    board: {
      title: 'Nuevo Tablero',
      lists: [
        { title: 'Por Hacer', cards: [] },
        { title: 'En Progreso', cards: [] },
        { title: 'Hecho', cards: [] },
      ],
    },
  },
  {
    id: 'template-dev-advanced',
    name: 'Desarrollo de Software Avanzado',
    description: 'Flujo de trabajo robusto para equipos de desarrollo, con revisión de código, QA y despliegue.',
    icon: CodeBracketIcon,
    category: 'Software',
    variables: [
      { key: 'projectName', label: 'Nombre del Proyecto', placeholder: 'Ej: App de Gastos del Hogar', type: 'text' },
      { key: 'platform', label: 'Plataforma Principal', placeholder: 'Ej: Aplicación Web (React)', type: 'text' },
      { key: 'mainGoal', label: 'Objetivo Principal', placeholder: 'Ej: Lanzar el sistema de autenticación de usuarios y gestión de tareas del hogar.', type: 'textarea' },
    ],
    board: {
      title: 'Proyecto de Software',
      lists: [
        {
          title: 'Product Backlog',
          cards: [
            { title: 'EPIC-01: Sistema de Autenticación de Usuarios', description: 'Incluye registro, inicio de sesión, y recuperación de contraseña.', labels: ['EPIC', 'CRITICAL'] },
            { title: 'HU-01: Como usuario, quiero poder registrarme con mi correo y contraseña.', labels: ['FEATURE', 'HIGH'] },
            { title: 'HU-02: Como usuario, quiero ver un dashboard principal con métricas clave.', labels: ['FEATURE', 'HIGH'] },
          ],
        },
        {
          title: 'Sprint Backlog',
          cards: [
             { title: 'TSK-PM-01: Planificar historias de usuario para el Sprint 1.', labels: ['STRATEGY'] },
          ],
        },
        {
          title: 'Por Hacer',
          cards: [
            { title: 'TSK-BE-01: Diseñar el esquema de la base de datos para usuarios.', labels: ['BACKEND', 'HIGH'] },
            { title: 'TSK-FE-01: Configurar el entorno de desarrollo frontend (React + Vite).', labels: ['FRONTEND', 'HIGH'] },
            { title: 'BUG-01: El logo no se muestra correctamente en Safari.', labels: ['BUG', 'MEDIUM'] },
          ],
        },
        { title: 'En Progreso', cards: [] },
        { title: 'Revisión de Código (PR)', cards: [] },
        { title: 'Testing (QA)', cards: [] },
        { title: 'Listo para Desplegar', cards: [] },
        {
          title: 'Hecho',
          cards: [
              { title: 'TSK-DEVOPS-01: Configurar pipeline de CI/CD inicial', labels: ['DOCS'], checklist: { title: 'Definition of Done', items: [{ text: 'El pipeline se ejecuta en cada push a `main`' }, { text: 'Las pruebas unitarias corren automáticamente' }, { text: 'Se notifica el resultado en Slack' }]}}
          ],
        },
      ],
    },
  },
  {
    id: 'template-agile',
    name: 'Gestión de Proyectos Ágil',
    description: 'Ideal para equipos de software, marketing o diseño que siguen un flujo de trabajo Kanban.',
    icon: ClipboardListIcon,
    category: 'Software',
    board: {
      title: 'Proyecto Ágil',
      lists: [
        {
          title: 'Backlog',
          cards: [
            { title: 'Definir alcance del MVP', description: 'Listar las funcionalidades mínimas viables para el primer lanzamiento.', labels: ['STRATEGY', 'HIGH'] },
            { title: 'Reunión de kickoff del proyecto', description: 'Alinear al equipo sobre los objetivos y el plan de trabajo.', labels: ['STRATEGY'] },
            { title: 'Investigación de mercado y competidores', labels: ['STRATEGY', 'MEDIUM'] },
          ],
        },
        {
          title: 'En progreso',
          cards: [],
        },
        {
          title: 'En revisión',
          cards: [],
        },
        {
          title: 'Hecho',
          cards: [
            { title: 'Configurar el repositorio de código', labels: ['FEATURE'] },
          ],
        },
      ],
    },
  },
  {
    id: 'template-roadmap',
    name: 'Roadmap de Producto',
    description: 'Da una visión clara de la evolución del producto y los próximos lanzamientos.',
    icon: TrendingUpIcon,
    category: 'Product',
    board: {
      title: 'Roadmap de Producto',
      lists: [
        {
          title: 'Ideas / Q-Next',
          cards: [
            { title: 'Integración con herramienta de calendario', labels: ['FEATURE', 'FUTURE'] },
            { title: 'Modo oscuro para la aplicación', labels: ['UI_UX', 'FUTURE'] },
          ],
        },
        {
          title: 'Priorizado / Q1',
          cards: [
            { title: 'Nuevo sistema de notificaciones', labels: ['FEATURE', 'HIGH'] },
            { title: 'Mejorar el rendimiento de la carga inicial', labels: ['BACKEND', 'HIGH'] },
          ],
        },
        {
          title: 'En desarrollo',
          cards: [
            { title: 'Rediseño de la página de perfil de usuario', labels: ['UI_UX', 'HIGH'] },
          ],
        },
        {
          title: 'Lanzado',
          cards: [],
        },
      ],
    },
  },
    {
    id: 'template-sprint',
    name: 'Sprint Planning (Scrum)',
    description: 'Perfecto para equipos técnicos que trabajan en sprints de 1-2 semanas.',
    icon: SparklesIcon,
    category: 'Software',
    board: {
      title: 'Sprint X - [Nombre del Sprint]',
      lists: [
        {
          title: 'To Do Sprint X',
          cards: [
            { title: 'BUG-01: Arreglar error de login con emails en mayúsculas', labels: ['BUG', 'CRITICAL'] },
            { title: 'FEAT-01: Implementar botón de "Exportar a PDF"', labels: ['FEATURE', 'HIGH'], checklist: { title: 'Criterios de Aceptación', items: [{ text: 'El PDF se genera correctamente' }, { text: 'Funciona en todos los navegadores soportados' }]}},
          ],
        },
        {
          title: 'Doing',
          cards: [],
        },
        {
          title: 'Code Review',
          cards: [],
        },
        {
          title: 'Done',
          cards: [],
        },
      ],
    },
  },
  {
    id: 'template-crm',
    name: 'Gestión de Ventas / CRM',
    description: 'Útil para comerciales, freelancers y pymes para seguir oportunidades de venta.',
    icon: UsersGroupIcon,
    category: 'Sales',
    board: {
      title: 'Pipeline de Ventas',
      lists: [
        { title: 'Leads', cards: [{ title: 'Cliente A - Interesado en Producto X', description: '$ Oportunidad: 5,000', labels: ['LEAD'] }] },
        { title: 'Contactado', cards: [] },
        { title: 'En negociación', cards: [{ title: 'Cliente B - Propuesta enviada', description: '$ Oportunidad: 12,000', labels: ['NEGOTIATION'] }] },
        { title: 'Cerrado ganado', cards: [] },
        { title: 'Cerrado perdido', cards: [] },
      ],
    },
  },
  {
    id: 'template-content',
    name: 'Plan de Marketing de Contenidos',
    description: 'Organiza tu calendario editorial, desde la idea hasta la publicación.',
    icon: LightBulbIcon,
    category: 'Marketing',
    board: {
      title: 'Plan de Contenidos',
      lists: [
        {
          title: 'Ideas',
          cards: [
            { title: 'Artículo: "10 tips para mejorar la productividad"', labels: ['BLOG'] },
            { title: 'Video: "Tutorial de nuestra nueva funcionalidad"', labels: ['REELS'] },
          ],
        },
        { title: 'En redacción', cards: [] },
        { title: 'En diseño', cards: [] },
        { title: 'Publicado', cards: [] },
      ],
    },
  },
   {
    id: 'template-onboarding',
    name: 'Onboarding de Nuevos Empleados',
    description: 'Estandariza el proceso de incorporación para nuevos miembros del equipo.',
    icon: UsersGroupIcon,
    category: 'HR',
    board: {
      title: 'Onboarding: [Nuevo Empleado]',
      lists: [
        {
          title: 'Antes del primer día',
          cards: [
            { title: 'Enviar contrato y documentación', labels: ['DOCS'] },
            { title: 'Preparar equipo (laptop, monitor, etc.)' },
          ],
        },
        {
          title: 'Primera semana',
          cards: [
            { title: 'Crear cuenta de correo y accesos', checklist: { title: 'Accesos', items: [{ text: 'Email' }, { text: 'Slack' }, { text: 'Kortex' }]}},
            { title: 'Reunión 1:1 con manager' },
            { title: 'Presentación al equipo' },
          ],
        },
        { title: 'Primer mes', cards: [{ title: 'Asignar primer proyecto/tarea' }] },
        { title: 'Primer trimestre', cards: [{ title: 'Revisión de rendimiento de 90 días' }] },
      ],
    },
  },
  {
    id: 'template-okr',
    name: 'OKRs (Objectives & Key Results)',
    description: 'Mantén la alineación estratégica del equipo con objetivos y resultados clave medibles.',
    icon: TrendingUpIcon,
    category: 'Operations',
    board: {
      title: 'OKRs Q3',
      lists: [
        {
          title: 'Objetivo 1: Mejorar la Satisfacción del Cliente',
          cards: [
            { title: 'KR 1: Aumentar el NPS de 40 a 50', labels: ['HIGH'] },
            { title: 'KR 2: Reducir el tiempo de primera respuesta en soporte a < 1 hora', labels: ['HIGH'] },
            { title: 'KR 3: Realizar 10 entrevistas con usuarios para obtener feedback', labels: ['MEDIUM'] },
          ],
        },
        {
          title: 'Objetivo 2: Incrementar la Adopción del Producto',
          cards: [
            { title: 'KR 1: Aumentar los usuarios activos semanales (WAU) en un 15%', labels: ['HIGH'] },
            { title: 'KR 2: Lanzar 2 nuevas funcionalidades clave solicitadas por los usuarios', labels: ['FEATURE'] },
          ],
        },
      ],
    },
  },
  {
    id: 'template-event',
    name: 'Gestión de Eventos',
    description: 'Planifica y ejecuta cualquier evento, desde conferencias hasta reuniones de equipo.',
    icon: ClipboardListIcon,
    category: 'Operations',
    board: {
      title: 'Planificación Evento Anual',
      lists: [
        { title: 'Preparativos', cards: [{ title: 'Reservar lugar del evento', labels: ['HIGH'] }, { title: 'Definir lista de invitados' }, { title: 'Contactar a ponentes' }] },
        { title: 'En ejecución', cards: [] },
        { title: 'Post-evento', cards: [{ title: 'Enviar encuesta de satisfacción' }, { title: 'Publicar fotos y resumen del evento', labels: ['BLOG'] }] },
      ],
    },
  },
    {
    id: 'template-personal',
    name: 'Planeación Personal (Kanban)',
    description: 'Una plantilla ligera y sencilla para organizar tus tareas personales o proyectos pequeños.',
    icon: LightBulbIcon,
    category: 'Personal',
    board: {
      title: 'Mi Kanban Personal',
      lists: [
        {
          title: 'Bandeja de Entrada',
          cards: [
            { title: 'Leer "Hábitos Atómicos"' },
            { title: 'Planificar vacaciones de verano' },
            { title: 'Investigar nuevo curso de React' },
          ],
        },
        { title: 'Hoy', cards: [{ title: 'Hacer ejercicio 30 min' }] },
        { title: 'En Progreso', cards: [] },
        { title: 'Hecho', cards: [{ title: 'Enviar facturas del mes' }] },
      ],
    },
  },
   {
    id: 'template-retro',
    name: 'Feedback & Retrospectiva',
    description: 'Facilita las dinámicas de retrospectiva en tu equipo para fomentar la mejora continua.',
    icon: UsersGroupIcon,
    category: 'HR',
    board: {
      title: 'Retrospectiva Sprint X',
      lists: [
        {
          title: 'Lo bueno (Keep doing)',
          cards: [
            { title: 'La comunicación en el canal de Slack fue excelente.' },
          ],
        },
        {
          title: 'Lo malo (Stop doing)',
          cards: [
            { title: 'Las reuniones diarias se alargaron demasiado.' },
          ],
        },
        {
          title: 'Ideas (Start doing)',
          cards: [
            { title: 'Probar pair programming para tareas complejas.' },
          ],
        },
        {
          title: 'Acciones',
          cards: [
            { title: 'Asignar un moderador para mantener las reuniones diarias enfocadas y cortas.' },
          ],
        },
      ],
    },
  },
];