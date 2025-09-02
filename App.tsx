



import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Board from './components/Board';
import { INITIAL_USERS, initialTeamsData, LABELS } from './constants';
import { Board as BoardType, List, Card, User, Team, UserRole, TeamPrivacy, Activity, BoardTemplate, TeamChatMessage } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import ConfirmationModal from './components/ConfirmationModal';
import { findBestUserForTask } from './services/geminiService';
import { deleteFile } from './db';
import TeamBoardsScreen from './components/TeamBoardsScreen';
import UserSwitcher from './components/UserSwitcher';
import AIInsightsModal from './components/AIInsightsModal';
import { SparklesIcon } from './components/icons/SparklesIcon';
import UserSelectionScreen from './components/UserSelectionScreen';
import TeamsView from './components/TeamSelectionScreen';
import TemplateSelectionModal from './components/TemplateSelectionModal';
import TemplateCustomizationModal from './components/TemplateCustomizationModal';
import { ChatBubbleLeftRightIcon } from './components/icons/ChatBubbleLeftRightIcon';
import ChatWindow from './components/Chat/ChatWindow';
import Sidebar from './components/Sidebar';
import MyWorkDashboard from './components/MyWorkDashboard';
import CardDetailModal from './components/CardDetailModal';
import { MenuIcon } from './components/icons/MenuIcon';
import MetricsView from './components/MetricsView';
import CommandPalette from './components/CommandPalette';


// This interface now describes the rich, professional board structure we expect from the AI.
export interface AIGeneratedCard {
  title: string;
  description: string;
  labels: {
    text: string;
    color: string;
  }[];
  assignedRole?: string;
  dueDate?: string;
  checklist?: {
    title: string;
    items: { text: string }[];
  };
}

export interface AIGeneratedList {
  title: string;
  cards: AIGeneratedCard[];
}

export interface AIGeneratedBoard {
  title: string;
  lists: AIGeneratedList[];
}

export type AppView = 'my-work' | 'teams' | 'teamDetail' | 'boardView' | 'metrics';


