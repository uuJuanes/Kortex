import React, { useState, useRef, useEffect } from 'react';
import { Team, User } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface TeamChatViewProps {
    team: Team;
    currentUser: User;
    users: User[];
    onSendMessage: (messageText: string) => void;
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
    
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const TeamChatView: React.FC<TeamChatViewProps> = ({ team, currentUser, users, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const getUserById = (userId: string) => users.find(u => u.id === userId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [team.chatLog]);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [newMessage]);
    
    const handleSendMessage = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-background-card border border-border-default rounded-lg shadow-md">
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {(team.chatLog || []).length === 0 && (
                        <div className="text-center py-16 text-text-muted">
                            <h3 className="font-semibold">¡Empieza la conversación!</h3>
                            <p className="text-sm">Envía el primer mensaje al equipo {team.name}.</p>
                        </div>
                    )}
                    {(team.chatLog || []).map(message => {
                        const sender = getUserById(message.userId);
                        const isCurrentUser = message.userId === currentUser.id;
                        return (
                            <div key={message.id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                                {!isCurrentUser && sender && (
                                    <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                )}
                                <div className="flex flex-col" style={{ alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                     {!isCurrentUser && sender && (
                                        <span className="text-xs text-text-muted mb-1 ml-2">{sender.name.split(' ')[0]}</span>
                                    )}
                                    <div className={`max-w-md rounded-xl px-3.5 py-2.5 text-sm break-words ${isCurrentUser ? 'bg-primary text-white rounded-br-none' : 'bg-background-subtle text-text-default rounded-bl-none'}`}>
                                        {message.text}
                                    </div>
                                    <span className="text-xs text-text-muted mt-1 mx-2">{formatRelativeTime(message.timestamp)}</span>
                                </div>
                                 {isCurrentUser && sender && (
                                    <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
                 <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-3 border-t border-border-default bg-background-card rounded-b-lg">
                <div className="flex items-center gap-2 bg-background-subtle rounded-lg border border-border-default focus-within:ring-2 focus-within:ring-primary">
                    <textarea
                        ref={textAreaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={`Enviar mensaje a #${team.name}`}
                        className="flex-grow bg-transparent p-2.5 text-sm text-text-default placeholder-text-muted focus:outline-none resize-none max-h-32"
                        rows={1}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 text-white bg-primary rounded-md m-1.5 hover:bg-primary/90 disabled:bg-border-default disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar mensaje"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamChatView;
