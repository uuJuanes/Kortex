


import React, { useState, useCallback, useEffect } from 'react';
import { BoardTemplate } from '../types';
import { AIGeneratedBoard } from '../App';
import { generateBoard } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface TemplateCustomizationModalProps {
  template: BoardTemplate;
  onClose: () => void;
  onGenerate: (board: AIGeneratedBoard) => void;
}

const TemplateCustomizationModal: React.FC<TemplateCustomizationModalProps> = ({ template, onClose, onGenerate }) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state for variables if they exist
    if (template.variables) {
      const initialValues: Record<string, string> = {};
      template.variables.forEach(v => {
        initialValues[v.key] = '';
      });
      setVariableValues(initialValues);
    }
  }, [template]);

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };
  
  const canGenerate = () => {
      if (template.variables) {
          return template.variables.every(v => (variableValues[v.key] || '').trim() !== '');
      }
      return projectDescription.trim() !== '';
  }

  const handleGenerate = useCallback(async () => {
    if (!canGenerate()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    let descriptionForApi: string;
    if (template.variables) {
        descriptionForApi = template.variables.map(v => 
            `${v.label}: ${variableValues[v.key] || ''}`
        ).join('\n');
    } else {
        descriptionForApi = projectDescription;
    }

    setIsLoading(true);
    setError(null);
    try {
      const generatedBoard = await generateBoard(descriptionForApi, template);
      onGenerate(generatedBoard);
    } catch (err) {
      setError('Error al generar el tablero. Por favor, revisa tu clave de API e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectDescription, template, onGenerate, variableValues]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl shadow-lg w-full max-w-lg mx-4 border border-border-default">
        <header className="p-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-default flex items-center">
              <SparklesIcon className="w-6 h-6 mr-3 text-accent" />
              Generar Tablero con IA
            </h2>
            <p className="text-sm text-text-muted mt-1">Usando la plantilla: <span className="font-semibold">{template.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-text-muted hover:bg-background-subtle">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6">
          <p className="text-text-muted mb-4 text-sm">Describe tu proyecto, y la IA poblará la estructura de la plantilla con tareas, épicas e historias de usuario relevantes para que puedas empezar.</p>
          
          <div className="space-y-4">
            {template.variables ? (
              template.variables.map(variable => (
                <div key={variable.key}>
                  <label htmlFor={variable.key} className="block text-sm font-medium text-text-default mb-2">
                    {variable.label}
                  </label>
                  {variable.type === 'text' ? (
                    <input
                      id={variable.key}
                      type="text"
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      placeholder={variable.placeholder}
                      className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                      disabled={isLoading}
                    />
                  ) : (
                    <textarea
                      id={variable.key}
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                      placeholder={variable.placeholder}
                      className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                      rows={3}
                      disabled={isLoading}
                    />
                  )}
                </div>
              ))
            ) : (
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-text-default mb-2">
                  Descripción del Proyecto
                </label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Ej: 'Una aplicación para gestionar las tareas y gastos compartidos en un hogar...'"
                  className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                  rows={4}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            )}
          </div>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </div>

        <footer className="p-4 bg-background-subtle border-t border-border-default flex justify-end space-x-3 rounded-b-xl">
          <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-text-default bg-background-card border border-border-default rounded-lg hover:bg-border-default transition-colors"
              disabled={isLoading}
          >
              Cancelar
          </button>
          <button
              onClick={handleGenerate}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:bg-border-default disabled:cursor-not-allowed"
              disabled={isLoading || !canGenerate()}
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
        </footer>
      </div>
    </div>
  );
};

export default TemplateCustomizationModal;