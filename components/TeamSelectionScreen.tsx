import React, { useState, useMemo } from 'react';
import { Team, TeamPrivacy } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import PasscodeModal from './PasscodeModal';
import CreateTeamModal from './CreateTeamModal';
import TeamCard from './TeamCard';

interface TeamsViewProps {
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onCreateTeam: (name: string, privacy: TeamPrivacy, passcode?: string) => void;
}

const TeamsView: React.FC<TeamsViewProps> = ({ teams, onSelectTeam, onCreateTeam }) => {
  const [teamToJoin, setTeamToJoin] = useState<Team | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTeamClick = (team: Team) => {
    if (team.privacy === TeamPrivacy.Public) {
      onSelectTeam(team.id);
    } else {
      setTeamToJoin(team);
    }
  };
  
  const handleClosePasscodeModal = () => {
    setTeamToJoin(null);
  };

  const handleVerifyPasscode = (passcode: string): boolean => {
    if (teamToJoin && teamToJoin.passcode === passcode) {
      onSelectTeam(teamToJoin.id);
      handleClosePasscodeModal();
      return true;
    }
    return false;
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  return (
    <>
    <main className="flex-grow p-4 sm:p-8 bg-background-default">
         <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="relative flex-grow max-w-lg">
                 <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre de equipo..."
                    className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 pl-10 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </div>
            </div>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
            >
                <PlusIcon className="w-5 h-5" />
                Crear Equipo
            </button>
        </div>
        
        {/* Placeholder for AI suggestions */}
        <div className="mb-6 p-4 bg-accent-light/50 border border-accent/20 rounded-lg text-sm text-accent-text">
            💡 <span className="font-semibold">Sugerencia IA:</span> El equipo de 'Desarrollo Kortex' tiene un 25% más de tareas que el promedio. Considera revisar la carga de trabajo.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} onSelect={() => handleTeamClick(team)} />
            ))}
        </div>
         {filteredTeams.length === 0 && (
            <div className="col-span-full text-center py-16 text-text-muted">
                <h3 className="text-xl font-semibold">No se encontraron equipos</h3>
                <p>Intenta ajustar tu búsqueda o crea un nuevo equipo.</p>
            </div>
        )}
    </main>
    {teamToJoin && (
        <PasscodeModal 
            teamName={teamToJoin.name}
            onClose={handleClosePasscodeModal}
            onVerify={handleVerifyPasscode}
        />
    )}
    {isCreateModalOpen && (
        <CreateTeamModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreateTeam={onCreateTeam}
        />
    )}
    </>
  );
};

export default TeamsView;
