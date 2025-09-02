

import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CogIcon } from './icons/CogIcon';
import { AppView } from '../App';
import { KortexLogo } from './icons/KortexLogo';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from './icons/ChevronDoubleRightIcon';

interface SidebarProps {
  onNavigate: (view: AppView) => void;
  activeView: AppView;
  isCollapsed: boolean;
  onToggle: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, disabled, isCollapsed }) => (
  <li title={isCollapsed ? label : undefined}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary-light text-primary-text font-bold'
          : 'text-text-muted hover:bg-background-subtle hover:text-text-default'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isCollapsed ? 'justify-center' : ''}`}
    >
      <span className={!isCollapsed ? 'mr-3' : ''}>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView, isCollapsed, onToggle }) => {
  return (
    <aside className={`bg-background-subtle flex-shrink-0 flex flex-col border-r border-border-default p-4 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-8">
          <KortexLogo isCollapsed={isCollapsed} />
      </div>
      <nav className="flex-grow">
        <ul>
          <NavItem
            icon={<BriefcaseIcon className="w-6 h-6" />}
            label="Mi Trabajo"
            isActive={activeView === 'my-work'}
            onClick={() => onNavigate('my-work')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<UsersGroupIcon className="w-6 h-6" />}
            label="Equipos"
            isActive={activeView === 'teams' || activeView === 'teamDetail' || activeView === 'boardView'}
            onClick={() => onNavigate('teams')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Métricas"
            isActive={activeView === 'metrics'}
            onClick={() => onNavigate('metrics')}
            isCollapsed={isCollapsed}
          />
           <NavItem
            icon={<CogIcon className="w-6 h-6" />}
            label="Configuración"
            isActive={false}
            onClick={() => {}}
            disabled
            isCollapsed={isCollapsed}
          />
        </ul>
      </nav>
      <div className="flex-shrink-0">
        <button
          onClick={onToggle}
          title={isCollapsed ? "Expandir barra lateral" : "Ocultar barra lateral"}
          className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-text-muted hover:bg-background-subtle hover:text-text-default ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? <ChevronDoubleRightIcon className="w-6 h-6" /> : <ChevronDoubleLeftIcon className="w-6 h-6" />}
          {!isCollapsed && <span className="ml-3 text-sm font-semibold">Ocultar</span>}
        </button>
        {!isCollapsed && (
          <div className="text-xs text-text-muted text-center mt-2">
            <p>Kortex &copy; {new Date().getFullYear()}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
