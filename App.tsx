
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Board from './components/Board';
import { INITIAL_USERS, initialTeamsData, LABELS } from './constants';
import { Board as BoardType, List, Card, User, Team, UserRole, TeamPrivacy, Activity, BoardTemplate } from './types';
import GenerateBoardModal from './components/GenerateBoardModal';
import WelcomeScreen from './components/WelcomeScreen';
import ConfirmationModal from './components/ConfirmationModal';
import { findBestUserForTask, generateBoard } from './services/geminiService';
import { deleteFile } from './db';
import TeamBoardsScreen from './components/BoardSelectionScreen';
import UserSwitcher from './components/UserSwitcher';
import AIInsightsModal from './components/AIInsightsModal';
import { SparklesIcon } from './components/icons/SparklesIcon';
import UserSelectionScreen from './components/UserSelectionScreen';
import TeamsView from './components/TeamSelectionScreen';
import { KortexLogo } from './components/icons/KortexLogo';
import TemplateSelectionModal from './components/TemplateSelectionModal';
import TemplateCustomizationModal from './components/TemplateCustomizationModal';

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
  const [isGenerateBoardModalOpen, setIsGenerateBoardModalOpen] = useState(false);
  const [boardToDeleteId, setBoardToDeleteId] = useState<string | null>(null);
  const [isAIInsightsModalOpen, setIsAIInsightsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateCustomizationModalOpen, setIsTemplateCustomizationModalOpen] = useState(false);
  const [selectedTemplateForCustomization, setSelectedTemplateForCustomization] = useState<BoardTemplate | null>(null);

  
  // New state management for views
  const [view, setView] = useState<'welcome' | 'userSelection' | 'app'>('welcome');
  const [appView, setAppView] = useState<'teams' | 'teamDetail' | 'boardView'>('teams');


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

  const handleStartApp = useCallback(() => {
    setView('userSelection');
  }, []);

  const handleSelectUser = useCallback((user: User) => {
    setCurrentUser(user);
    setView('app');
    setAppView('teams');
  }, []);
  
  const handleSelectTeam = useCallback((teamId: string) => {
    setActiveTeamId(teamId);
    setAppView('teamDetail');
  }, []);

  const handleSelectBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    setAppView('boardView');
  }, []);

  const handleNavigateToTeams = useCallback(() => {
    setActiveTeamId(null);
    setActiveBoardId(null);
    setAppView('teams');
  }, []);
  
  const handleCreateBoard = useCallback((title: string) => {
    if (!activeTeamId || !currentUser) return;

    const newBoard: BoardType = {
      id: `board-${Date.now()}`,
      teamId: activeTeamId,
      title,
      lists: [
        { id: 'list-1', title: 'To Do', cards: [] },
        { id: 'list-2', title: 'In Progress', cards: [] },
        { id: 'list-3', title: 'Done', cards: [] },
      ],
    };

    setTeams(prevTeams => prevTeams.map(team => 
        team.id === activeTeamId 
        ? { ...team, boards: [...team.boards, newBoard] } 
        : team
    ));
    logActivity(activeTeamId, currentUser.id, `creó el tablero "${title}".`);
    handleSelectBoard(newBoard.id);
  }, [activeTeamId, handleSelectBoard, logActivity, currentUser]);
  
  const handleSelectTemplate = (template: BoardTemplate) => {
    setSelectedTemplateForCustomization(template);
    setIsTemplateModalOpen(false); // Close the selection modal
    setIsTemplateCustomizationModalOpen(true); // Open the customization modal
  };

  const handleCreateBlankBoardFromTemplate = useCallback((template: BoardTemplate) => {
    if (!activeTeamId || !currentUser) return;

    const newBoard: BoardType = {
      id: `board-tpl-blank-${Date.now()}`,
      teamId: activeTeamId,
      title: template.board.title,
      lists: template.board.lists.map((list, listIndex) => ({
        id: `list-tpl-blank-${Date.now()}-${listIndex}`,
        title: list.title,
        cards: [], // Create empty cards array
      })),
    };

    setTeams(prevTeams => prevTeams.map(team => 
        team.id === activeTeamId
        ? { ...team, boards: [...team.boards, newBoard] }
        : team
    ));
    logActivity(activeTeamId, currentUser.id, `creó el tablero "${newBoard.title}" desde la plantilla (vacía) "${template.name}".`);
    handleSelectBoard(newBoard.id);
    setIsTemplateCustomizationModalOpen(false);
  }, [activeTeamId, currentUser, logActivity, handleSelectBoard]);

  
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
  }, [activeTeamId, teams, users, handleSelectBoard, logActivity, currentUser]);

  const handleUpdateBoard = useCallback((updatedBoard: BoardType) => {
    if (!activeTeamId) return;
    setTeams(prevTeams => prevTeams.map(team => 
        team.id === activeTeamId
        ? { ...team, boards: team.boards.map(b => b.id === updatedBoard.id ? updatedBoard : b) }
        : team
    ));
  }, [activeTeamId]);

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
      handleNavigateToTeams();
    }
  }, [activeTeamId, handleNavigateToTeams]);

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
      case 'teams':
        return (
          <TeamsView
            teams={userTeams}
            onSelectTeam={handleSelectTeam}
            onCreateTeam={handleCreateTeam}
          />
        );
      case 'teamDetail':
        if (!activeTeam) {
            handleNavigateToTeams();
            return null;
        }
        return (
           <TeamBoardsScreen
            team={activeTeam}
            users={users}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onOpenAIGenerator={() => setIsGenerateBoardModalOpen(true)}
            onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
            onRequestDeleteBoard={handleRequestDeleteBoard}
            onUpdateTeam={handleUpdateTeam}
            onDeleteTeam={handleDeleteTeam}
            currentUser={currentUser}
            currentUserRole={activeTeam.members.find(m => m.userId === currentUser.id)?.role}
            logActivity={(action: string) => logActivity(activeTeam.id, currentUser.id, action)}
            onCreateUser={handleCreateUser}
          />
        );
      case 'boardView':
        if (!activeTeam || !activeBoard) {
            handleNavigateToTeams();
            return null;
        }
        const teamMembers = activeTeam.members
            .map(m => users.find(u => u.id === m.userId))
            .filter((u): u is User => !!u);
        const currentUserRole = activeTeam.members.find(m => m.userId === currentUser.id)?.role;
            
        return (
          <main className="flex-grow overflow-x-auto bg-background-subtle">
            <Board 
              key={activeBoard.id} 
              board={activeBoard} 
              onBoardUpdate={handleUpdateBoard}
              users={teamMembers}
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              logActivity={(action: string) => logActivity(activeTeam.id, currentUser.id, action)}
            />
          </main>
        );
      default:
        return <TeamsView teams={userTeams} onSelectTeam={handleSelectTeam} onCreateTeam={handleCreateTeam}/>;
    }
  };

  const getHeaderTitle = () => {
    switch(appView) {
        case 'teams':
            return 'Mis Equipos de Trabajo';
        case 'teamDetail':
            return activeTeam ? `Equipo: ${activeTeam.name}` : 'Cargando...';
        case 'boardView':
            return activeBoard ? activeBoard.title : 'Cargando...';
        default:
            return 'Kortex';
    }
  }


  return (
    <>
      <div className="min-h-screen text-text-default font-sans flex flex-col animate-fadeIn bg-background-default">
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

        <header className="p-3 bg-background-default border-b border-border-default shadow-subtle flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <KortexLogo />
            <div className="w-px h-6 bg-border-default hidden md:block"></div>
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
                <button onClick={handleNavigateToTeams} className="text-sm text-text-muted hover:text-text-default">(Volver a Equipos)</button>
              )}
              {appView === 'boardView' && activeTeamId &&(
                <button onClick={() => { setActiveBoardId(null); setAppView('teamDetail')}} className="text-sm text-text-muted hover:text-text-default">(Volver a {activeTeam?.name})</button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserSwitcher users={users} currentUser={currentUser} onUserChange={setCurrentUser} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderAppView()}
        </div>
      </div>

      {isGenerateBoardModalOpen && (
        <GenerateBoardModal
          onClose={() => setIsGenerateBoardModalOpen(false)}
          onBoardGenerated={handleGenerateBoard}
        />
      )}
      {isTemplateModalOpen && (
        <TemplateSelectionModal
          onClose={() => setIsTemplateModalOpen(false)}
          onTemplateSelected={handleSelectTemplate}
        />
      )}
      {isTemplateCustomizationModalOpen && selectedTemplateForCustomization && (
        <TemplateCustomizationModal
          template={selectedTemplateForCustomization}
          onClose={() => setIsTemplateCustomizationModalOpen(false)}
          onCreateBlank={handleCreateBlankBoardFromTemplate}
          onGenerateWithAI={handleGenerateBoard}
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
    </>
  );
};

export default App;
