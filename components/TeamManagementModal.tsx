import React, { useState, useEffect, useRef } from 'react';
import { Team, User, UserRole, TeamPrivacy } from '../types';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TeamIcon } from './icons/UsersIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import CreateUserModal from './CreateUserModal';

interface TeamManagementModalProps {
  team: Team;
  allUsers: User[];
  onClose: () => void;
  onUpdateTeam: (updatedTeam: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  logActivity: (action: string) => void;
  onCreateUser: (name: string, profileSummary: string) => User;
}

const RoleDropdown: React.FC<{
  currentRole: UserRole;
  onChange: (newRole: UserRole) => void;
}> = ({ currentRole, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (role: UserRole) => {
    onChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center text-sm text-text-muted hover:text-text-default">
        {currentRole === UserRole.Admin ? 'Admin' : 'Miembro'}
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-background-card border border-border-default rounded-md shadow-lg z-10">
          <button onClick={() => handleSelect(UserRole.Admin)} className="block w-full text-left px-4 py-2 text-sm text-text-default hover:bg-background-subtle">Admin</button>
          <button onClick={() => handleSelect(UserRole.Member)} className="block w-full text-left px-4 py-2 text-sm text-text-default hover:bg-background-subtle">Miembro</button>
        </div>
      )}
    </div>
  );
};

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ team, allUsers, onClose, onUpdateTeam, onDeleteTeam, logActivity, onCreateUser }) => {
  const [teamName, setTeamName] = useState(team.name);
  const [passcode, setPasscode] = useState(team.passcode || '');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  
  const teamMemberIds = new Set(team.members.map(m => m.userId));
  const availableUsers = allUsers.filter(u => !teamMemberIds.has(u.id));

  useEffect(() => {
    if (availableUsers.length > 0) {
      setSelectedUser(availableUsers[0].id);
    } else {
      setSelectedUser('');
    }
  }, [allUsers, team.members]);

  useEffect(() => {
    setTeamName(team.name);
    setPasscode(team.passcode || '');
  }, [team]);

  const handleUpdateName = () => {
    if (teamName.trim() && teamName.trim() !== team.name) {
      onUpdateTeam({ ...team, name: teamName.trim() });
    }
  };

  const handlePrivacyChange = (newPrivacy: TeamPrivacy) => {
    if (team.privacy !== newPrivacy) {
        const updatedTeam: Partial<Team> & { id: string } = { ...team, privacy: newPrivacy };
        if (newPrivacy === TeamPrivacy.Public) {
          delete updatedTeam.passcode;
        } else if (!updatedTeam.passcode) {
          updatedTeam.passcode = '';
          setPasscode('');
        }
        onUpdateTeam(updatedTeam as Team);
    }
  };

  const handlePasscodeUpdate = () => {
    if (passcode !== team.passcode) {
        if (team.privacy === TeamPrivacy.Private && !passcode.trim()) {
            alert("La clave de acceso no puede estar vacía para un equipo privado.");
            setPasscode(team.passcode || '');
            return;
        }
        onUpdateTeam({ ...team, passcode });
    }
  };

  const handleAddMember = () => {
    if (!selectedUser) return;
    const user = allUsers.find(u => u.id === selectedUser);
    if (!user) return;
    const updatedTeam = {
      ...team,
      members: [...team.members, { userId: selectedUser, role: UserRole.Member }],
    };
    onUpdateTeam(updatedTeam);
    logActivity(`añadió a ${user.name} al equipo.`);
  };

  const handleRemoveMember = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updatedTeam = {
      ...team,
      members: team.members.filter(m => m.userId !== userId),
    };
    onUpdateTeam(updatedTeam);
    logActivity(`eliminó a ${user.name} del equipo.`);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const updatedTeam = {
      ...team,
      members: team.members.map(m => (m.userId === userId ? { ...m, role: newRole } : m)),
    };
    onUpdateTeam(updatedTeam);
    logActivity(`cambió el rol de ${user.name} a ${newRole === UserRole.Admin ? 'Administrador' : 'Miembro'}.`);
  };

  const handleUserCreated = (newUser: User) => {
    const updatedTeam = {
      ...team,
      members: [...team.members, { userId: newUser.id, role: UserRole.Member }],
    };
    onUpdateTeam(updatedTeam);
    logActivity(`creó y añadió a ${newUser.name} al equipo.`);
    setIsCreateUserModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 border border-border-default flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-text-default flex items-center"><TeamIcon className="w-6 h-6 mr-3" />Gestionar Equipo</h2>
            <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle"><XIcon className="w-6 h-6" /></button>
          </div>

          <div className="overflow-y-auto pr-2">
              <div className="mb-6">
                  <label htmlFor="team-name" className="block text-sm font-medium text-text-default mb-1">Nombre del Equipo</label>
                  <input id="team-name" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} onBlur={handleUpdateName} className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary" />
              </div>

              <div className="mb-6">
                  <label className="block text-sm font-medium text-text-default mb-2">Privacidad del Equipo</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button type="button" onClick={() => handlePrivacyChange(TeamPrivacy.Private)} className={`flex items-start text-left p-3 rounded-md border-2 ${team.privacy === TeamPrivacy.Private ? 'border-primary bg-primary-light' : 'border-transparent hover:bg-background-subtle'}`}>
                          <LockClosedIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${team.privacy === TeamPrivacy.Private ? 'text-primary' : 'text-text-muted'}`} />
                          <div>
                              <h4 className="font-semibold text-sm text-text-default">Privado</h4>
                              <p className="text-xs text-text-muted">Solo los miembros pueden ver y encontrar este equipo.</p>
                          </div>
                      </button>
                      <button type="button" onClick={() => handlePrivacyChange(TeamPrivacy.Public)} className={`flex items-start text-left p-3 rounded-md border-2 ${team.privacy === TeamPrivacy.Public ? 'border-primary bg-primary-light' : 'border-transparent hover:bg-background-subtle'}`}>
                          <TeamIcon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${team.privacy === TeamPrivacy.Public ? 'text-primary' : 'text-text-muted'}`} />
                          <div>
                              <h4 className="font-semibold text-sm text-text-default">Público</h4>
                              <p className="text-xs text-text-muted">Cualquiera puede encontrar y ver este equipo.</p>
                          </div>
                      </button>
                  </div>
              </div>

              {team.privacy === TeamPrivacy.Private && (
                <div className="mb-6">
                    <label htmlFor="team-passcode" className="block text-sm font-medium text-text-default mb-1">Clave de Acceso</label>
                    <input id="team-passcode" type="password" value={passcode} onChange={e => setPasscode(e.target.value)} onBlur={handlePasscodeUpdate} className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary" />
                </div>
              )}

              <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-default mb-3">Miembros ({team.members.length})</h3>
                  <div className="space-y-3">
                  {team.members.map(member => {
                      const user = allUsers.find(u => u.id === member.userId);
                      if (!user) return null;
                      return (
                          <div key={user.id} className="flex items-center justify-between bg-background-subtle p-3 rounded-lg">
                              <div className="flex items-center overflow-hidden mr-4">
                                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                                  <p className="text-text-default font-semibold truncate">{user.name}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <RoleDropdown currentRole={member.role} onChange={(newRole) => handleChangeRole(user.id, newRole)} />
                                  <button onClick={() => handleRemoveMember(user.id)} className="p-2 text-text-muted rounded-full hover:bg-danger-light hover:text-danger-text"><TrashIcon className="w-5 h-5" /></button>
                              </div>
                          </div>
                      );
                  })}
                  </div>
              </div>

              <div className="pt-4 border-t border-border-default">
                   <h3 className="text-lg font-semibold text-text-default mb-2">Añadir Miembro</h3>
                   <p className="text-sm text-text-muted mb-3">Añade un miembro existente del sistema o crea un nuevo usuario y añádelo directamente al equipo.</p>
                   
                   <div className="flex items-center gap-3">
                       <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="flex-grow bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary" disabled={availableUsers.length === 0}>
                           {availableUsers.length > 0 ? (
                              availableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)
                           ) : (
                              <option>No hay usuarios para añadir</option>
                           )}
                       </select>
                       <button onClick={handleAddMember} disabled={!selectedUser} className="px-4 py-2.5 text-sm font-semibold text-white bg-secondary rounded-lg hover:bg-secondary/90 flex items-center disabled:bg-border-default disabled:cursor-not-allowed">
                          <PlusIcon className="w-5 h-5 mr-2" />Añadir
                       </button>
                   </div>

                    <div className="relative flex items-center my-4">
                      <div className="flex-grow border-t border-border-default"></div>
                      <span className="flex-shrink mx-4 text-xs text-text-muted">O</span>
                      <div className="flex-grow border-t border-border-default"></div>
                    </div>
                    
                    <button 
                      onClick={() => setIsCreateUserModalOpen(true)}
                      className="w-full px-4 py-2.5 text-sm font-semibold text-text-default bg-background-subtle rounded-lg hover:bg-border-default transition-colors flex items-center justify-center">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Crear y Añadir Nuevo Usuario
                    </button>
              </div>
               
               <div className="mt-8 pt-4 border-t border-danger/30">
                   <h3 className="text-lg font-semibold text-danger mb-2">Zona de Peligro</h3>
                   <div className="flex justify-between items-center p-3 bg-danger-light rounded-lg">
                       <div>
                          <p className="font-semibold text-danger-text">Eliminar este equipo</p>
                          <p className="text-sm text-text-muted">Esta acción es permanente y eliminará el equipo y todos sus tableros.</p>
                       </div>
                       <button onClick={() => onDeleteTeam(team.id)} className="px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg hover:bg-danger/90">Eliminar Equipo</button>
                   </div>
               </div>
          </div>
        </div>
      </div>
       {isCreateUserModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateUserModalOpen(false)}
          onCreateUser={onCreateUser}
          onUserCreated={handleUserCreated}
        />
      )}
    </>
  );
};

export default TeamManagementModal;