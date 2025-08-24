import React, { useState, useCallback } from 'react';
import { generateTasks } from '../services/geminiService';
import { Card, TaskGenerationContext } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';

interface GenerateTasksModalProps {
  context: TaskGenerationContext;
  onClose: () => void;
  onTasksGenerated: (newCards: Omit<Card, 'id' | 'members' | 'labels' | 'checklist' | 'attachments' | 'comments'>[]) => void;
}

const GenerateTasksModal: React.FC<GenerateTasksModalProps> = ({ context, onClose, onTasksGenerated }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) {
      setError('Por favor, introduce un objetivo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const generatedTasks = await generateTasks(goal, {
        boardTitle: context.boardTitle,
        listTitle: context.listTitle,
        boardLists: context.boardLists,
      });
      onTasksGenerated(generatedTasks);
      onClose();
    } catch (err) {
      setError('Error al generar las tareas. Por favor, revisa tu clave de API e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [goal, context, onTasksGenerated, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 border border-border-default transform transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-accent" />
            Generar Tareas para "{context.listTitle}"
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-text-muted text-xs p-2 bg-background-subtle rounded-md mb-4 border border-border-default">
          <p>La IA está usando el contexto del tablero <span className="font-semibold text-text-default">"{context.boardTitle}"</span> para generar tareas más relevantes.</p>
        </div>
        
        <p className="text-text-muted mb-4 text-sm">Describe el objetivo general, y la IA lo desglosará en tareas accionables para ti.</p>


        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-text-default mb-2">
            Objetivo o Característica
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ej: 'Implementar la página de perfil de usuario con campos editables y subida de avatar'"
            className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-danger text-sm mt-2">{error}</p>}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-default bg-background-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:bg-border-default disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : 'Generar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateTasksModal;