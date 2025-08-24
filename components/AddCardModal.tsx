import React, { useState } from 'react';
import { NewCardData, Label } from '../types';
import { LABELS } from '../constants';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';

interface AddCardModalProps {
  listId: string;
  onClose: () => void;
  onAddCard: (listId: string, cardData: NewCardData) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ listId, onClose, onAddCard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState('');
  
  const handleLabelToggle = (label: Label) => {
    setSelectedLabels(prev => 
      prev.find(l => l.id === label.id) 
        ? prev.filter(l => l.id !== label.id)
        : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCardData: NewCardData = {
      title: title.trim(),
      description: description.trim(),
      labels: selectedLabels,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    onAddCard(listId, newCardData);
  };
  
  const allLabels = Object.values(LABELS);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 border border-border-default transform transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default">Crear Nueva Tarjeta</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="card-title" className="block text-sm font-medium text-text-default mb-1">
                Título de la tarjeta <span className="text-danger">*</span>
              </label>
              <input
                id="card-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Diseñar el flujo de registro"
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>

            <div>
              <label htmlFor="card-description" className="block text-sm font-medium text-text-default mb-1">
                Descripción
              </label>
              <textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añadir una descripción más detallada..."
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                rows={4}
              />
            </div>

            <div>
                <h4 className="text-sm font-medium text-text-default mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                    {allLabels.map(label => {
                        const isSelected = selectedLabels.some(l => l.id === label.id);
                        return (
                            <button
                                type="button"
                                key={label.id}
                                onClick={() => handleLabelToggle(label)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-transform transform hover:scale-105 ${label.color} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-background-card ring-primary' : 'opacity-70 hover:opacity-100'}`}
                            >
                                {label.text}
                            </button>
                        );
                    })}
                </div>
            </div>

             <div>
                <label htmlFor="card-due-date" className="block text-sm font-medium text-text-default mb-1">
                    Fecha de Vencimiento
                </label>
                <input
                    id="card-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-text-default bg-background-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:bg-border-default disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Añadir Tarjeta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;