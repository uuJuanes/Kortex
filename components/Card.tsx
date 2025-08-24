import React from 'react';
import { Card as CardType, Checklist, User, UserRole } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { AttachmentIcon } from './icons/AttachmentIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface CardProps {
  card: CardType;
  listId: string;
  onDragStart: (cardId: string, sourceListId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: CardType, listId: string) => void;
  currentUserRole?: UserRole;
}

const ChecklistDisplay: React.FC<{ checklist: Checklist }> = ({ checklist }) => {
  if (!checklist || !checklist.items || checklist.items.length === 0) {
    return null;
  }
  const completedItems = checklist.items.filter(item => item.completed).length;
  const totalItems = checklist.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between items-center text-xs font-medium text-text-muted">
        <span>Lista de Tareas</span>
        <span>{completedItems}/{totalItems}</span>
      </div>
      <div className="w-full bg-background-subtle rounded-full h-1.5">
        <div 
          className="bg-secondary h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};


const DueDateDisplay: React.FC<{ dueDate: string }> = ({ dueDate }) => {
  const date = new Date(dueDate);
  // Create date in UTC to avoid timezone issues
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = utcDate < today;
  const formattedDate = utcDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${isOverdue ? 'bg-danger-light text-danger-text' : 'bg-background-subtle text-text-muted'}`}>
      {formattedDate}
    </span>
  );
};

const Card: React.FC<CardProps> = ({ card, listId, onDragStart, onDeleteCard, onCardClick, currentUserRole }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(card.id, listId);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent modal from opening on delete
    onDeleteCard(card.id);
  };

  const hasAttachments = card.attachments && card.attachments.length > 0;
  const hasComments = card.comments && card.comments.length > 0;
  const isAdmin = currentUserRole === UserRole.Admin;

  return (
    <div
      onClick={() => onCardClick(card, listId)}
      draggable
      onDragStart={handleDragStart}
      className="bg-background-card rounded-lg shadow-subtle hover:shadow-md cursor-pointer active:cursor-grabbing transition-all duration-200 border border-border-default hover:border-primary/50 group relative"
    >
      {isAdmin && (
        <button 
          onClick={handleDelete}
          className="absolute top-1 right-1 p-1 rounded-full bg-background-card bg-opacity-50 text-text-muted hover:text-white hover:bg-danger opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Eliminar tarjeta"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}

      <div className="p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map(label => (
            <span key={label.id} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${label.color}`}>
              {label.text}
            </span>
          ))}
        </div>
        <h4 className="font-medium text-text-default mb-1">{card.title}</h4>
        {card.description && <p className="text-sm text-text-muted truncate">{card.description}</p>}
        {card.checklist && <ChecklistDisplay checklist={card.checklist} />}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {card.members.map(member => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  title={member.name}
                  className="w-6 h-6 rounded-full border-2 border-background-card"
                />
              ))}
            </div>
             {hasAttachments && (
              <span className="flex items-center text-xs text-text-muted">
                <AttachmentIcon className="w-4 h-4 mr-1" />
                {card.attachments!.length}
              </span>
            )}
            {hasComments && (
              <span className="flex items-center text-xs text-text-muted">
                <ChatBubbleIcon className="w-4 h-4 mr-1" />
                {card.comments!.length}
              </span>
            )}
          </div>
          {card.dueDate && <DueDateDisplay dueDate={card.dueDate} />}
        </div>
      </div>
    </div>
  );
};

export default Card;