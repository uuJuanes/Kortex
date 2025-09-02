
import React, { useState, useMemo } from 'react';
import { Team, User, TeamReport } from '../types';
import { generateTeamReport } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
// Fix: Import TrendingUpIcon to resolve 'Cannot find name' error.
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface MetricsViewProps {
  teams: Team[];
  users: User[];
  currentUser: User;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-background-card p-4 rounded-lg border border-border-default shadow-sm flex items-center gap-4">
    <div className="bg-primary-light p-3 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-text-default">{value}</p>
      <p className="text-sm text-text-muted">{title}</p>
    </div>
  </div>
);

const AIReportDisplay: React.FC<{ report: TeamReport }> = ({ report }) => (
  <div className="mt-6 border-t border-border-default pt-6 space-y-6 animate-fadeIn">
    <div>
      <h3 className="text-lg font-semibold text-text-default mb-2">Resumen Ejecutivo</h3>
      <p className="text-text-muted italic">"{report.summary}"</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-background-subtle p-4 rounded-lg">
        <h4 className="font-semibold text-secondary-text flex items-center mb-3"><CheckCircleIcon className="w-5 h-5 mr-2" />Puntos Positivos</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-default">
          {report.positives.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
      <div className="bg-background-subtle p-4 rounded-lg">
        <h4 className="font-semibold text-warning-text flex items-center mb-3"><ExclamationCircleIcon className="w-5 h-5 mr-2" />Áreas de Mejora</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-default">
          {report.improvements.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
      <div className="bg-background-subtle p-4 rounded-lg">
        <h4 className="font-semibold text-info-text flex items-center mb-3"><LightBulbIcon className="w-5 h-5 mr-2" />Acciones Sugeridas</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-default">
          {report.actionItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  </div>
);

const MetricsView: React.FC<MetricsViewProps> = ({ teams, users, currentUser }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [report, setReport] = useState<TeamReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedTeamId), [teams, selectedTeamId]);

  const teamMetrics = useMemo(() => {
    if (!selectedTeam) return { totalTasks: 0, completedTasks: 0, overdueTasks: 0, progress: 0 };
    
    const allCards = selectedTeam.boards.flatMap(b => b.lists.flatMap(l => l.cards));
    const doneListTitles = ['hecho', 'done', 'finalizado'];
    const doneCards = selectedTeam.boards.flatMap(b => 
        b.lists.filter(l => doneListTitles.includes(l.title.toLowerCase())).flatMap(l => l.cards)
    );
    const totalTasks = allCards.length;
    const completedTasks = doneCards.length;
    const overdueTasks = allCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, overdueTasks, progress };
  }, [selectedTeam]);

  const handleGenerateReport = async () => {
    if (!selectedTeam) return;
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const teamUsers = users.filter(u => selectedTeam.members.some(m => m.userId === u.id));
      const result = await generateTeamReport(selectedTeam, teamUsers);
      setReport(result);
    } catch (err) {
      setError("No se pudo generar el reporte. Revisa tu clave de API y vuelve a intentarlo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <p className="text-text-muted">Analiza el rendimiento y obtén insights de tus equipos.</p>
            <div className="flex items-center gap-2">
                <label htmlFor="team-select" className="text-sm font-medium text-text-muted">Equipo:</label>
                <select
                    id="team-select"
                    value={selectedTeamId}
                    onChange={e => {
                        setSelectedTeamId(e.target.value);
                        setReport(null);
                        setError(null);
                    }}
                    className="bg-background-card border border-border-default rounded-lg p-2 text-sm text-text-default focus:ring-2 focus:ring-primary"
                >
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
            </div>
        </div>

        {selectedTeam ? (
            <div className="bg-background-default p-6 rounded-xl border border-border-default">
                <h2 className="text-2xl font-bold text-text-default mb-4">Dashboard: {selectedTeam.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Tareas Totales" value={teamMetrics.totalTasks} icon={<ClipboardListIcon className="w-6 h-6 text-primary" />} />
                    <StatCard title="Completadas" value={teamMetrics.completedTasks} icon={<CheckCircleIcon className="w-6 h-6 text-primary" />} />
                    <StatCard title="Vencidas" value={teamMetrics.overdueTasks} icon={<ExclamationTriangleIcon className="w-6 h-6 text-primary" />} />
                    <StatCard title="Progreso General" value={`${teamMetrics.progress}%`} icon={<TrendingUpIcon className="w-6 h-6 text-primary" />} />
                </div>
                
                <div className="mt-8 text-center bg-background-subtle p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-text-default flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 mr-3 text-accent" />
                        Reporte Estratégico con IA
                    </h3>
                    <p className="text-text-muted mt-2 max-w-2xl mx-auto">Obtén un análisis profundo sobre la productividad, posibles cuellos de botella y recomendaciones para mejorar el flujo de trabajo de tu equipo.</p>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className="mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center mx-auto disabled:bg-border-default disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 mr-2" />
                                Analizando Datos...
                            </>
                        ) : "Generar Reporte"}
                    </button>
                </div>
                
                {error && <p className="text-danger text-center mt-4">{error}</p>}
                {report && <AIReportDisplay report={report} />}
            </div>
        ) : (
            <div className="text-center py-16 text-text-muted">
                <h3 className="text-xl font-semibold">No hay equipos para mostrar</h3>
                <p>Crea tu primer equipo para empezar a ver las métricas.</p>
            </div>
        )}
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        `}</style>
    </div>
  );
};

export default MetricsView;