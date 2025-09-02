

import { GoogleGenAI, Type } from "@google/genai";
import { Card, User, Board as BoardType, BoardAnalysis, Team, TeamAnalysis, TaskGenerationContext, BoardTemplate, Label, TeamReport, Comment } from "../types";
import { AIGeneratedBoard } from "../App";

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface GeneratedTask {
  title: string;
  description: string;
}

interface GeminiTasksResponse {
  tasks: GeneratedTask[];
}

interface GeminiBoardResponse {
  board: AIGeneratedBoard;
}

export const generateTasks = async (goal: string, context: { boardTitle: string; listTitle: string; boardLists: {id: string; title: string}[] }): Promise<Omit<Card, 'id' | 'labels' | 'checklist' | 'members' | 'attachments' | 'comments'>[]> => {
  // Determine AI persona based on context
  const boardTitleLower = context.boardTitle.toLowerCase();
  let persona = "un experto gestor de proyectos.";
  if (boardTitleLower.includes('software') || boardTitleLower.includes('desarrollo') || boardTitleLower.includes('sprint') || boardTitleLower.includes('scrum')) {
    persona = "un Ingeniero de Software Principal (Principal Software Engineer) con experiencia en Agile.";
  } else if (boardTitleLower.includes('marketing') || boardTitleLower.includes('contenidos')) {
    persona = "un Director de Marketing (Marketing Director) especializado en estrategias de contenido digital.";
  } else if (boardTitleLower.includes('ventas') || boardTitleLower.includes('crm')) {
    persona = "un experimentado Gerente de Ventas (Sales Manager) enfocado en optimizar el pipeline comercial.";
  } else if (boardTitleLower.includes('onboarding') || boardTitleLower.includes('empleados')) {
    persona = "un especialista en Recursos Humanos (HR Specialist) encargado de la incorporación de personal.";
  }

  const listTitles = context.boardLists.map(l => `"${l.title}"`).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        **ROL:** Eres ${persona}. Tu especialidad es descomponer objetivos grandes en tareas pequeñas y manejables.

        **CONTEXTO DEL PROYECTO:**
        - **Nombre del Tablero:** "${context.boardTitle}"
        - **Flujo de Trabajo (Columnas):** ${listTitles}
        - **Etapa Actual para Nuevas Tareas:** "${context.listTitle}"
        
        **OBJETIVO A DESGLOSAR:**
        "${goal}"

        **INSTRUCCIONES:**
        1. Analiza el **OBJETIVO** dentro del **CONTEXTO** del proyecto.
        2. Genera una lista de 3 a 5 tareas específicas y accionables que representen los siguientes pasos lógicos para alcanzar el objetivo.
        3. Las tareas deben ser apropiadas para ser añadidas a la columna "${context.listTitle}".
        4. Para cada tarea, proporciona un \`title\` (título claro y directo) y una \`description\` (una frase que explique el "qué" o el "porqué" de la tarea).
        5. La respuesta DEBE estar en español.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "Una lista de tareas generadas.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "El título de la tarea."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Una breve descripción de la tarea."
                  }
                },
                 required: ["title", "description"]
              }
            }
          },
          required: ["tasks"]
        },
      }
    });

    const jsonString = response.text.trim();
    const parsedResponse: GeminiTasksResponse = JSON.parse(jsonString);

    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
      throw new Error("Invalid response format from Gemini API.");
    }

    return parsedResponse.tasks;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch tasks from Gemini API.");
  }
};


export const generateBoard = async (projectDescription: string, template: BoardTemplate): Promise<AIGeneratedBoard> => {
  let persona: string;
  let taskTypeInstructions: string;

  // Define personas and task instructions based on template category
  switch (template.category) {
    case 'Software':
      persona = "un Arquitecto de Soluciones experto en Metodologías Ágiles y Scrum.";
      taskTypeInstructions = "Genera una mezcla de **Épicas** (grandes funcionalidades), **Historias de Usuario** (requerimientos desde la perspectiva del usuario, ej: 'HU-01: ...') y **Tareas Técnicas** (acciones específicas, ej: 'TSK-BE-01: ...'). En las descripciones, sugiere dependencias lógicas cuando sea apropiado (ej: 'Depende de TSK-XX-01').";
      break;
    case 'Marketing':
      persona = "un Director de Marketing Estratégico especializado en campañas de contenido omnicanal.";
      taskTypeInstructions = "Genera **Iniciativas de Marketing** y **Piezas de Contenido** como tarjetas. Incluye ideas para artículos de blog, campañas de redes sociales, videos o newsletters. Asegúrate de que las tareas iniciales se centren en la estrategia y la planificación.";
      break;
    case 'Sales':
      persona = "un Vicepresidente de Ventas con amplia experiencia en la estructuración de pipelines comerciales B2B y B2C.";
      taskTypeInstructions = "Genera **Oportunidades de Venta** o **Cuentas Clave** como tarjetas. Cada tarjeta debe representar un lead o un cliente potencial en una etapa temprana del embudo. Utiliza la descripción para añadir detalles clave como el valor estimado de la oportunidad.";
      break;
    case 'HR':
      persona = "un Director de Recursos Humanos (CHRO) enfocado en crear experiencias de empleado excepcionales.";
      taskTypeInstructions = "Genera **Hitos del Proceso de RRHH** como tarjetas. Por ejemplo, para un onboarding, crea tareas como 'Preparar equipo de trabajo', 'Coordinar sesión de bienvenida', etc. Las tareas deben ser claras y asignables.";
      break;
    case 'Product':
      persona = "un Jefe de Producto (Head of Product) experto en la definición de roadmaps y la priorización de funcionalidades basada en el impacto.";
      taskTypeInstructions = "Genera **Funcionalidades (Features)** y **Épicas** como tarjetas. Organízalas en las columnas de roadmap (ej: 'Próximo Q', 'Futuro') para dar una visión estratégica del producto. Usa las descripciones para explicar el valor de negocio de cada funcionalidad.";
      break;
    case 'Operations':
      persona = "un Director de Operaciones (COO) obsesionado con la eficiencia de procesos y la alineación estratégica.";
      taskTypeInstructions = "Genera **Proyectos Clave** o **Hitos Operativos** como tarjetas. Las tareas deben reflejar los pasos necesarios para alcanzar un objetivo operativo, como 'Optimizar proceso de facturación' o 'Implementar nuevo software interno'.";
      break;
    case 'Personal':
    default:
      persona = "un coach de productividad de clase mundial, experto en la metodología GTD (Getting Things Done).";
      taskTypeInstructions = "Genera **Tareas Personales** y **Metas a Corto Plazo** como tarjetas. Desglosa el objetivo del usuario en pasos pequeños y manejables. Comienza por poblar la bandeja de entrada o la lista 'Por Hacer'.";
      break;
  }
  
  const listTitles = template.board.lists.map(l => `"${l.title}"`).join(', ');
  
  const mainPrompt = `
    **ROL:** Actúa como ${persona}. Tu misión es crear un plan de proyecto inicial estructurado en un tablero Kanban.

    **PROYECTO DEL USUARIO:**
    - **Tipo de Plan (Plantilla):** ${template.name}
    - **Descripción:** "${projectDescription}"

    **TAREA:**
    1.  **Título del Tablero:** Genera un título conciso y descriptivo para el proyecto.
    2.  **Estructura de Columnas:** Debes usar **exactamente** la siguiente estructura de columnas: ${listTitles}.
    3.  **Contenido de las Tarjetas:**
        - Basándote en tu rol, genera el contenido inicial del tablero. ${taskTypeInstructions}
        - Crea entre 8 y 15 tarjetas en total.
        - Distribuye las tarjetas en las primeras 2-3 columnas de forma lógica. Las columnas de etapas finales (como 'Hecho', 'Lanzado') deben permanecer vacías.
        - Cada tarjeta debe tener un \`title\` claro y una \`description\` breve pero informativa.
        - Asigna etiquetas (\`labels\`) relevantes y visualmente distintas para categorizar el trabajo.
        - Para cada tarjeta, sugiere un \`assignedRole\` genérico que sería responsable de la tarea (ej. 'Frontend Developer', 'Marketing Specialist').
        - Para tareas complejas, añade un \`checklist\` con 2-4 sub-ítems o criterios de aceptación.
    
    **REGLAS DE SALIDA:**
    - El resultado debe ser un objeto JSON válido que se ajuste estrictamente al esquema proporcionado.
    - Todo el contenido textual (títulos, descripciones, etc.) DEBE estar en **español**.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: mainPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            board: {
              type: Type.OBJECT,
              description: "The root object for the entire project board.",
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The generated title for the project board."
                },
                lists: {
                  type: Type.ARRAY,
                  description: "The columns or lists of the board.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description: "The title of the list."
                      },
                      cards: {
                        type: Type.ARRAY,
                        description: "The tasks within this list.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: {
                              type: Type.STRING,
                              description: "The title of the card/task."
                            },
                            description: {
                              type: Type.STRING,
                              description: "A short description for the card/task. Can contain markdown for dependencies and estimations."
                            },
                            labels: {
                              type: Type.ARRAY,
                              description: "A list of labels assigned to the card.",
                              items: {
                                type: Type.OBJECT,
                                properties: {
                                  text: { type: Type.STRING, description: "Label text, e.g., '💡 Feature'" },
                                  color: { type: Type.STRING, description: "A valid color name from the list: 'bg-danger-light text-danger-text', 'bg-warning-light text-warning-text', 'bg-info-light text-info-text', 'bg-gray-light text-gray-text', 'bg-accent-light text-accent-text', 'bg-secondary-light text-secondary-text'." }
                                },
                                required: ["text", "color"]
                              }
                            },
                            assignedRole: {
                              type: Type.STRING,
                              description: "Un rol sugerido para realizar esta tarea (ej. 'Desarrollador Backend', 'Diseñador UX/UI')."
                            },
                            dueDate: {
                              type: Type.STRING,
                              description: "Optional due date in ISO 8601 format (YYYY-MM-DD)."
                            },
                            checklist: {
                              type: Type.OBJECT,
                              description: "A checklist of sub-tasks or acceptance criteria.",
                              properties: {
                                title: { type: Type.STRING },
                                items: {
                                  type: Type.ARRAY,
                                  items: {
                                    type: Type.OBJECT,
                                    properties: {
                                      text: { type: Type.STRING, description: "A single checklist item." }
                                    },
                                    required: ["text"]
                                  }
                                }
                              },
                              required: ["title", "items"]
                            }
                          },
                          required: ["title", "description", "labels"]
                        }
                      }
                    },
                    required: ["title", "cards"]
                  }
                }
              },
              required: ["title", "lists"]
            }
          },
          required: ["board"]
        }
      }
    });

    const jsonString = response.text.trim();
    const parsedResponse: GeminiBoardResponse = JSON.parse(jsonString);
    
    if (!parsedResponse.board) {
      throw new Error("Invalid board response format from Gemini API.");
    }

    return parsedResponse.board;
    
  } catch (error) {
    console.error("Error calling Gemini API for board generation:", error);
    throw new Error("Failed to generate board from Gemini API.");
  }
};

export const findBestUserForTask = async (
  task: { title: string; description: string },
  users: User[]
): Promise<string> => {
  if (users.length === 0) {
    throw new Error("No users available to assign the task to.");
  }

  const userProfiles = users.map(u => ({
    id: u.id,
    name: u.name,
    profileSummary: u.profileSummary,
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres un experto gestor de proyectos encargado de asignar una tarea a la persona más adecuada de un equipo. Analiza la siguiente tarea y los perfiles del equipo, y devuelve el ID del mejor candidato.

**Tarea:**
- **Título:** "${task.title}"
- **Descripción:** "${task.description}"

**Miembros del Equipo Disponibles:**
${JSON.stringify(userProfiles, null, 2)}

Basado en la especialización y experiencia descrita en los resúmenes de perfil, ¿quién es la persona más idónea para esta tarea?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            userId: {
              type: Type.STRING,
              description: "El ID del usuario que mejor se adapta a la tarea.",
            },
          },
          required: ["userId"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse: { userId: string } = JSON.parse(jsonString);

    if (!parsedResponse.userId) {
      throw new Error("Invalid user ID format from Gemini API.");
    }

    return parsedResponse.userId;
    
  } catch (error) {
    console.error("Error calling Gemini API for user assignment:", error);
    throw new Error("Failed to assign user from Gemini API.");
  }
};

export const getTaskSuggestions = async (
  task: { title: string; description?: string },
  allLabels: Label[]
): Promise<Label[]> => {
  const labelDescriptions = allLabels.map(l => `"${l.text}"`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Actúa como un experto gestor de proyectos. Analiza la siguiente tarea y sugiere las etiquetas más relevantes de la lista proporcionada.

      **Tarea:**
      - Título: "${task.title}"
      - Descripción: "${task.description || 'Sin descripción'}"

      **Etiquetas Disponibles:**
      [${labelDescriptions}]

      Basado en el título y la descripción, ¿cuáles de las etiquetas disponibles son las más adecuadas? Proporciona un máximo de 3 etiquetas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedLabels: {
              type: Type.ARRAY,
              description: "Una lista de los nombres de las etiquetas sugeridas.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["suggestedLabels"]
        },
      }
    });

    const jsonString = response.text.trim();
    const parsedResponse: { suggestedLabels: string[] } = JSON.parse(jsonString);

    if (!parsedResponse.suggestedLabels) {
      return [];
    }
    
    // Map string names back to Label objects
    const suggestedLabels = parsedResponse.suggestedLabels
      .map(suggestedText => allLabels.find(label => label.text.toLowerCase() === suggestedText.toLowerCase()))
      .filter((l): l is Label => !!l);
      
    return suggestedLabels;
  } catch (error) {
    console.error("Error calling Gemini API for label suggestions:", error);
    throw new Error("Failed to get label suggestions from Gemini API.");
  }
};


export const analyzeBoard = async (board: BoardType, members: User[]): Promise<BoardAnalysis> => {
    // Simplify the board data for a cleaner prompt
    const simplifiedBoard = {
        title: board.title,
        lists: board.lists.map(list => ({
            title: list.title,
            cardCount: list.cards.length,
            cards: list.cards.map(card => ({
                title: card.title,
                assigned: card.members.map(m => m.name).join(', ') || 'Unassigned',
                dueDate: card.dueDate,
                isOverdue: card.dueDate ? new Date(card.dueDate) < new Date() : false,
            }))
        }))
    };

    const memberProfiles = members.map(m => ({ name: m.name, taskCount: board.lists.flatMap(l => l.cards).filter(c => c.members.some(mem => mem.id === m.id)).length }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Actúa como un experto gestor de proyectos Agile analizando el siguiente estado de un tablero Kanban. Proporciona un análisis conciso y accionable en español.

**Datos del Tablero:**
\`\`\`json
${JSON.stringify(simplifiedBoard, null, 2)}
\`\`\`

**Miembros del Equipo y su Carga de Tareas Actual:**
\`\`\`json
${JSON.stringify(memberProfiles, null, 2)}
\`\`\`

**Tu Tarea:**
Analiza los datos proporcionados y genera un informe estructurado que incluya:
1.  **Resumen (summary):** Un párrafo corto (2-3 frases) que resuma el estado general del proyecto.
2.  **Distribución de Carga (workload):** Una lista de los miembros del equipo y su número de tareas asignadas. Identifica si la carga parece desequilibrada.
3.  **Riesgos Potenciales (risks):** Una lista de 2 a 4 riesgos o problemas clave que observes (ej. cuellos de botella en una lista, tareas vencidas, tarjetas críticas sin asignar, miembros sobrecargados).
4.  **Sugerencias de Acción (suggestions):** Una lista de 2 a 4 recomendaciones claras y priorizadas para mejorar el flujo de trabajo o mitigar los riesgos identificados.

La salida DEBE ser un objeto JSON que se ajuste estrictamente al esquema proporcionado.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Un breve resumen del estado del tablero." },
                        workload: {
                            type: Type.ARRAY,
                            description: "Distribución de la carga de trabajo entre los miembros del equipo.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    userName: { type: Type.STRING },
                                    taskCount: { type: Type.INTEGER }
                                },
                                required: ["userName", "taskCount"]
                            }
                        },
                        risks: {
                            type: Type.ARRAY,
                            description: "Una lista de riesgos potenciales identificados.",
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            description: "Una lista de sugerencias de acción.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["summary", "workload", "risks", "suggestions"]
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedResponse: BoardAnalysis = JSON.parse(jsonString);

        if (!parsedResponse.summary || !parsedResponse.workload || !parsedResponse.risks || !parsedResponse.suggestions) {
            throw new Error("Invalid analysis response format from Gemini API.");
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error calling Gemini API for board analysis:", error);
        throw new Error("Failed to generate board analysis from Gemini API.");
    }
};

export const analyzeTeam = async (team: Team, members: User[]): Promise<TeamAnalysis> => {
    const simplifiedBoards = team.boards.map(board => {
        const allCards = board.lists.flatMap(l => l.cards);
        const doneListTitles = ['hecho', 'done', 'finalizado'];
        
        const doneCards = board.lists
            .filter(list => doneListTitles.includes(list.title.toLowerCase()))
            .flatMap(list => list.cards);
        const doneCardIds = new Set(doneCards.map(c => c.id));
        
        const totalTasks = allCards.length;
        const progress = totalTasks > 0 ? (doneCards.length / totalTasks) * 100 : 0;
        
        const overdueTasks = allCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date() && !doneCardIds.has(c.id)).length;
        
        return {
            title: board.title,
            totalTasks,
            progress: Math.round(progress),
            overdueTasks
        };
    });

    const memberProfiles = members
      .filter(member => team.members.some(m => m.userId === member.id))
      .map(member => {
        const taskCount = team.boards.flatMap(b => b.lists.flatMap(l => l.cards)).filter(c => c.members.some(mem => mem.id === member.id)).length;
        return { name: member.name, taskCount };
    });

    const prompt = `Actúa como un experto director de proyectos (Head of Project Management) analizando el estado de un equipo completo y todos sus proyectos. Proporciona un análisis conciso, estratégico y accionable en español.

**Datos del Equipo: ${team.name}**

**Resumen de Proyectos (Tableros):**
\`\`\`json
${JSON.stringify(simplifiedBoards, null, 2)}
\`\`\`

**Miembros del Equipo y su Carga de Tareas Actual:**
\`\`\`json
${JSON.stringify(memberProfiles, null, 2)}
\`\`\`

**Tu Tarea:**
Analiza los datos agregados de todos los proyectos y la carga de trabajo del equipo. Genera un informe de alto nivel para la gerencia que incluya:
1.  **Resumen General (summary):** Un párrafo corto (3-4 frases) resumiendo la salud general del equipo, destacando logros y el estado general del portafolio de proyectos.
2.  **Riesgos Estratégicos (risks):** Una lista de 2 a 3 riesgos clave a nivel de equipo o proyecto cruzado (ej. dependencias entre proyectos no visibles, sobrecarga sistemática de un rol específico, múltiples proyectos con fechas de entrega cercanas, etc.).
3.  **Sugerencias de Alto Nivel (suggestions):** Una lista de 2 a 3 recomendaciones estratégicas para el liderazgo del equipo (ej. "Reasignar recursos del proyecto X al Y para mitigar retrasos", "Planificar un sprint de 'deuda técnica' para todo el equipo", "Felicitar a [miembro] por su alto rendimiento").

La salida DEBE ser un objeto JSON que se ajuste estrictamente al esquema proporcionado.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Un breve resumen del estado general del equipo." },
                        risks: {
                            type: Type.ARRAY,
                            description: "Una lista de riesgos estratégicos identificados.",
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            description: "Una lista de sugerencias de alto nivel.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["summary", "risks", "suggestions"]
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedResponse: TeamAnalysis = JSON.parse(jsonString);

        if (!parsedResponse.summary || !parsedResponse.risks || !parsedResponse.suggestions) {
            throw new Error("Invalid team analysis response format from Gemini API.");
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error calling Gemini API for team analysis:", error);
        throw new Error("Failed to generate team analysis from Gemini API.");
    }
};


export const summarizeCard = async (card: Card): Promise<string> => {
    const commentsText = (card.comments || [])
        .slice(-5) // Get last 5 comments
        .map(c => `${c.userName}: "${c.text}"`)
        .join('\n');

    const prompt = `Eres un asistente de gestión de proyectos. Tu tarea es resumir una tarjeta (task) para que alguien pueda entender rápidamente su estado actual.

**Datos de la Tarjeta:**
- **Título:** ${card.title}
- **Descripción:** ${card.description || 'No hay descripción.'}
- **Últimos Comentarios:**
${commentsText || 'No hay comentarios.'}

**Instrucción:**
Genera un resumen conciso en un solo párrafo en español. El resumen debe enfocarse en el objetivo principal de la tarea, su estado actual y cualquier pregunta o bloqueo evidente mencionado en los comentarios. No uses más de 3 frases.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for card summary:", error);
        throw new Error("Failed to generate card summary from Gemini API.");
    }
};

