import React from 'react';
import { Board, User } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

interface BoardCardProps {
  board: Board;
  progress: number;
  totalTasks: number;
  overdueTasks: number;
  assignedMembers: User[];
  onSelect: () => void;
  onRequestDelete: (boardId: string) => void;
  canDelete: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, progress, totalTasks, overdueTasks, assignedMembers, onSelect, onRequestDelete, canDelete }) => {
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRequestDelete(board.id);
    };

    return (
        <div 
            onClick={onSelect}
            className="w-full h-full bg-background-card rounded-lg text-text-default p-4 flex flex-col justify-between group relative transform hover:-translate-y-1 transition-transform duration-300 shadow-md hover:shadow-lg cursor-pointer border border-border-default hover:border-primary/50"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-left break-words pr-8">{board.title}</h3>
                    {canDelete && (
                        <button
                            onClick={handleDeleteClick}
                            className="absolute top-2 right-2 p-1.5 rounded-full text-text-muted bg-background-card/50 hover:text-white hover:bg-danger opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                            aria-label={`Eliminar tablero ${board.title}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                    <div className="flex items-center gap-1.5" title="Total de tareas">
                        <ClipboardListIcon className="w-4 h-4" />
                        <span>{totalTasks}</span>
                    </div>
                    {overdueTasks > 0 && (
                        <div className="flex items-center gap-1.5 text-danger" title={`${overdueTasks} tarea(s) vencida(s)`}>
                            <AlertTriangleIcon className="w-4 h-4" />
                            <span>{overdueTasks}</span>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center text-xs text-text-muted mb-1">
                    <span>Progreso</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-background-subtle rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`}}
                    ></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                    <div className="flex -space-x-2">
                        {assignedMembers.slice(0, 4).map(member => (
                            <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            title={member.name}
                            className="w-7 h-7 rounded-full border-2 border-background-card"
                            />
                        ))}
                        {assignedMembers.length > 4 && (
                            <div className="w-7 h-7 rounded-full bg-background-subtle border-2 border-background-card flex items-center justify-center text-xs font-bold">
                                +{assignedMembers.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;