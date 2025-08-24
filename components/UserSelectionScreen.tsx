import React, { useState } from 'react';
import { User } from '../types';
import AdminPasscodeModal from './AdminPasscodeModal';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface UserSelectionScreenProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser }) => {
  const [userToAuth, setUserToAuth] = useState<User | null>(null);

  const handleUserClick = (user: User) => {
    if (user.isSystemAdmin) {
      setUserToAuth(user);
    } else {
      onSelectUser(user);
    }
  };

  const handleVerifyPasscode = (passcode: string): boolean => {
    const correctPasscode = 'kortexadmin';
    if (passcode === correctPasscode && userToAuth) {
      onSelectUser(userToAuth);
      setUserToAuth(null);
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="min-h-screen bg-background-subtle flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-text-default sm:text-5xl">¿Quién eres?</h1>
          <p className="mt-4 text-lg text-text-muted">Selecciona tu perfil para acceder a tus equipos y tableros.</p>
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="group bg-background-card p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 text-center flex flex-col items-center border border-border-default focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-subtle"
            >
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 border-4 border-background-subtle group-hover:border-primary/50 transition-colors" />
              <h2 className="font-semibold text-text-default text-base">{user.name}</h2>
              {user.isSystemAdmin && (
                <div className="mt-2 flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  <LockClosedIcon className="w-3 h-3 mr-1.5" />
                  Admin del Sistema
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      {userToAuth && (
        <AdminPasscodeModal
          onClose={() => setUserToAuth(null)}
          onVerify={handleVerifyPasscode}
        />
      )}
    </>
  );
};

export default UserSelectionScreen;
