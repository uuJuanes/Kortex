import React from 'react';
import { Team, User } from '../types';
import { getTeamColor } from '../constants';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { INITIAL_USERS } from '../constants'; // Import users to resolve names

interface TeamCardProps {
  team: Team;
  onSelect: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelect }) => {
  const teamColor = getTeamColor(team.id);

  const teamMembers = team.members.map(member => 
    INITIAL_USERS.find(user => user.id === member.userId)
  ).filter((u): u is User => !!u);


  return (
    <div
      onClick={onSelect}
      className="bg-background-card rounded-xl shadow-subtle hover:shadow-lg cursor-pointer transition-all duration-300 border border-border-default hover:border-primary/30 group overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
    >
      <div className={`h-2 bg-gradient-to-r ${teamColor}`}></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-text-default break-words pr-4">{team.name}</h3>
            {team.privacy === 'private' ? 
                <LockClosedIcon className="w-5 h-5 text-text-muted flex-shrink-0" title="Equipo Privado" /> :
                <UsersGroupIcon className="w-5 h-5 text-text-muted flex-shrink-0" title="Equipo Público" />
            }
        </div>
        
        <p className="text-sm text-text-muted mb-4 flex-grow">
            {team.boards.length} tablero(s) de proyecto.
        </p>

        <div className="flex -space-x-2 mb-4">
            {teamMembers.slice(0, 5).map(member => (
                <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    title={member.name}
                    className="w-8 h-8 rounded-full border-2 border-background-card"
                />
            ))}
            {teamMembers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-background-subtle border-2 border-background-card flex items-center justify-center text-xs font-bold text-text-muted">
                    +{teamMembers.length - 5}
                </div>
            )}
        </div>

        <div className="mt-auto border-t border-border-default pt-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-primary group-hover:underline">
                Ver Detalles
            </span>
             <ArrowRightIcon className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};

// A small component for the arrow icon
const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);


export default TeamCard;