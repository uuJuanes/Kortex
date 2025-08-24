import React, { useState, useCallback } from 'react';
import { List as ListType, Card as CardType, Board as BoardType, NewCardData, User, UserRole, TaskGenerationContext } from '../types';
import List from './List';
import GenerateTasksModal from './GenerateTasksModal';
import CardDetailModal from './CardDetailModal';
import AddCardModal from './AddCardModal';
import { deleteFile } from '../db';
import ConfirmationModal from './ConfirmationModal';

interface BoardProps {
  board: BoardType;
  onBoardUpdate: (updatedBoard: BoardType) => void;
  users: User[]; // Now receives only the members of the team that owns the board
  currentUser: User;
  currentUserRole?: UserRole;
  logActivity: (action: string) => void;
}

const Board: React.FC<BoardProps> = ({ board, onBoardUpdate, users, currentUser, currentUserRole, logActivity }) => {
  const [draggedItem, setDraggedItem] = useState<{ cardId: string; sourceListId: string } | null>(null);
  const [taskGenerationContext, setTaskGenerationContext] = useState<TaskGenerationContext | null>(null);
  const [editingCard, setEditingCard] = useState<{ card: CardType; listId: string; listTitle: string } | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [targetListIdForNewCard, setTargetListIdForNewCard] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);

  const handleOpenAddCardModal = useCallback((listId: string) => {
    setTargetListIdForNewCard(listId);
    setIsAddCardModalOpen(true);
  }, []);

  const handleCloseAddCardModal = useCallback(() => {
    setIsAddCardModalOpen(false);
    setTargetListIdForNewCard(null);
  }, []);

  const handleDragStart = useCallback((cardId: string, sourceListId: string) => {
    setDraggedItem({ cardId, sourceListId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetListId: string) => {
    if (!draggedItem) return;

    const { cardId, sourceListId } = draggedItem;
    setDraggedItem(null);

    if (sourceListId === targetListId) return;

    let cardToMove: CardType | undefined;
    const newLists = board.lists.map(list => {
      if (list.id === sourceListId) {
        cardToMove = list.cards.find(card => card.id === cardId);
        return { ...list, cards: list.cards.filter(card => card.id !== cardId) };
      }
      return list;
    });

    if (cardToMove) {
      const finalLists = newLists.map(list => {
        if (list.id === targetListId) {
          return { ...list, cards: [...list.cards, cardToMove!] };
        }
        return list;
      });
      onBoardUpdate({ ...board, lists: finalLists });

      const sourceList = board.lists.find(l => l.id === sourceListId);
      const targetList = board.lists.find(l => l.id === targetListId);
      logActivity(`movió la tarjeta "${cardToMove.title}" de "${sourceList?.title}" a "${targetList?.title}".`);
    }
  }, [draggedItem, board, onBoardUpdate, logActivity]);
  
  const handleCardClick = useCallback((card: CardType, listId: string) => {
    const listTitle = board.lists.find(l => l.id === listId)?.title || '';
    setEditingCard({ card, listId, listTitle });
  }, [board.lists]);

  const handleCloseModal = useCallback(() => {
    setEditingCard(null);
  }, []);

  const handleUpdateCard = useCallback((updatedCard: CardType) => {
    if (!editingCard) return;
    
    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.map(card => card.id === updatedCard.id ? updatedCard : card)
    }));
    
    onBoardUpdate({ ...board, lists: updatedLists });
    setEditingCard(prev => (prev ? { ...prev, card: updatedCard } : null));
  }, [editingCard, board, onBoardUpdate]);


  const openAITaskGenerator = (listId: string) => {
    const list = board.lists.find(l => l.id === listId);
    if (list) {
        setTaskGenerationContext({
            listId: list.id,
            listTitle: list.title,
            boardTitle: board.title,
            boardLists: board.lists.map(l => ({ id: l.id, title: l.title })),
        });
    }
  };
  
  const handleAddGeneratedTasks = (newCards: Omit<CardType, 'id' | 'members' | 'labels' | 'checklist' | 'attachments' | 'comments'>[]) => {
    if (!taskGenerationContext) return;

    const updatedLists = board.lists.map(list => {
      if (list.id === taskGenerationContext.listId) {
        const transformedCards: CardType[] = newCards.map((card, index) => ({
          ...card,
          id: `card-ai-${Date.now()}-${index}`,
          members: [],
          labels: [],
          attachments: [],
          comments: [],
        }));
        return { ...list, cards: [...list.cards, ...transformedCards] };
      }
      return list;
    });
    
    onBoardUpdate({ ...board, lists: updatedLists });
  };

  const handleAddCard = (listId: string, cardData: NewCardData) => {
     const newCard: CardType = {
      id: `card-manual-${Date.now()}`,
      title: cardData.title,
      description: cardData.description || '',
      labels: cardData.labels,
      dueDate: cardData.dueDate,
      members: [],
      attachments: [],
      comments: [],
    };
    const updatedLists = board.lists.map(list => {
      if (list.id === listId) {
        return { ...list, cards: [...list.cards, newCard] };
      }
      return list;
    });
    onBoardUpdate({ ...board, lists: updatedLists });
    const list = board.lists.find(l => l.id === listId);
    logActivity(`creó la tarjeta "${newCard.title}" en la lista "${list?.title}".`);
    handleCloseAddCardModal();
  };

  const handleDeleteCard = useCallback((cardId: string) => {
    const card = board.lists.flatMap(l => l.cards).find(c => c.id === cardId);
    if (card) {
      setCardToDelete(card);
    }
  }, [board.lists]);
  
  const handleConfirmDeleteCard = useCallback(async () => {
    if (!cardToDelete) return;
    
    const cardId = cardToDelete.id;
    
    // If the card has attachments, delete them from IndexedDB first
    if (cardToDelete?.attachments && cardToDelete.attachments.length > 0) {
      try {
        const deletePromises = cardToDelete.attachments.map(att => deleteFile(att.id));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Failed to delete attachments from IndexedDB for card:", cardId, error);
      }
    }
    
    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== cardId),
    }));

    onBoardUpdate({ ...board, lists: updatedLists });
    logActivity(`eliminó la tarjeta "${cardToDelete.title}".`);
    setCardToDelete(null);
  }, [cardToDelete, board, onBoardUpdate, logActivity]);

  const handleCancelDeleteCard = () => {
    setCardToDelete(null);
  };
  
  const handleDeleteCardFromModal = useCallback(async (cardId: string) => {
    await handleDeleteCard(cardId);
    handleCloseModal();
  }, [handleDeleteCard, handleCloseModal]);


  return (
    <>
      <div className="flex space-x-4 p-2 min-h-full items-start">
        {board.lists.map(list => (
          <List
            key={list.id}
            list={list}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onOpenAITaskGenerator={openAITaskGenerator}
            onOpenAddCardModal={handleOpenAddCardModal}
            onDeleteCard={handleDeleteCard}
            onCardClick={handleCardClick}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
      {taskGenerationContext && (
        <GenerateTasksModal
          context={taskGenerationContext}
          onClose={() => setTaskGenerationContext(null)}
          onTasksGenerated={handleAddGeneratedTasks}
        />
      )}
      {editingCard && (
        <CardDetailModal
          card={editingCard.card}
          listTitle={editingCard.listTitle}
          users={users}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onClose={handleCloseModal}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCardFromModal}
        />
      )}
       {isAddCardModalOpen && targetListIdForNewCard && (
        <AddCardModal
          listId={targetListIdForNewCard}
          onClose={handleCloseAddCardModal}
          onAddCard={handleAddCard}
        />
      )}
      {cardToDelete && (
        <ConfirmationModal
          isOpen={!!cardToDelete}
          onClose={handleCancelDeleteCard}
          onConfirm={handleConfirmDeleteCard}
          title="Confirmar Eliminación de Tarjeta"
          message={`¿Estás seguro de que quieres eliminar la tarjeta "${cardToDelete.title}"? Esta acción no se puede deshacer.`}
        />
      )}
    </>
  );
};

export default Board;