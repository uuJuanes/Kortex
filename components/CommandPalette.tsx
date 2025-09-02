
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Team } from '../types';
import { AppView } from '../App';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';

interface CommandPaletteProps {
  teams: Team[];
  onClose: () => void;
  onNavigate: (view: 'my-work' | 'teams') => void;
  onSelectTeam: (teamId: string) => void;
}

type Command = {
  id: string;
  type: 'navigation' | 'team';
  label: string;
  action: () => void;
  icon: React.ReactNode;
};

const CommandPalette: React.FC<CommandPaletteProps> = ({ teams, onClose, onNavigate, onSelectTeam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => [
    {
      id: 'nav-my-work',
      type: 'navigation',
      label: 'Ir a Mi Trabajo',
      action: () => onNavigate('my-work'),
      icon: <BriefcaseIcon className="w-5 h-5 text-text-muted" />,
    },
    {
      id: 'nav-teams',
      type: 'navigation',
      label: 'Ir a Equipos',
      action: () => onNavigate('teams'),
      icon: <UsersGroupIcon className="w-5 h-5 text-text-muted" />,
    },
    ...teams.map(team => ({
      id: `team-${team.id}`,
      type: 'team' as const,
      label: `Ir a equipo: ${team.name}`,
      action: () => onSelectTeam(team.id),
      icon: <UsersGroupIcon className="w-5 h-5 text-text-muted" />,
    })),
  ], [teams, onNavigate, onSelectTeam]);

  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands;
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, commands]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
      <div 
        ref={modalRef}
        className="bg-background-card rounded-xl shadow-lg w-full max-w-xl border border-border-default flex flex-col"
      >
        <div className="flex items-center gap-3 p-3 border-b border-border-default">
          <MagnifyingGlassIcon className="w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Navegar a..."
            className="w-full bg-transparent text-text-default placeholder-text-muted focus:outline-none"
          />
        </div>
        <ul className="p-2 max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <li key={cmd.id}>
                <button
                  onClick={cmd.action}
                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-md text-sm ${
                    index === selectedIndex ? 'bg-background-subtle text-text-default' : 'text-text-muted'
                  }`}
                >
                  {cmd.icon}
                  {cmd.label}
                </button>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-sm text-text-muted">No se encontraron resultados.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