const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const savedTeams = localStorage.getItem('kortex-teams');
      return savedTeams ? JSON.parse(savedTeams) : initialTeamsData;
    } catch (error) {
      console.error("Error loading teams from localStorage", error);
      return initialTeamsData;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('kortex-users');
      return savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    } catch (error) {
      console.error("Error loading users from localStorage", error);
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    try {
      localStorage.setItem('kortex-teams', JSON.stringify(teams));
    } catch (error) {
      console.error("Error saving teams to localStorage", error);
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('kortex-users', JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage", error);
    }
  }, [users]);
  
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [boardToDeleteId, setBoardToDeleteId] = useState<string | null>(null);
  const [isAIInsightsModalOpen, setIsAIInsightsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateCustomizationModalOpen, setIsTemplateCustomizationModalOpen] = useState(false);
  const [templateToCustomize, setTemplateToCustomize] = useState<BoardTemplate | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingCardContext, setEditingCardContext] = useState<{ card: Card; listId: string; listTitle: string; board: BoardType; team: Team; } | null>(null);

  
  // New state management for views
  const [view, setView] = useState<'welcome' | 'userSelection' | 'app'>('welcome');
  const [appView, setAppView] = useState<AppView>('my-work');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const logActivity = useCallback((teamId: string, userId: string, action: string) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id === teamId) {
          const newActivity: Activity = {
            id: `activity-${Date.now()}`,
            userId,
            action,
            timestamp: new Date().toISOString(),
          };
          const updatedLog = [...(team.activityLog || []), newActivity];
          return { ...team, activityLog: updatedLog };
        }
        return team;
      });
    });
  }, []);
  
  const handleSendMessageToTeam = useCallback((teamId: string, text: string) => {
    if (!currentUser) return;

    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id === teamId) {
          const newMessage: TeamChatMessage = {
            id: `msg-team-${Date.now()}`,
            userId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
          };
          const updatedChatLog = [...(team.chatLog || []), newMessage];
          return { ...team, chatLog: updatedChatLog };
        }
        return team;
      });
    });
  }, [currentUser]);

  const handleStartApp = useCallback(() => {
    setView('userSelection');
  }, []);

  const handleSelectUser = useCallback((user: User) => {
    setCurrentUser(user);
    setView('app');
    setAppView('my-work');
  }, []);
  
  const handleSelectTeam = useCallback((teamId: string) => {
    setActiveTeamId(teamId);
    setAppView('teamDetail');
  }, []);

  const handleSelectBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    setAppView('boardView');
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    setAppView(view);
    setActiveTeamId(null);
    setActiveBoardId(null);
  }, []);
  
  const handleCreateBoardFromBlankTemplate = useCallback((template: BoardTemplate) => {
    if (!activeTeamId || !currentUser) return;
    
    const boardTitle = prompt("Introduce el título para tu nuevo tablero:", template.board.title);
    if (!boardTitle) return; // User cancelled

    const newBoard: BoardType = {
      id: `board-blank-${Date.now()}`,
      teamId: activeTeamId,
      title: boardTitle,
      lists: template.board.lists.map((list, listIndex) => ({
        id: `list-blank-${Date.now()}-${listIndex}`,
        title: list.title,
        cards: [],
      })),
    };

    setTeams(prevTeams => prevTeams.map(team => 
        team.id === activeTeamId
        ? { ...team, boards: [...team.boards, newBoard] }
        : team
    ));
    logActivity(activeTeamId, currentUser.id, `creó el tablero "${newBoard.title}" desde una plantilla en blanco.`);
    handleSelectBoard(newBoard.id);
  }, [activeTeamId, currentUser, logActivity, handleSelectBoard]);

  const handleSelectTemplate = (template: BoardTemplate) => {
    setIsTemplateModalOpen(false);
    if (template.id === 'template-blank') {
        handleCreateBoardFromBlankTemplate(template);
    } else {
        setTemplateToCustomize(template);
        setIsTemplateCustomizationModalOpen(true);
    }
  };
  
  const handleGenerateBoard = useCallback(async (generatedBoard: AIGeneratedBoard) => {
    if (!activeTeamId || !currentUser) return;

    const teamMembers = teams.find(t => t.id === activeTeamId)?.members.map(m => users.find(u => u.id === m.userId)).filter(Boolean) as User[];
    
    const newBoard: BoardType = {
      id: `board-ai-${Date.now()}`,
      teamId: activeTeamId,
      title: generatedBoard.title,
      lists: await Promise.all(generatedBoard.lists.map(async (list, listIndex): Promise<List> => {
        const cardsWithAssignments = await Promise.all(list.cards.map(async (card, cardIndex): Promise<Card> => {
          let assignedMembers: User[] = [];
          if (teamMembers.length > 0) {
            try {
              const bestUserId = await findBestUserForTask({ title: card.title, description: card.description }, teamMembers);
              const assignedUser = teamMembers.find(u => u.id === bestUserId);
              if (assignedUser) {
                assignedMembers.push(assignedUser);
              }
            } catch (e) {
              console.error(`Could not assign user for card: ${card.title}`, e);
            }
          }

          return {
            id: `card-ai-${Date.now()}-${listIndex}-${cardIndex}`,
            title: card.title,
            description: card.description,
            dueDate: card.dueDate,
            labels: card.labels.map((label, labelIndex) => ({
              id: `label-ai-${Date.now()}-${listIndex}-${cardIndex}-${labelIndex}`,
              ...label,
            })),
            members: assignedMembers,
            attachments: [],
            comments: [],
            checklist: card.checklist
              ? {
                  title: card.checklist.title,
                  items: card.checklist.items.map((item, itemIndex) => ({
                    id: `chk-ai-${Date.now()}-${listIndex}-${cardIndex}-${itemIndex}`,
                    text: item.text,
                    completed: false,
                  })),
                }
              : undefined,
          };
        }));
        
        return {
          id: `list-ai-${Date.now()}-${listIndex}`,
          title: list.title,
          cards: cardsWithAssignments,
        };
      })),
    };

    setTeams(prevTeams => prevTeams.map(team => 
        team.id === activeTeamId
        ? { ...team, boards: [...team.boards, newBoard] }
        : team
    ));
    logActivity(activeTeamId, currentUser.id, `generó el tablero "${generatedBoard.title}" usando IA.`);
    handleSelectBoard(newBoard.id);
    setIsTemplateCustomizationModalOpen(false);
    setTemplateToCustomize(null);
  }, [activeTeamId, teams, users, handleSelectBoard, logActivity, currentUser]);

  const handleUpdateBoard = useCallback((updatedBoard: BoardType) => {
    if (!activeTeamId && !editingCardContext) return;
    const teamIdToUpdate = activeTeamId || editingCardContext?.team.id;
    if (!teamIdToUpdate) return;
    
    setTeams(prevTeams => prevTeams.map(team => 
        team.id === teamIdToUpdate
        ? { ...team, boards: team.boards.map(b => b.id === updatedBoard.id ? updatedBoard : b) }
        : team
    ));
  }, [activeTeamId, editingCardContext]);
  
  const handleUpdateCardInBoard = (updatedCard: Card) => {
    const context = editingCardContext;
    if(!context) return;
    
    const updatedLists = context.board.lists.map(list => ({
      ...list,
      cards: list.cards.map(card => card.id === updatedCard.id ? updatedCard : card)
    }));
    
    handleUpdateBoard({ ...context.board, lists: updatedLists });
    setEditingCardContext(prev => (prev ? { ...prev, card: updatedCard } : null));
  };


  const handleRequestDeleteBoard = useCallback((boardId: string) => {
    setBoardToDeleteId(boardId);
  }, []);

  const handleCancelDeleteBoard = useCallback(() => {
    setBoardToDeleteId(null);
  }, []);

  const handleConfirmDeleteBoard = useCallback(async () => {
    if (!boardToDeleteId || !activeTeamId || !currentUser) return;

    const team = teams.find(t => t.id === activeTeamId);
    const boardToDelete = team?.boards.find(b => b.id === boardToDeleteId);
    
    if (boardToDelete) {
      const attachmentIdsToDelete: string[] = [];
      boardToDelete.lists.forEach(list => {
        list.cards.forEach(card => {
          card.attachments?.forEach(att => attachmentIdsToDelete.push(att.id));
        });
      });

      if (attachmentIdsToDelete.length > 0) {
        try {
          await Promise.all(attachmentIdsToDelete.map(id => deleteFile(id)));
        } catch (error) {
          console.error("Failed to delete attachments from IndexedDB:", error);
        }
      }
    }
    
    setTeams(prevTeams => prevTeams.map(team => 
      team.id === activeTeamId
      ? { ...team, boards: team.boards.filter(b => b.id !== boardToDeleteId) }
      : team
    ));

    if (boardToDelete) {
      logActivity(activeTeamId, currentUser.id, `eliminó el tablero "${boardToDelete.title}".`);
    }

    if (activeBoardId === boardToDeleteId) {
      setAppView('teamDetail');
      setActiveBoardId(null);
    }
    setBoardToDeleteId(null);
  }, [boardToDeleteId, activeBoardId, activeTeamId, teams, logActivity, currentUser]);

  const handleCreateTeam = useCallback((name: string, privacy: TeamPrivacy, passcode?: string) => {
    if (!currentUser) return;
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      privacy,
      ...(privacy === TeamPrivacy.Private && { passcode }),
      members: [{ userId: currentUser.id, role: UserRole.Admin }],
      boards: [],
      activityLog: [],
      chatLog: [],
    };
    setTeams(prev => [...prev, newTeam]);
    handleSelectTeam(newTeam.id);
  }, [currentUser, handleSelectTeam]);

  const handleUpdateTeam = useCallback((updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  }, []);

  const handleDeleteTeam = useCallback((teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    if (activeTeamId === teamId) {
      handleNavigate('teams');
    }
  }, [activeTeamId, handleNavigate]);

  const handleCreateUser = useCallback((name: string, profileSummary: string): User => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        profileSummary,
        avatar: `https://picsum.photos/seed/${Date.now()}/32/32`,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    return newUser;
  }, []);

  const handleSelectCardFromDashboard = useCallback((card: Card, board: BoardType, team: Team) => {
    const list = board.lists.find(l => l.cards.some(c => c.id === card.id));
    if (list) {
        setEditingCardContext({ card, listId: list.id, listTitle: list.title, board, team });
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };


  const userTeams = useMemo(() => {
      if (!currentUser) return [];
      return teams.filter(team => team.members.some(m => m.userId === currentUser.id));
  }, [teams, currentUser]);
  
  const activeTeam = teams.find(t => t.id === activeTeamId);
  const activeBoard = activeTeam?.boards.find(b => b.id === activeBoardId);
  const boardToDelete = activeTeam?.boards.find(b => b.id === boardToDeleteId);
  
  if (view === 'welcome') {
    return <WelcomeScreen onStart={handleStartApp} />;
  }
  
  if (view === 'userSelection' || !currentUser) {
    return <UserSelectionScreen users={users} onSelectUser={handleSelectUser} />;
  }

  const renderAppView = () => {
    switch(appView) {
      case 'my-work':
        return (
            <MyWorkDashboard
                teams={userTeams}
                currentUser={currentUser}
                onCardSelect={handleSelectCardFromDashboard}
                onNavigateToBoard={(teamId, boardId) => {
                    setActiveTeamId(teamId);
                    handleSelectBoard(boardId);
                }}
            />
        );
      case 'teams':
        return (
          <TeamsView
            teams={userTeams}
            onSelectTeam={handleSelectTeam}
            onCreateTeam={handleCreateTeam}
          />
        );
      case 'metrics':
        return (
          <MetricsView
            teams={userTeams}
            users={users}
            currentUser={currentUser}
          />
        );
      case 'teamDetail':
        if (!activeTeam) {
            handleNavigate('teams');
            return null;
        }
        return (
           <TeamBoardsScreen
            team={activeTeam}
            users={users}
            onSelectBoard={handleSelectBoard}
            onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
            onRequestDeleteBoard={handleRequestDeleteBoard}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
            currentUser={currentUser}
            currentUserRole={activeTeam.members.find(m => m.userId === currentUser.id)?.role}
            logActivity={(action: string) => logActivity(activeTeam.id, currentUser.id, action)}
            onCreateUser={handleCreateUser}
            onSendMessage={handleSendMessageToTeam}
          />
        );
      case 'boardView':
        if (!activeTeam || !activeBoard) {
            handleNavigate('teams');
            return null;
        }
        const teamMembers = activeTeam.members
            .map(m => users.find(u => u.id === m.userId))
            .filter((u): u is User => !!u);
        const currentUserRole = activeTeam.members.find(m => m.userId === currentUser.id)?.role;
            
        return (
          <Board 
            key={activeBoard.id} 
            board={activeBoard} 
            onBoardUpdate={handleUpdateBoard}
            users={teamMembers}
            currentUser={currentUser}
            currentUserRole={currentUserRole}
            logActivity={(action: string) => logActivity(activeTeam.id, currentUser.id, action)}
          />
        );
      default:
        return <TeamsView teams={userTeams} onSelectTeam={handleSelectTeam} onCreateTeam={handleCreateTeam}/>;
    }
  };

  const getHeaderTitle = () => {
    switch(appView) {
        case 'my-work':
            return 'Mi Espacio de Trabajo';
        case 'teams':
            return 'Mis Equipos';
        case 'metrics':
            return 'Métricas y Reportes';
        case 'teamDetail':
            return activeTeam ? `${activeTeam.name}` : 'Cargando...';
        case 'boardView':
            return activeBoard ? activeBoard.title : 'Cargando...';
        default:
            return 'Kortex';
    }
  }


  return (
    <>
      <div className="h-screen text-text-default font-sans flex animate-fadeIn bg-background-default">
         <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-in-out;
            }
          `}
        </style>
        
        <Sidebar 
            onNavigate={handleNavigate} 
            activeView={appView} 
            isCollapsed={isSidebarCollapsed}
            onToggle={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
             <header className="p-3 bg-background-default/80 backdrop-blur-sm border-b border-border-default shadow-subtle flex items-center justify-between flex-shrink-0 z-10">
              <div className="flex items-center gap-4">
                {isSidebarCollapsed && (
                    <button
                        onClick={handleToggleSidebar}
                        className="p-2 rounded-full text-text-muted hover:bg-background-subtle"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-text-default">{getHeaderTitle()}</h1>
                  {appView === 'boardView' && (
                    <button
                      onClick={() => setIsAIInsightsModalOpen(true)}
                      className="ml-2 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-accent-text bg-accent-light rounded-lg hover:bg-opacity-80 transition-colors shadow-sm"
                      title="Obtener análisis y sugerencias de la IA"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Análisis IA</span>
                    </button>
                  )}
                  {appView === 'teamDetail' && (
                    <button onClick={() => handleNavigate('teams')} className="text-sm text-text-muted hover:text-text-default">(Volver a Equipos)</button>
                  )}
                  {appView === 'boardView' && activeTeamId &&(
                    <button onClick={() => { setActiveBoardId(null); setAppView('teamDetail')}} className="text-sm text-text-muted hover:text-text-default">(Volver a {activeTeam?.name})</button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <button onClick={() => setIsCommandPaletteOpen(true)} className="hidden sm:flex items-center gap-2 text-sm text-text-muted border border-border-default rounded-lg px-3 py-1.5 hover:bg-background-subtle">
                    Buscar...
                    <kbd className="font-sans font-semibold"><span className="text-xs">⌘</span>K</kbd>
                </button>
                <UserSwitcher users={users} currentUser={currentUser} onUserChange={setCurrentUser} />
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto bg-background-subtle">
                 {renderAppView()}
            </main>
        </div>
      </div>
      
      {view === 'app' && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-default focus:ring-primary z-50"
          aria-label="Abrir asistente de IA"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7" />
        </button>
      )}

      {isChatOpen && currentUser && (
        <ChatWindow
          currentUser={currentUser}
          onClose={() => setIsChatOpen(false)}
        />
      )}
       {isCommandPaletteOpen && currentUser && (
        <CommandPalette
            teams={userTeams}
            onClose={() => setIsCommandPaletteOpen(false)}
            onNavigate={(view) => {
                handleNavigate(view);
                setIsCommandPaletteOpen(false);
            }}
            onSelectTeam={(teamId) => {
                handleSelectTeam(teamId);
                setIsCommandPaletteOpen(false);
            }}
        />
       )}

      {isTemplateModalOpen && (
        <TemplateSelectionModal
          onClose={() => setIsTemplateModalOpen(false)}
          onTemplateSelected={handleSelectTemplate}
        />
      )}
      {isTemplateCustomizationModalOpen && templateToCustomize && (
        <TemplateCustomizationModal
          template={templateToCustomize}
          onClose={() => {
            setIsTemplateCustomizationModalOpen(false);
            setTemplateToCustomize(null);
          }}
          onGenerate={handleGenerateBoard}
        />
      )}
       {boardToDelete && (
        <ConfirmationModal
          isOpen={!!boardToDelete}
          onClose={handleCancelDeleteBoard}
          onConfirm={handleConfirmDeleteBoard}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar el tablero "${boardToDelete.title}"? Esta acción es permanente y no se puede deshacer.`}
        />
      )}
       {isAIInsightsModalOpen && activeBoard && activeTeam && currentUser && (
          <AIInsightsModal
            board={activeBoard}
            users={activeTeam.members.map(m => users.find(u => u.id === m.userId)).filter(Boolean) as User[]}
            onClose={() => setIsAIInsightsModalOpen(false)}
          />
      )}
      {editingCardContext && (
         <CardDetailModal
            card={editingCardContext.card}
            listTitle={editingCardContext.listTitle}
            users={editingCardContext.team.members.map(m => users.find(u => u.id === m.userId)).filter(Boolean) as User[]}
            currentUser={currentUser}
            currentUserRole={editingCardContext.team.members.find(m => m.userId === currentUser.id)?.role}
            onClose={() => setEditingCardContext(null)}
            onUpdateCard={handleUpdateCardInBoard}
            onDeleteCard={async (cardId) => {
                // This is a simplified delete from dashboard, it doesn't use the full board delete flow
                const updatedBoard = {
                    ...editingCardContext.board,
                    lists: editingCardContext.board.lists.map(l => ({...l, cards: l.cards.filter(c => c.id !== cardId)}))
                };
                handleUpdateBoard(updatedBoard);
                setEditingCardContext(null);
            }}
        />
      )}
    </>
  );
};

export default App;