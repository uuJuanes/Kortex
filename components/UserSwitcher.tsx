import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import AdminPasscodeModal from './AdminPasscodeModal';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface UserSwitcherProps {
  users: User[];
  currentUser: User;
  onUserChange: (user: User) => void;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ users, currentUser, onUserChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const handleSelectUser = (user: User) => {
    if (user.isSystemAdmin && user.id !== currentUser.id) {
      setSelectedUser(user);
      setIsPasscodeModalOpen(true);
    } else {
      onUserChange(user);
    }
    setIsOpen(false);
  };

  const handleVerifyPasscode = (passcode: string): boolean => {
    // In a real app, this would be a secure check.
    const correctPasscode = 'kortexadmin'; 
    if (passcode === correctPasscode && selectedUser) {
      onUserChange(selectedUser);
      setIsPasscodeModalOpen(false);
      setSelectedUser(null);
      return true;
    }
    return false;
  };

  const handleClosePasscodeModal = () => {
    setIsPasscodeModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-background-subtle transition-colors"
          aria-label="Cambiar usuario"
        >
          <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
          <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-text-default truncate max-w-[200px]">{currentUser.name}</p>
          </div>
          <ChevronDownIcon className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-background-card border border-border-default rounded-lg shadow-lg z-20">
            <div className="p-2 text-center text-sm font-semibold text-text-default border-b border-border-default">Cambiar Vista de Usuario</div>
            <ul className="py-1 max-h-60 overflow-y-auto">
              {users.map(user => (
                <li key={user.id}>
                  <button 
                    onClick={() => handleSelectUser(user)} 
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                      currentUser.id === user.id ? 'bg-primary-light text-primary-text' : 'text-text-default hover:bg-background-subtle'
                    }`}
                  >
                    <div className="flex items-center overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full mr-3"/>
                        <span className="truncate">{user.name}</span>
                    </div>
                    {user.isSystemAdmin && (
                        <LockClosedIcon className="w-4 h-4 text-text-muted flex-shrink-0" title="Administrador del sistema" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isPasscodeModalOpen && (
          <AdminPasscodeModal
              onClose={handleClosePasscodeModal}
              onVerify={handleVerifyPasscode}
          />
      )}
    </>
  );
};

export default UserSwitcher;