import React, { useState, useCallback } from 'react';
import { generateBoard } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';
import { AIGeneratedBoard } from '../App';
import { BOARD_TEMPLATES } from '../constants/templates';

interface GenerateBoardModalProps {
  onClose: () => void;
  onBoardGenerated: (board: AIGeneratedBoard) => void;
}

const GenerateBoardModal: React.FC<GenerateBoardModalProps> = ({ onClose, onBoardGenerated }) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!projectDescription.trim()) {
      setError('Por favor, describe tu proyecto.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // FIX: The generateBoard function now requires a template argument.
      // Using the "Agile" template as a default to fix the call.
      const defaultTemplate = BOARD_TEMPLATES.find(t => t.id === 'template-agile');
      if (!defaultTemplate) {
        throw new Error("Could not find the default 'template-agile' template.");
      }
      const generatedBoard = await generateBoard(projectDescription, defaultTemplate);
      onBoardGenerated(generatedBoard);
      onClose();
    } catch (err) {
      setError('Error al generar el tablero. Por favor, revisa tu clave de API e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectDescription, onBoardGenerated, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 border border-border-default transform transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2 text-accent" />
            Generar un Nuevo Tablero con IA
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-text-muted mb-4 text-sm">Describe tu proyecto, y nuestro experto en IA creará un tablero profesional y estructurado con tareas detalladas para que puedas empezar.</p>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-text-default mb-2">
            Descripción del Proyecto
          </label>
          <textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Ej: 'Una aplicación móvil para una cafetería local con pedidos en línea, programa de lealtad y localizador de tiendas.'"
            className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
            rows={4}
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
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generar Tablero
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateBoardModal;
