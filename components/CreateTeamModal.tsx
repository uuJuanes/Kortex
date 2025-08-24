import React, { useState } from 'react';
import { TeamPrivacy } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';

interface CreateTeamModalProps {
  onClose: () => void;
  onCreateTeam: (name: string, privacy: TeamPrivacy, passcode?: string) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onCreateTeam }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<TeamPrivacy>(TeamPrivacy.Private);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }
    if (privacy === TeamPrivacy.Private && !passcode.trim()) {
      setError('La clave de acceso es obligatoria para equipos privados.');
      return;
    }
    setError('');
    onCreateTeam(name.trim(), privacy, privacy === TeamPrivacy.Private ? passcode.trim() : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 border border-border-default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default">Crear Nuevo Equipo</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="team-name" className="block text-sm font-medium text-text-default mb-1">
                Nombre del Equipo
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Equipo de Marketing Digital"
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-default mb-2">Privacidad</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button type="button" onClick={() => setPrivacy(TeamPrivacy.Private)} className={`flex items-start text-left p-3 rounded-md border-2 transition-colors ${privacy === TeamPrivacy.Private ? 'border-primary bg-primary-light' : 'border-border-default hover:border-gray-400'}`}>
                  <LockClosedIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${privacy === TeamPrivacy.Private ? 'text-primary' : 'text-text-muted'}`} />
                  <div>
                    <h5 className="font-semibold text-sm text-text-default">Privado</h5>
                    <p className="text-xs text-text-muted">Requiere clave para unirse.</p>
                  </div>
                </button>
                <button type="button" onClick={() => setPrivacy(TeamPrivacy.Public)} className={`flex items-start text-left p-3 rounded-md border-2 transition-colors ${privacy === TeamPrivacy.Public ? 'border-primary bg-primary-light' : 'border-border-default hover:border-gray-400'}`}>
                  <UsersGroupIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${privacy === TeamPrivacy.Public ? 'text-primary' : 'text-text-muted'}`} />
                  <div>
                    <h5 className="font-semibold text-sm text-text-default">Público</h5>
                    <p className="text-xs text-text-muted">Abierto para la organización.</p>
                  </div>
                </button>
              </div>
            </div>
            {privacy === TeamPrivacy.Private && (
              <div>
                <label htmlFor="team-passcode" className="block text-sm font-medium text-text-default mb-1">
                  Clave de Acceso
                </label>
                <input
                  id="team-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Crea una clave de acceso segura"
                  className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            {error && <p className="text-sm text-danger mt-2">{error}</p>}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-default bg-background-subtle border border-border-default rounded-lg hover:bg-border-default">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
