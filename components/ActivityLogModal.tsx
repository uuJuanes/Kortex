import React from 'react';
import { Activity, User } from '../types';
import { XIcon } from './icons/XIcon';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  users: User[];
}

const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "hace un momento";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} d`;
    
    return past.toLocaleDateString('es-ES');
};

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, activities, users }) => {
  if (!isOpen) return null;

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 border border-border-default flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-default">Registro de Actividad del Equipo</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto space-y-4 pr-2">
          {activities.length > 0 ? (
            activities.slice().reverse().map(activity => {
              const user = getUserById(activity.userId);
              return (
                <div key={activity.id} className="flex items-start space-x-3 text-sm">
                  <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-text-default">
                      <span className="font-semibold">{user?.name || 'Usuario Desconocido'}</span> {activity.action}
                    </p>
                    <p className="text-xs text-text-muted">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-text-muted text-center py-8">No hay actividad registrada todavía.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;