
import React, { useState, useCallback } from 'react';
import { BoardTemplate } from '../types';
import { AIGeneratedBoard } from '../App';
import { generateBoard } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';


interface TemplateCustomizationModalProps {
  template: BoardTemplate;
  onClose: () => void;
  onCreateBlank: (template: BoardTemplate) => void;
  onGenerateWithAI: (board: AIGeneratedBoard) => void;
}

const TemplateCustomizationModal: React.FC<TemplateCustomizationModalProps> = ({ template, onClose, onCreateBlank, onGenerateWithAI }) => {
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
      const generatedBoard = await generateBoard(projectDescription, template);
      onGenerateWithAI(generatedBoard);
    } catch (err) {
      setError('Error al generar el tablero. Por favor, revisa tu clave de API e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectDescription, template, onGenerateWithAI]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl shadow-lg w-full max-w-2xl mx-4 border border-border-default">
        <header className="p-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-default">Personaliza tu Tablero</h2>
            <p className="text-sm text-text-muted">Estás usando la plantilla: <span className="font-semibold">{template.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-text-muted hover:bg-background-subtle">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => onCreateBlank(template)}
                    className="p-6 border-2 border-border-default rounded-lg text-left hover:border-primary hover:bg-primary-light/30 transition-all duration-200 group"
                >
                    <DocumentDuplicateIcon className="w-8 h-8 mb-3 text-primary"/>
                    <h3 className="text-lg font-semibold text-text-default">Crear tablero vacío</h3>
                    <p className="text-sm text-text-muted mt-1">Empieza con la estructura de la plantilla, pero sin las tarjetas de ejemplo.</p>
                </button>
                <div className="p-6 border-2 border-border-default rounded-lg bg-background-subtle">
                     <div className="flex items-start">
                        <SparklesIcon className="w-8 h-8 mr-4 text-accent flex-shrink-0"/>
                        <div>
                            <h3 className="text-lg font-semibold text-text-default">Generar con IA</h3>
                            <p className="text-sm text-text-muted mt-1">Describe tu proyecto y la IA lo poblará con tareas relevantes.</p>
                        </div>
                    </div>
                </div>
            </div>
          
            <div className="mt-4 space-y-3">
                 <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Ej: 'Una aplicación para gestionar las tareas y gastos compartidos en un hogar, con registro de usuarios y un dashboard principal.'"
                    className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                    rows={3}
                    disabled={isLoading}
                />
                {error && <p className="text-danger text-sm">{error}</p>}
                <button
                    onClick={handleGenerate}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:bg-border-default disabled:cursor-not-allowed"
                    disabled={isLoading || !projectDescription.trim()}
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
    </div>
  );
};

export default TemplateCustomizationModal;
