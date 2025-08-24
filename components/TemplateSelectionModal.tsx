
import React, { useState, useMemo } from 'react';
import { BoardTemplate } from '../types';
import { BOARD_TEMPLATES } from '../constants/templates';
import { XIcon } from './icons/XIcon';

interface TemplateSelectionModalProps {
  onClose: () => void;
  onTemplateSelected: (template: BoardTemplate) => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({ onClose, onTemplateSelected }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = useMemo(() => {
        if (!searchQuery.trim()) {
            return BOARD_TEMPLATES;
        }
        return BOARD_TEMPLATES.filter(template =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-background-card rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-border-default">
                <header className="flex-shrink-0 p-4 border-b border-border-default flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text-default">Crear desde una Plantilla</h2>
                        <p className="text-sm text-text-muted">Empieza rápidamente con un flujo de trabajo prediseñado.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-shrink-0 p-4 border-b border-border-default">
                     <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar plantillas (ej: 'Ventas', 'Marketing')..."
                            className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 pl-10 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                        </div>
                    </div>
                </div>

                <main className="flex-grow p-6 overflow-y-auto">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => onTemplateSelected(template)}
                                    className="bg-background-subtle p-4 rounded-lg border border-border-default text-left h-full flex flex-col hover:border-primary hover:bg-primary-light/30 transition-all duration-200 group"
                                >
                                    <template.icon className="w-7 h-7 mb-3 text-primary" />
                                    <h3 className="font-semibold text-text-default">{template.name}</h3>
                                    <p className="text-sm text-text-muted mt-1 flex-grow">{template.description}</p>
                                    <span className="text-sm font-semibold text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Usar plantilla →
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-text-muted">
                            <h3 className="text-lg font-semibold">No se encontraron plantillas</h3>
                            <p className="mt-1">Intenta con otra palabra clave.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TemplateSelectionModal;
