import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface PasscodeModalProps {
  teamName: string;
  onClose: () => void;
  onVerify: (passcode: string) => boolean; // Returns true on success, false on failure
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ teamName, onClose, onVerify }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Por favor, introduce la clave de acceso.');
      return;
    }
    const success = onVerify(passcode);
    if (!success) {
      setError('Clave de acceso incorrecta. Inténtalo de nuevo.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Reset shake animation
      setPasscode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
       <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className={`bg-background-card rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 border border-border-default transform transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default flex items-center">
            <LockClosedIcon className="w-5 h-5 mr-3 text-text-muted" />
            Acceso a Equipo Privado
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-text-muted mb-4">
          El equipo <span className="font-semibold text-text-default">"{teamName}"</span> es privado. Introduce la clave para unirte.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-text-default mb-1">
              Clave de Acceso
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              className={`w-full bg-background-subtle border rounded-lg p-2.5 text-text-default focus:ring-2 focus:border-primary transition ${error ? 'border-danger focus:ring-danger' : 'border-border-default focus:ring-primary'}`}
              autoFocus
            />
          </div>

          {error && <p className="text-danger text-sm mt-2">{error}</p>}

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
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Unirse al Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeModal;