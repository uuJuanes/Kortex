
import React, { useMemo } from 'react';
import { Team, User, Card, Board } from '../types';
import { getTeamColor } from '../constants';
import { CalendarIcon } from './icons/CalendarIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface MyWorkDashboardProps {
  teams: Team[];
  currentUser: User;
  onCardSelect: (card: Card, board: Board, team: Team) => void;
  onNavigateToBoard: (teamId: string, boardId: string) => void;
}

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const isThisWeek = (date: Date) => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Monday
    firstDayOfWeek.setHours(0,0,0,0);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23,59,59,999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
}

const TaskCard: React.FC<{
    task: { card: Card; board: Board; team: Team; listTitle: string };
    onSelect: () => void;
    onNavigate: () => void;
}> = ({ task, onSelect, onNavigate }) => {
    const { card, board, team } = task;
    const teamColor = getTeamColor(team.id);

    return (
        <div onClick={onSelect} className="bg-background-card p-3 rounded-lg border border-border-default shadow-subtle hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer">
            <h4 className="font-semibold text-text-default mb-1.5">{card.title}</h4>
            <div className="flex justify-between items-center text-xs">
                <button onClick={(e) => { e.stopPropagation(); onNavigate(); }} className="flex items-center gap-2 text-text-muted hover:text-primary">
                    <div className={`w-2.5 h-2.5 rounded-sm bg-gradient-to-r ${teamColor}`}></div>
                    <span className="truncate max-w-[200px]">{team.name} / {board.title}</span>
                </button>
                 {card.dueDate && (
                    <span className={`flex items-center gap-1.5 font-medium ${isOverdue(new Date(card.dueDate)) ? 'text-danger' : 'text-text-muted'}`}>
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(card.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>
        </div>
    );
};


const TaskSection: React.FC<{
    title: string;
    tasks: any[];
    icon: React.ReactNode;
    onCardSelect: (card: Card, board: Board, team: Team) => void;
    onNavigateToBoard: (teamId: string, boardId: string) => void;
}> = ({ title, tasks, icon, onCardSelect, onNavigateToBoard }) => {
    if (tasks.length === 0) return null;
    return (
        <div>
            <h3 className="text-lg font-bold text-text-default mb-3 flex items-center">
                {icon}
                {title}
                <span className="ml-2 text-sm font-semibold bg-background-card text-text-muted px-2 py-0.5 rounded-full border border-border-default">{tasks.length}</span>
            </h3>
            <div className="space-y-2">
                {tasks.map(task => (
                    <TaskCard
                        key={task.card.id}
                        task={task}
                        onSelect={() => onCardSelect(task.card, task.board, task.team)}
                        onNavigate={() => onNavigateToBoard(task.team.id, task.board.id)}
                    />
                ))}
            </div>
        </div>
    );
}

const MyWorkDashboard: React.FC<MyWorkDashboardProps> = ({ teams, currentUser, onCardSelect, onNavigateToBoard }) => {
    
    const assignedTasks = useMemo(() => {
        return teams.flatMap(team =>
            team.boards.flatMap(board =>
                board.lists.flatMap(list =>
                    list.cards
                        .filter(card => card.members.some(m => m.id === currentUser.id))
                        .map(card => ({ card, board, team, listTitle: list.title }))
                )
            )
        );
    }, [teams, currentUser.id]);

    const groupedTasks = useMemo(() => {
        const groups = {
            overdue: [] as any[],
            dueToday: [] as any[],
            dueThisWeek: [] as any[],
            upcoming: [] as any[],
            noDate: [] as any[],
        };

        assignedTasks.forEach(task => {
            if (task.card.dueDate) {
                const dueDate = new Date(task.card.dueDate);
                if (isOverdue(dueDate)) groups.overdue.push(task);
                else if (isToday(dueDate)) groups.dueToday.push(task);
                else if (isThisWeek(dueDate)) groups.dueThisWeek.push(task);
                else groups.upcoming.push(task);
            } else {
                groups.noDate.push(task);
            }
        });

        // Sort tasks within each group by due date
        Object.values(groups).forEach(group => {
            group.sort((a,b) => {
                if (!a.card.dueDate) return 1;
                if (!b.card.dueDate) return -1;
                return new Date(a.card.dueDate).getTime() - new Date(b.card.dueDate).getTime();
            })
        })

        return groups;
    }, [assignedTasks]);

    const firstName = currentUser.name.split(' ')[0];

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-default">Hola, {firstName} 👋</h1>
                <p className="text-text-muted mt-1">Aquí tienes un resumen de tus tareas pendientes.</p>
            </div>
            
            {assignedTasks.length === 0 ? (
                 <div className="text-center py-16 bg-background-card rounded-lg border border-border-default">
                    <h3 className="text-xl font-semibold text-text-default">¡Todo en orden!</h3>
                    <p className="text-text-muted mt-2">No tienes ninguna tarea asignada en este momento.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <TaskSection 
                        title="Vencidas" 
                        tasks={groupedTasks.overdue} 
                        icon={<AlertTriangleIcon className="w-5 h-5 mr-3 text-danger" />}
                        onCardSelect={onCardSelect}
                        onNavigateToBoard={onNavigateToBoard}
                    />
                    <TaskSection 
                        title="Para Hoy" 
                        tasks={groupedTasks.dueToday}
                        icon={<CalendarIcon className="w-5 h-5 mr-3 text-secondary" />}
                        onCardSelect={onCardSelect}
                        onNavigateToBoard={onNavigateToBoard}
                    />
                     <TaskSection 
                        title="Esta Semana" 
                        tasks={groupedTasks.dueThisWeek}
                        icon={<CalendarIcon className="w-5 h-5 mr-3 text-blue-500" />}
                        onCardSelect={onCardSelect}
                        onNavigateToBoard={onNavigateToBoard}
                    />
                     <TaskSection 
                        title="Próximamente" 
                        tasks={groupedTasks.upcoming}
                        icon={<CalendarIcon className="w-5 h-5 mr-3 text-text-muted" />}
                        onCardSelect={onCardSelect}
                        onNavigateToBoard={onNavigateToBoard}
                    />
                     <TaskSection 
                        title="Sin Fecha Límite" 
                        tasks={groupedTasks.noDate}
                        icon={<CalendarIcon className="w-5 h-5 mr-3 text-text-muted" />}
                        onCardSelect={onCardSelect}
                        onNavigateToBoard={onNavigateToBoard}
                    />
                </div>
            )}
        </div>
    );
};

export default MyWorkDashboard;
