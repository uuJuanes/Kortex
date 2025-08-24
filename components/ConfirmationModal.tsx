import React from 'react';
import { XIcon } from './icons/XIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4 border border-border-default">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-text-default">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-text-muted mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-default bg-background-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/90 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;