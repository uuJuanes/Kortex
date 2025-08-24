import React, { useState } from 'react';
import { Board } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface BoardSidebarProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string) => void;
  onOpenAIGenerator: () => void;
  isVisible: boolean;
}

const BoardSidebar: React.FC<BoardSidebarProps> = ({ boards, activeBoardId, onSelectBoard, onCreateBoard, onOpenAIGenerator, isVisible }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreate = () => {
    if (newBoardTitle.trim()) {
      onCreateBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreating(false);
    }
  };

  return (
    <aside className={`bg-background-default flex-shrink-0 border-r border-border-default flex flex-col transition-all duration-300 ease-in-out ${isVisible ? 'w-64' : 'w-0'}`}>
        <div className={`p-4 flex flex-col flex-grow overflow-hidden transition-opacity duration-300 h-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h2 className="text-lg font-semibold text-text-muted mb-4 whitespace-nowrap">Tableros del Equipo</h2>
      <nav className="flex-grow">
        <ul>
          {boards.map(board => (
            <li key={board.id} className="mb-2">
              <button
                onClick={() => onSelectBoard(board.id)}
                className={`w-full text-left p-2 rounded-md flex items-center transition-colors ${
                  activeBoardId === board.id
                    ? 'bg-primary-light text-primary-text font-semibold'
                    : 'text-text-muted hover:bg-background-subtle hover:text-text-default'
                }`}
              >
                <span className="truncate">{board.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-2">
        {isCreating ? (
          <div className="bg-background-subtle p-3 rounded-lg">
            <input
              type="text"
              value={newBoardTitle}
              onChange={e => setNewBoardTitle(e.target.value)}
              placeholder="Título del nuevo tablero..."
              className="w-full bg-background-card border border-border-default rounded-md p-2 text-sm text-text-default focus:ring-1 focus:ring-primary focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs text-text-muted rounded-md hover:bg-background-card">Cancelar</button>
              <button onClick={handleCreate} className="px-3 py-1 text-xs text-white bg-primary rounded-md hover:bg-primary/90">Crear</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center text-sm p-2 rounded-lg bg-background-subtle hover:bg-border-default transition-colors duration-200 text-text-muted"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Nuevo Tablero
          </button>
        )}
         <button
            onClick={onOpenAIGenerator}
            className="w-full flex items-center justify-center text-sm p-2 rounded-lg bg-background-subtle hover:bg-border-default transition-colors duration-200 text-text-muted"
          >
            <SparklesIcon className="w-5 h-5 mr-2 text-accent" />
            Generar Tablero con IA
          </button>
      </div>
      </div>
    </aside>
  );
};

export default BoardSidebar;