export const generateTeamReport = async (team: Team, users: User[]): Promise<TeamReport> => {
    const simplifiedData = {
        teamName: team.name,
        totalMembers: team.members.length,
        totalBoards: team.boards.length,
        boards: team.boards.map(b => {
            const allCards = b.lists.flatMap(l => l.cards);
            const doneCards = allCards.filter(c => ['done', 'hecho', 'finalizado'].includes(b.lists.find(l => l.cards.some(card => card.id === c.id))?.title.toLowerCase() || ''));
            return {
                title: b.title,
                totalTasks: allCards.length,
                completedTasks: doneCards.length,
                overdueTasks: allCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length
            };
        })
    };

    const prompt = `Actúa como un experto analista de proyectos y coach de equipos Agile. Analiza los siguientes datos de un equipo y genera un informe estratégico conciso en español.

**Datos del Equipo:**
\`\`\`json
${JSON.stringify(simplifiedData, null, 2)}
\`\`\`

**Tu Tarea:**
Crea un informe que ayude al líder del equipo a entender la situación actual y a tomar decisiones. El informe debe contener:
1.  **summary:** Un resumen ejecutivo de 2-3 frases sobre la salud general del equipo y su progreso.
2.  **positives:** Una lista de 2-3 puntos positivos o "victorias" observables en los datos (ej: buen progreso en un proyecto, baja cantidad de tareas vencidas).
3.  **improvements:** Una lista de 2-3 áreas de mejora o riesgos potenciales (ej: un proyecto con muchas tareas y poco progreso, alta proporción de tareas vencidas).
4.  **actionItems:** Una lista de 2-3 recomendaciones claras y accionables para el equipo o su líder.

La salida DEBE ser un objeto JSON que se ajuste estrictamente al esquema proporcionado.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        positives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["summary", "positives", "improvements", "actionItems"]
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedResponse: TeamReport = JSON.parse(jsonString);

        if (!parsedResponse.summary || !parsedResponse.positives || !parsedResponse.improvements || !parsedResponse.actionItems) {
            throw new Error("Invalid report response format from Gemini API.");
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error calling Gemini API for team report:", error);
        throw new Error("Failed to generate team report from Gemini API.");
    }
};
