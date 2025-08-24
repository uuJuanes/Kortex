import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CogIcon } from './icons/CogIcon';

interface SidebarProps {
  onNavigate: (view: 'teams') => void;
  activeView: string;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, isActive, onClick, disabled }) => (
  <li>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary-light text-primary-text font-bold'
          : 'text-text-muted hover:bg-background-subtle hover:text-text-default'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  return (
    <aside className="w-64 bg-background-subtle flex-shrink-0 flex flex-col border-r border-border-default p-4">
      <div className="flex items-center gap-2 mb-8">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="url(#grad1)" stroke="url(#grad2)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 7L12 12M12 22V12M22 7L12 12M17 4.5L7 9.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
                <linearGradient id="grad1" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
                <linearGradient id="grad2" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93C5FD"/>
                    <stop offset="1" stopColor="#DBEAFE"/>
                </linearGradient>
            </defs>
        </svg>
        <h1 className="text-2xl font-bold text-text-default">Kortex</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          <NavItem
            icon={<UsersGroupIcon className="w-6 h-6" />}
            label="Equipos"
            isActive={activeView === 'teams' || activeView === 'teamDetail' || activeView === 'boardView'}
            onClick={() => onNavigate('teams')}
          />
           <NavItem
            icon={<ClipboardListIcon className="w-6 h-6" />}
            label="Tableros"
            isActive={false}
            onClick={() => {}}
            disabled
          />
          <NavItem
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Métricas"
            isActive={false}
            onClick={() => {}}
            disabled
          />
           <NavItem
            icon={<CogIcon className="w-6 h-6" />}
            label="Configuración"
            isActive={false}
            onClick={() => {}}
            disabled
          />
        </ul>
      </nav>
      <div className="flex-shrink-0 text-xs text-text-muted text-center">
        <p>Kortex &copy; {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
