

import React, { useState, useEffect, useRef } from 'react';
import { NewCardData, Label, User, Attachment } from '../types';
import { LABELS } from '../constants';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { getTaskSuggestions } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { addFile, deleteFile } from '../db';
import { AttachmentIcon } from './icons/AttachmentIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { FileIcon } from './icons/FileIcon';
import { ImageIcon } from './icons/ImageIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AddCardModalProps {
  listId: string;
  users: User[];
  onClose: () => void;
  onAddCard: (listId: string, cardData: NewCardData) => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getFileIcon = (mimeType: string): React.ReactNode => {
    if (mimeType.startsWith('image/')) {
        return <ImageIcon className="w-8 h-8 text-secondary flex-shrink-0" />;
    }
    if (mimeType === 'application/pdf') {
        return <DocumentTextIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />;
    }
    return <FileIcon className="w-8 h-8 text-text-muted flex-shrink-0" />;
}

const SUPPORTED_FILES = "image/jpeg,image/png,image/gif,image/svg+xml,image/webp,application/pdf";

const AddCardModal: React.FC<AddCardModalProps> = ({ listId, users, onClose, onAddCard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [isAssigning, setIsAssigning] = useState(false);
  const assignRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Label[]>([]);

  const handleLabelToggle = (label: Label) => {
    setSelectedLabels(prev => 
      prev.find(l => l.id === label.id) 
        ? prev.filter(l => l.id !== label.id)
        : [...prev, label]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(event.target as Node)) {
        setIsAssigning(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce effect for AI suggestions
  useEffect(() => {
    if (title.length < 10) {
        setAiSuggestions([]);
        return;
    }

    const handler = setTimeout(async () => {
        setIsAiLoading(true);
        try {
            const allLabels = Object.values(LABELS);
            const suggestions = await getTaskSuggestions({ title, description }, allLabels);
            const newSuggestions = suggestions.filter(suggestion => 
                !selectedLabels.some(selected => selected.id === suggestion.id)
            );
            setAiSuggestions(newSuggestions);
        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
        } finally {
            setIsAiLoading(false);
        }
    }, 1000); // 1 second debounce

    return () => {
        clearTimeout(handler);
    };
  }, [title, description, selectedLabels]);

  const handleAddSuggestion = (label: Label) => {
    handleLabelToggle(label); 
    setAiSuggestions(prev => prev.filter(s => s.id !== label.id));
  }

  const handleMemberToggle = (user: User) => {
    const isMember = selectedMembers.some(m => m.id === user.id);
    const updatedMembers = isMember
      ? selectedMembers.filter(m => m.id !== user.id)
      : [...selectedMembers, user];
    setSelectedMembers(updatedMembers);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const attachment: Attachment = {
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type,
      size: file.size,
    };
    
    try {
      await addFile(attachment.id, file);
      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
        console.error("Failed to add attachment to DB", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
        await deleteFile(attachmentId);
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
        console.error("Failed to delete attachment", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCardData: NewCardData = {
      title: title.trim(),
      description: description.trim(),
      labels: selectedLabels,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      members: selectedMembers,
      attachments: attachments,
    };

    onAddCard(listId, newCardData);
  };
  
  const allLabels = Object.values(LABELS);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-background-card rounded-xl shadow-lg w-full max-w-2xl mx-4 border border-border-default flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 p-6 flex-shrink-0 border-b border-border-default">
          <h2 className="text-xl font-bold text-text-default">Crear Nueva Tarjeta</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="space-y-6 px-6 pb-6">
            <div>
              <label htmlFor="card-title" className="block text-sm font-medium text-text-default mb-1">
                Título de la tarjeta <span className="text-danger">*</span>
              </label>
              <input
                id="card-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Diseñar el flujo de registro"
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
            </div>

            <div>
              <label htmlFor="card-description" className="block text-sm font-medium text-text-default mb-1">
                Descripción
              </label>
              <textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añadir una descripción más detallada..."
                className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                rows={3}
              />
            </div>

             <div>
              <h4 className="text-sm font-medium text-text-default mb-2">Miembros</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map(member => (
                  <img key={member.id} src={member.avatar} alt={member.name} title={member.name} className="w-9 h-9 rounded-full" />
                ))}
                <div ref={assignRef} className="relative">
                  <button type="button" onClick={() => setIsAssigning(true)} className="w-9 h-9 rounded-full bg-background-subtle hover:bg-border-default flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 text-text-muted" />
                  </button>
                  {isAssigning && (
                    <div className="absolute left-0 top-12 w-64 bg-background-card border border-border-default rounded-lg shadow-xl z-10 p-2">
                      <h5 className="text-xs text-text-muted font-semibold p-2">Asignar a...</h5>
                      {users.map(user => (
                        <button type="button" key={user.id} onClick={() => handleMemberToggle(user)} className="w-full text-left p-2 flex items-center rounded-md hover:bg-background-subtle">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                          <span className="text-sm text-text-default flex-grow">{user.name}</span>
                           {selectedMembers.some(m => m.id === user.id) && '✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-text-default mb-2">Archivos Adjuntos</h4>
                 <div className="space-y-2">
                    {attachments.map(att => (
                    <div key={att.id} className="flex items-center bg-background-subtle p-2 rounded-lg group">
                        {getFileIcon(att.type)}
                        <div className="ml-3 flex-grow overflow-hidden">
                        <p className="text-sm font-semibold text-text-default truncate">{att.name}</p>
                        <p className="text-xs text-text-muted">{formatBytes(att.size)}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                            <button type="button" onClick={() => handleDeleteAttachment(att.id)} className={`p-1 rounded-full text-text-muted hover:text-white hover:bg-danger transition-opacity opacity-0 group-hover:opacity-100`}>
                            <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 w-full flex items-center justify-center text-sm p-2 rounded-lg bg-background-subtle hover:bg-border-default transition-colors duration-200 text-text-muted">
                  <AttachmentIcon className="w-4 h-4 mr-2" />
                  Añadir un archivo
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept={SUPPORTED_FILES} className="hidden" />
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium text-text-default">Etiquetas</h4>
                    {isAiLoading && <SpinnerIcon className="w-4 h-4 text-text-muted" />}
                </div>
                <div className="flex flex-wrap gap-2">
                    {allLabels.map(label => {
                        const isSelected = selectedLabels.some(l => l.id === label.id);
                        return (
                            <button
                                type="button"
                                key={label.id}
                                onClick={() => handleLabelToggle(label)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-transform transform hover:scale-105 ${label.color} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-background-card ring-primary' : 'opacity-70 hover:opacity-100'}`}
                            >
                                {label.text}
                            </button>
                        );
                    })}
                </div>
                {aiSuggestions.length > 0 && !isAiLoading && (
                    <div className="mt-3 pt-3 border-t border-border-default">
                        <h5 className="text-xs font-semibold text-text-muted mb-2 flex items-center">
                            <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-accent" />
                            Sugerencias de IA
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {aiSuggestions.map(label => (
                                <button
                                    type="button"
                                    key={`sug-${label.id}`}
                                    onClick={() => handleAddSuggestion(label)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-transform transform hover:scale-105 ${label.color} opacity-80 hover:opacity-100 border-2 border-dashed border-accent/50`}
                                >
                                    + {label.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

             <div>
                <label htmlFor="card-due-date" className="block text-sm font-medium text-text-default mb-1">
                    Fecha de Vencimiento
                </label>
                <input
                    id="card-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 p-6 flex-shrink-0 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-text-default bg-background-subtle border border-border-default rounded-lg hover:bg-border-default transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:bg-border-default disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Añadir Tarjeta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;