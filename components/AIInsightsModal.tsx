import React, { useState, useEffect } from 'react';
import { Board as BoardType, User, BoardAnalysis } from '../types';
import { analyzeBoard } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface AIInsightsModalProps {
  board: BoardType;
  users: User[];
  onClose: () => void;
}

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-semibold text-text-default">Analizando tu tablero...</h3>
        <p className="text-text-muted mt-1">La IA está revisando las tareas, asignaciones y progreso para generar insights valiosos.</p>
    </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void; }> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <ExclamationTriangleIcon className="w-12 h-12 text-danger mb-4" />
        <h3 className="text-lg font-semibold text-text-default">Ocurrió un Error</h3>
        <p className="text-text-muted mt-1 max-w-sm">{message}</p>
        <button
            onClick={onRetry}
            className="mt-6 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
            Reintentar Análisis
        </button>
    </div>
);

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ board, users, onClose }) => {
    const [analysis, setAnalysis] = useState<BoardAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyzeBoard(board, users);
            setAnalysis(result);
        } catch (err) {
            setError('No se pudieron generar los insights. Por favor, revisa la configuración de tu clave de API e inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [board, users]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-background-card rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-border-default">
                <header className="flex-shrink-0 p-4 border-b border-border-default flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text-default flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-3 text-accent" />
                        Análisis Inteligente del Tablero
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto">
                    {isLoading && <LoadingState />}
                    {error && <ErrorState message={error} onRetry={fetchAnalysis} />}
                    {analysis && !isLoading && !error && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="bg-background-subtle p-4 rounded-lg border border-border-default">
                                    <h3 className="font-semibold text-text-default flex items-center mb-2">
                                        <TrendingUpIcon className="w-5 h-5 mr-3 text-secondary" />
                                        Resumen Ejecutivo
                                    </h3>
                                    <p className="text-text-muted text-sm">{analysis.summary}</p>
                                </div>

                                {/* Workload */}
                                <div className="bg-background-subtle p-4 rounded-lg border border-border-default">
                                    <h3 className="font-semibold text-text-default flex items-center mb-3">
                                        <UsersGroupIcon className="w-5 h-5 mr-3 text-secondary" />
                                        Distribución de Carga
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysis.workload.map((member, index) => (
                                            <li key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-text-default">{member.userName}</span>
                                                <span className="font-mono bg-background-card px-2 py-0.5 rounded text-text-muted border border-border-default">{member.taskCount} tarea(s)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {/* Risks */}
                                <div className="bg-danger-light p-4 rounded-lg border border-danger/20">
                                    <h3 className="font-semibold text-danger-text flex items-center mb-3">
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-3" />
                                        Riesgos Potenciales
                                    </h3>
                                    <ul className="space-y-2 list-disc list-inside text-sm text-danger-text">
                                        {analysis.risks.map((risk, index) => <li key={index}>{risk}</li>)}
                                    </ul>
                                </div>
                                
                                {/* Suggestions */}
                                <div className="bg-primary-light p-4 rounded-lg border border-primary/20">
                                    <h3 className="font-semibold text-primary-text flex items-center mb-3">
                                        <LightBulbIcon className="w-5 h-5 mr-3" />
                                        Sugerencias de Acción
                                    </h3>
                                    <ul className="space-y-2 list-disc list-inside text-sm text-primary-text">
                                        {analysis.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AIInsightsModal;