import React from 'react';
import { List as ListType, Card as CardType, UserRole } from '../types';
import Card from './Card';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ListProps {
  list: ListType;
  onDragStart: (cardId: string, sourceListId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (targetListId: string) => void;
  onOpenAITaskGenerator: (listId: string) => void;
  onOpenAddCardModal: (listId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onCardClick: (card: CardType, listId: string) => void;
  currentUserRole?: UserRole;
}

const List: React.FC<ListProps> = ({ list, onDragStart, onDragOver, onDrop, onOpenAITaskGenerator, onOpenAddCardModal, onDeleteCard, onCardClick, currentUserRole }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(list.id);
  };

  const isAdmin = currentUserRole === UserRole.Admin;

  return (
    <div
      className="bg-background-subtle rounded-xl p-3 w-80 flex-shrink-0 flex flex-col shadow-subtle max-h-full"
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0 px-1">
        <h2 className="font-semibold text-md text-text-default">{list.title}</h2>
        <span className="bg-background-default text-text-muted text-xs font-semibold px-2 py-1 rounded-full border border-border-default">
          {list.cards.length}
        </span>
      </div>
      <div className="flex-grow space-y-2 overflow-y-auto pr-1 -mr-1">
        {list.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            listId={list.id}
            onDragStart={onDragStart}
            onDeleteCard={onDeleteCard}
            onCardClick={onCardClick}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
      {isAdmin && (
        <div className="flex-shrink-0 mt-2 space-y-1">
          <button
            onClick={() => onOpenAddCardModal(list.id)}
            className="w-full flex items-center text-sm p-2 rounded-lg hover:bg-background-card transition-colors duration-200 text-text-muted"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Añadir una tarjeta
          </button>
          <button 
            onClick={() => onOpenAITaskGenerator(list.id)}
            className="w-full flex items-center justify-center text-sm p-2 rounded-lg hover:bg-background-card transition-all duration-200 text-text-muted"
          >
            <SparklesIcon className="w-4 h-4 mr-2 text-accent" />
            Generar Tareas (IA)
          </button>
        </div>
      )}
    </div>
  );
};

export default List;