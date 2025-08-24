
import React, { useState, useMemo } from 'react';
import { Board, Team, User, UserRole, BoardTemplate } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import TeamManagementModal from './TeamManagementModal';
import { CogIcon } from './icons/CogIcon';
import ActivityLogModal from './ActivityLogModal';
import BoardCard from './BoardCard';
import TeamDashboard from './TeamDashboard';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import TemplateSelectionModal from './TemplateSelectionModal';
import { TemplateIcon } from './icons/TemplateIcon';


const MemberList: React.FC<{ team: Team, users: User[] }> = ({ team, users }) => {
    const teamMembers = team.members.map(member => {
        const user = users.find(u => u.id === member.userId);
        return user ? { ...user, role: member.role } : null;
    }).filter((u): u is User & { role: UserRole } => !!u);

    return (
        <div className="bg-background-subtle p-4 rounded-lg border border-border-default h-full">
            <h3 className="font-semibold text-text-default mb-3 flex items-center">
                <UsersGroupIcon className="w-5 h-5 mr-3 text-secondary" />
                Miembros del Equipo ({teamMembers.length})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center">
                        <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full mr-3"/>
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-text-default">{member.name}</p>
                            <p className="text-xs text-text-muted">{member.role === UserRole.Admin ? 'Administrador' : 'Miembro'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface TeamBoardsScreenProps {
  team: Team;
  users: User[]; // Global list of all users
  currentUser: User;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string) => void;
  onOpenAIGenerator: () => void;
  onOpenTemplateSelector: () => void;
  onRequestDeleteBoard: (boardId: string) => void;
  onUpdateTeam: (updatedTeam: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  currentUserRole?: UserRole;
  logActivity: (action: string) => void;
  onCreateUser: (name: string, profileSummary: string) => User;
}

const CreateBoardCard: React.FC<{ onCreateBoard: (title: string) => void }> = ({ onCreateBoard }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');

    const handleCreate = () => {
        if (title.trim()) {
            onCreateBoard(title.trim());
            setTitle('');
            setIsCreating(false);
        }
    };

    if (!isCreating) {
        return (
            <button
                onClick={() => setIsCreating(true)}
                className="w-full h-full min-h-[160px] border-2 border-dashed border-border-default rounded-lg flex flex-col items-center justify-center text-text-muted hover:bg-background-subtle hover:border-primary transition-colors duration-300"
            >
                <PlusIcon className="w-10 h-10 mb-2" />
                <span className="font-semibold">Crear Tablero Vacío</span>
            </button>
        );
    }

    return (
        <div className="w-full h-full bg-background-card rounded-lg p-4 flex flex-col justify-between border-2 border-primary">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del tablero..."
                className="w-full bg-background-subtle border border-border-default rounded-md p-2 text-sm text-text-default focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex items-center justify-end space-x-2 mt-3">
                 <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs text-text-muted rounded-md hover:bg-background-subtle">Cancelar</button>
                <button onClick={handleCreate} className="px-3 py-1 text-xs text-white bg-primary rounded-md hover:bg-primary/90">Crear</button>
            </div>
        </div>
    )
};

const AIGenerateCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
    <button
        onClick={onOpen}
        className="w-full h-full min-h-[160px] border-2 border-dashed border-border-default rounded-lg flex flex-col items-center justify-center text-text-muted hover:bg-background-subtle hover:border-primary transition-colors duration-300 relative overflow-hidden group"
    >
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        <SparklesIcon className="w-10 h-10 mb-2 text-accent" />
        <span className="font-semibold z-10">Generar con IA</span>
    </button>
);

const TemplateCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
    <button
        onClick={onOpen}
        className="w-full h-full min-h-[160px] border-2 border-dashed border-border-default rounded-lg flex flex-col items-center justify-center text-text-muted hover:bg-background-subtle hover:border-primary transition-colors duration-300 relative overflow-hidden group"
    >
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        <TemplateIcon className="w-10 h-10 mb-2 text-secondary" />
        <span className="font-semibold z-10">Crear desde Plantilla</span>
    </button>
);


const TeamBoardsScreen: React.FC<TeamBoardsScreenProps> = ({
  team,
  users,
  currentUser,
  onSelectBoard,
  onCreateBoard,
  onOpenAIGenerator,
  onOpenTemplateSelector,
  onRequestDeleteBoard,
  onUpdateTeam,
  onDeleteTeam,
  currentUserRole,
  logActivity,
  onCreateUser
}) => {
    const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
    const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
    
    const boardMetrics = useMemo(() => {
        const doneListTitles = ['hecho', 'done', 'finalizado'];
        return team.boards.map(board => {
            const allCards = board.lists.flatMap(l => l.cards);
            
            const doneCardsInBoard = board.lists
                .filter(l => doneListTitles.includes(l.title.toLowerCase()))
                .flatMap(l => l.cards);
            const doneCardIdsInBoard = new Set(doneCardsInBoard.map(c => c.id));

            const totalTasks = allCards.length;
            const progress = totalTasks > 0 ? (doneCardsInBoard.length / totalTasks) * 100 : 0;
            const overdueTasks = allCards.filter(c => c.dueDate && new Date(c.dueDate) < new Date() && !doneCardIdsInBoard.has(c.id)).length;
            const assignedMembers = [...new Map(allCards.flatMap(c => c.members).map(m => [m.id, m])).values()];
            return { boardId: board.id, progress, totalTasks, overdueTasks, assignedMembers };
        });
    }, [team.boards]);

    return (
    <>
        <main className="flex-grow p-4 sm:p-8 bg-background-default">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <div>
                    <p className="text-text-muted mt-1">Visión general del equipo y sus proyectos.</p>
                </div>
                <div className="flex items-center gap-3">
                     <button
                        onClick={() => setIsActivityLogOpen(true)}
                        className="px-4 py-2 text-sm font-semibold text-text-muted bg-background-card rounded-lg hover:bg-background-subtle border border-border-default transition-colors flex items-center gap-2"
                    >
                        Registro de Actividad
                    </button>
                    {currentUserRole === UserRole.Admin && (
                        <button
                            onClick={() => setIsTeamManagementOpen(true)}
                            className="px-4 py-2 text-sm font-semibold text-text-default bg-background-card rounded-lg hover:bg-background-subtle border border-border-default transition-colors flex items-center gap-2"
                        >
                            <CogIcon className="w-5 h-5" />
                            Gestionar Equipo
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TeamDashboard team={team} users={users} />
                </div>
                 <div className="lg:col-span-1">
                    <MemberList team={team} users={users} />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-text-default mt-8 mb-4">Tableros del Proyecto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {team.boards.map(board => {
                    const metrics = boardMetrics.find(m => m.boardId === board.id)!;
                    return (
                        <div key={board.id} className="aspect-[4/3]">
                             <BoardCard
                                board={board}
                                progress={metrics.progress}
                                totalTasks={metrics.totalTasks}
                                overdueTasks={metrics.overdueTasks}
                                assignedMembers={metrics.assignedMembers}
                                onSelect={() => onSelectBoard(board.id)}
                                onRequestDelete={onRequestDeleteBoard}
                                canDelete={currentUserRole === UserRole.Admin}
                             />
                        </div>
                    );
                })}
                 <div className="aspect-[4/3]">
                    <CreateBoardCard onCreateBoard={onCreateBoard} />
                </div>
                 <div className="aspect-[4/3]">
                    <AIGenerateCard onOpen={onOpenAIGenerator} />
                </div>
                 <div className="aspect-[4/3]">
                    <TemplateCard onOpen={onOpenTemplateSelector} />
                </div>
            </div>
        </main>

        {isTeamManagementOpen && (
            <TeamManagementModal
                team={team}
                allUsers={users}
                onClose={() => setIsTeamManagementOpen(false)}
                onUpdateTeam={onUpdateTeam}
                onDeleteTeam={onDeleteTeam}
                logActivity={logActivity}
                onCreateUser={onCreateUser}
            />
        )}
        {isActivityLogOpen && (
             <ActivityLogModal
                isOpen={isActivityLogOpen}
                onClose={() => setIsActivityLogOpen(false)}
                activities={team.activityLog || []}
                users={users}
            />
        )}
    </>
    );
};

export default TeamBoardsScreen;
