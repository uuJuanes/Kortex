import React, { useMemo, useState } from 'react';
import { Team, User, TeamAnalysis } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { analyzeTeam } from '../services/geminiService';

interface TeamDashboardProps {
  team: Team;
  users: User[];
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-background-card p-4 rounded-lg border border-border-default shadow-sm ${className}`}>
        <p className="text-sm text-text-muted">{title}</p>
        <p className="text-2xl font-bold text-text-default">{value}</p>
    </div>
);

const WorkloadBar: React.FC<{ user: User; taskCount: number; maxTasks: number }> = ({ user, taskCount, maxTasks }) => {
    const percentage = maxTasks > 0 ? (taskCount / maxTasks) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <img src={user.avatar} alt={user.name} title={user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-grow">
                <div className="flex justify-between mb-1">
                    <span className="text-text-default truncate font-medium">{user.name}</span>
                    <span className="text-text-muted font-mono">{taskCount}</span>
                </div>
                <div className="w-full bg-background-subtle rounded-full h-2">
                    <div className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const AIAnalysisDisplay: React.FC<{ analysis: TeamAnalysis }> = ({ analysis }) => (
    <div className="mt-4 border-t border-border-default pt-4 space-y-4">
         <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-in-out;
            }
        `}</style>
        <div className="animate-fadeIn">
            <p className="text-text-muted italic">{analysis.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-danger-light p-3 rounded-lg border border-danger/20">
                    <h4 className="font-semibold text-danger-text flex items-center mb-2"><ExclamationTriangleIcon className="w-5 h-5 mr-2" />Riesgos Clave</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-danger-text">
                        {analysis.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </div>
                <div className="bg-primary-light p-3 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-primary-text flex items-center mb-2"><LightBulbIcon className="w-5 h-5 mr-2" />Sugerencias</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-primary-text">
                        {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);


const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, users }) => {
    const [isAIAnalysisLoading, setIsAIAnalysisLoading] = useState(false);
    const [aiAnalysis, setAIAnalysis] = useState<TeamAnalysis | null>(null);
    const [aiError, setAIError] = useState<string | null>(null);
    
    const teamMetrics = useMemo(() => {
        const allCards = team.boards.flatMap(b => b.lists.flatMap(l => l.cards));
        const doneListTitles = ['hecho', 'done', 'finalizado'];

        const doneCards = team.boards.flatMap(b => 
            b.lists.filter(l => doneListTitles.includes(l.title.toLowerCase())).flatMap(l => l.cards)
        );
        const doneCardIds = new Set(doneCards.map(c => c.id));
        
        const totalTasks = allCards.length;
        const progress = totalTasks > 0 ? Math.round((doneCards.length / totalTasks) * 100) : 0;
        const overdueTasks = allCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date() && !doneCardIds.has(c.id)).length;

        const teamMembers = users.filter(u => team.members.some(m => m.userId === u.id));
        const workload = teamMembers.map(user => ({
            user,
            taskCount: allCards.filter(card => card.members.some(m => m.id === user.id)).length
        })).sort((a, b) => b.taskCount - a.taskCount);
        
        const maxTasks = workload.length > 0 ? Math.max(1, ...workload.map(w => w.taskCount)) : 1;
        
        return { totalTasks, progress, overdueTasks, workload, maxTasks };
    }, [team, users]);

    const handleGenerateAIAnalysis = async () => {
        setIsAIAnalysisLoading(true);
        setAIError(null);
        setAIAnalysis(null);
        try {
            const teamUsers = users.filter(u => team.members.some(m => m.userId === u.id))
            const result = await analyzeTeam(team, teamUsers);
            setAIAnalysis(result);
        } catch (err) {
            setAIError("No se pudo generar el resumen. Inténtalo de nuevo.");
            console.error(err);
        } finally {
            setIsAIAnalysisLoading(false);
        }
    };

    return (
        <div className="mb-8 p-4 sm:p-6 bg-background-card rounded-lg border border-border-default shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-text-default">Dashboard del Equipo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Proyectos Activos" value={team.boards.length.toString()} />
                <StatCard title="Tareas Totales" value={teamMetrics.totalTasks.toString()} />
                <StatCard title="Progreso General" value={`${teamMetrics.progress}%`} />
                <StatCard 
                    title="Tareas Vencidas" 
                    value={teamMetrics.overdueTasks.toString()} 
                    className={teamMetrics.overdueTasks > 0 ? 'text-danger-text border-danger/30' : ''}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-background-subtle p-4 rounded-lg border border-border-default">
                    <h3 className="font-semibold text-text-default mb-3">Carga de Trabajo del Equipo</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {teamMetrics.workload.map(({ user, taskCount }) => (
                           <WorkloadBar key={user.id} user={user} taskCount={taskCount} maxTasks={teamMetrics.maxTasks} />
                        ))}
                         {teamMetrics.workload.length === 0 && (
                            <p className="text-text-muted text-sm text-center py-4">No hay miembros en el equipo para mostrar la carga de trabajo.</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-background-subtle p-4 rounded-lg border border-border-default flex flex-col">
                    <h3 className="font-semibold text-text-default mb-2">Análisis Estratégico IA</h3>
                    <p className="text-sm text-text-muted mb-3 flex-grow">
                        Obtén un resumen ejecutivo de la salud del equipo, identificando riesgos y sugiriendo acciones de alto nivel.
                    </p>
                    
                    {!aiAnalysis && (
                         <button 
                            onClick={handleGenerateAIAnalysis}
                            disabled={isAIAnalysisLoading}
                            className="w-full mt-auto flex items-center justify-center text-sm p-2.5 rounded-lg bg-accent-light hover:opacity-80 transition-all duration-200 text-accent-text font-semibold disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isAIAnalysisLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Generar Resumen
                                </>
                            )}
                        </button>
                    )}

                    {aiError && <p className="text-danger text-center text-sm mt-2">{aiError}</p>}
                    {aiAnalysis && <AIAnalysisDisplay analysis={aiAnalysis} />}
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;