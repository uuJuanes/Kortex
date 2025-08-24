
import { GoogleGenAI, Type } from "@google/genai";
import { Card, User, Board as BoardType, BoardAnalysis, Team, TeamAnalysis, TaskGenerationContext, BoardTemplate } from "../types";
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
      contents: `Actúa como ${persona}
      
      **Contexto del Proyecto:**
      - Nombre del Tablero: "${context.boardTitle}"
      - Columnas del Tablero: ${listTitles}
      - Columna Actual para Tareas: "${context.listTitle}"
      
      **Objetivo del Usuario:** "${goal}"

      Basado en el objetivo y el contexto, genera una lista de 3 a 5 tareas accionables en español. Para cada tarea, proporciona un título conciso y una breve descripción de una oración. Las tareas deben ser apropiadas para la columna "${context.listTitle}".`,
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


export const generateBoard = async (projectDescription: string, template?: BoardTemplate): Promise<AIGeneratedBoard> => {
  let mainPrompt: string;

  if (template) {
    let persona = "un experto gestor de proyectos.";
    switch (template.category) {
        case 'Software':
            persona = "un Ingeniero de Software Principal (Principal Software Engineer) con experiencia en Agile.";
            break;
        case 'Marketing':
            persona = "un Director de Marketing (Marketing Director) especializado en estrategias de contenido digital.";
            break;
        case 'Sales':
            persona = "un experimentado Gerente de Ventas (Sales Manager) enfocado en optimizar el pipeline comercial.";
            break;
        case 'HR':
            persona = "un especialista en Recursos Humanos (HR Specialist) encargado de la incorporación y seguimiento de personal.";
            break;
        case 'Product':
            persona = "un Gerente de Producto (Product Manager) experto en la creación de roadmaps.";
            break;
        case 'Operations':
            persona = "un Director de Operaciones (COO) enfocado en la eficiencia y alineación estratégica.";
            break;
        case 'Personal':
            persona = "un coach de productividad personal experto en la metodología Kanban.";
            break;
    }
    const listTitles = template.board.lists.map(l => `"${l.title}"`).join(', ');
    const listStructurePrompt = `Usa EXACTAMENTE la siguiente estructura de listas (columnas) para el tablero: ${listTitles}. Llena las primeras listas con tareas relevantes y deja las listas de etapas finales (como 'Hecho' o 'Lanzado') vacías.`;

    mainPrompt = `Actúa como ${persona}. Tu misión es tomar la descripción de un proyecto de un usuario y poblar un tablero Kanban predefinido con tareas relevantes, épicas e historias de usuario.

    **Contexto del Proyecto:**
    - **Tipo de Plantilla:** ${template.name}
    - **Descripción del Usuario:** "${projectDescription}"

    **Instrucciones para la Generación del Tablero:**
    1.  **Título del Tablero:** Genera un título para el tablero que refleje la descripción del usuario.
    2.  **Estructura de Listas:** ${listStructurePrompt}
    3.  **Tarjetas (Tareas):**
        - Basado en la descripción, crea una lista inicial de tareas, épicas e historias de usuario.
        - Distribuye estas tarjetas en las primeras columnas del tablero de manera lógica.
        - Las tarjetas deben tener un título claro y una breve descripción.
        - Asigna etiquetas relevantes para cada tarjeta, incluyendo opcionalmente checklists para tareas complejas.
    
    La salida DEBE adherirse estrictamente al esquema JSON proporcionado y todo el contenido textual debe estar en español.`

  } else {
    mainPrompt = `Actúa como un experto Project Manager y un sistema de IA para la gestión de proyectos. Tu misión es generar un tablero de proyecto Trello/Kanban completo, estructurado y realista en español.

    **Instrucción de Bienvenida:** Como primera tarjeta en la primera columna, SIEMPRE crea una tarjeta de bienvenida que explique el significado de los prefijos de las tareas.

    **Contexto del Proyecto:**
    - **Descripción del Usuario:** "${projectDescription}"

    **Instrucciones para la Generación del Tablero:**

    1.  **Tarjeta de Bienvenida:** La primera tarjeta de la primera lista DEBE ser una guía para el usuario.
        -   **Título:** "¡Bienvenido a tu Nuevo Tablero! ✨"
        -   **Descripción:** "Aquí tienes una guía rápida de los prefijos que usamos para organizar las tareas:
            -   \`EPIC\`: Una gran funcionalidad que agrupa varias historias de usuario.
            -   \`HU\`: Historia de Usuario. Una funcionalidad desde la perspectiva del usuario final.
            -   \`DSN\`: Tarea de Diseño (UI/UX).
            -   \`TSK-ARC\`: Tarea de Arquitectura de Software.
            -   \`TSK-BE\`: Tarea de Backend.
            -   \`TSK-FE\`: Tarea de Frontend.
            -   \`TSK-QA\`: Tarea de Quality Assurance (Pruebas).
            -   \`TSK-PM\`: Tarea de Project Management.
            -   \`BUG\`: Corrección de un error."
        -   **Etiquetas:** Asigna una etiqueta como '📌 Guía'.

    2.  **Listas (Columnas):**
        - Genera una secuencia lógica de listas que representen un flujo de trabajo de desarrollo de software completo (ej: \`Product Backlog\`, \`Diseño (UI/UX)\`, \`Sprint Backlog\`, \`Por Hacer (Sprint)\`, \`En Progreso\`, \`QA\`, \`Hecho\`).
        - Las listas avanzadas como \`En Progreso\`, \`QA\` y \`Hecho\` DEBEN estar INICIALMENTE VACÍAS.

    3.  **Tarjetas (Tareas):**
        - Utiliza los prefijos mencionados arriba en los títulos de las tarjetas para clarificar su naturaleza (ej: \`HU-01: Registro de usuarios\`, \`TSK-BE-01: Crear API de autenticación\`).
        - Cada tarjeta debe tener: \`title\`, \`description\`, y \`labels\`.
        - Puedes incluir opcionalmente: \`dueDate\` y \`checklist\`.

    La salida DEBE adherirse estrictamente al esquema JSON proporcionado y todo el contenido textual debe estar en español.`;
  }
  
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