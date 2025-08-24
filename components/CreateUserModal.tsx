import React, { useState } from 'react';
import { User } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';

interface CreateUserModalProps {
  onClose: () => void;
  onCreateUser: (name: string, profileSummary: string) => User;
  onUserCreated: (newUser: User) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreateUser, onUserCreated }) => {
  const [name, setName] = useState('');
  const [profileSummary, setProfileSummary] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !profileSummary.trim()) return;

    const newUser = onCreateUser(name.trim(), profileSummary.trim());
    onUserCreated(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 border border-border-default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default">Crear Nuevo Usuario</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-text-muted mb-4">
          Introduce los detalles del nuevo miembro. Se creará un perfil y se añadirá automáticamente a este equipo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-text-default mb-1">
                Nombre Completo y Rol <span className="text-danger">*</span>
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sofía Castro (QA Engineer)"
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>
            <div>
              <label htmlFor="user-summary" className="block text-sm font-medium text-text-default mb-1">
                Resumen del Perfil <span className="text-danger">*</span>
              </label>
              <textarea
                id="user-summary"
                value={profileSummary}
                onChange={(e) => setProfileSummary(e.target.value)}
                placeholder="Ej: Desarrollador Frontend con experiencia en React."
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                rows={3}
                required
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
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center disabled:bg-border-default disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear y Añadir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;