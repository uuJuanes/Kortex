import React, { useState, useEffect, useRef } from 'react';
import { Card as CardType, ChecklistItem, User, Attachment, Comment, UserRole } from '../types';
import { XIcon } from './icons/XIcon';
import { DescriptionIcon } from './icons/DescriptionIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { AttachmentIcon } from './icons/AttachmentIcon';
import { FileIcon } from './icons/FileIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { addFile, deleteFile, getFile } from '../db';
import AttachmentPreviewModal from './AttachmentPreviewModal';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';


interface CardDetailModalProps {
  card: CardType;
  listTitle: string;
  users: User[]; // Now receives only the members of the team that owns the board
  currentUser: User;
  currentUserRole?: UserRole;
  onClose: () => void;
  onUpdateCard: (updatedCard: CardType) => void;
  onDeleteCard: (cardId: string) => Promise<void>;
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

const SUPPORTED_FILES = "image/jpeg,image/png,image/gif,image/svg+xml,image/webp,application/pdf";

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, listTitle, users, currentUser, currentUserRole, onClose, onUpdateCard, onDeleteCard }) => {
  const [editableCard, setEditableCard] = useState<CardType>(card);
  const [isAssigning, setIsAssigning] = useState(false);
  const [previewingAttachment, setPreviewingAttachment] = useState<Attachment | null>(null);
  const [newComment, setNewComment] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const assignRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = currentUserRole !== UserRole.Admin;

  useEffect(() => {
    setEditableCard(card);
  }, [card]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close main modal
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
      // Close assign popover
      if (assignRef.current && !assignRef.current.contains(event.target as Node)) {
        setIsAssigning(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleFieldChange = (field: keyof CardType, value: any) => {
    const updatedCard = { ...editableCard, [field]: value };
    setEditableCard(updatedCard);
    onUpdateCard(updatedCard);
  };
  
  const handleChecklistItemChange = (itemId: string, completed: boolean) => {
    if (!editableCard.checklist) return;
    const updatedItems = editableCard.checklist.items.map(item =>
      item.id === itemId ? { ...item, completed } : item
    );
    handleFieldChange('checklist', { ...editableCard.checklist, items: updatedItems });
  };
  
  const handleChecklistItemTextChange = (itemId: string, text: string) => {
     if (!editableCard.checklist) return;
     const updatedItems = editableCard.checklist.items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    handleFieldChange('checklist', { ...editableCard.checklist, items: updatedItems });
  };

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `chk-item-${Date.now()}`,
      text: '',
      completed: false
    };
    const updatedChecklist = {
      ...editableCard.checklist,
      title: editableCard.checklist?.title || 'Lista de Tareas',
      items: [...(editableCard.checklist?.items || []), newItem]
    };
    handleFieldChange('checklist', updatedChecklist);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!editableCard.checklist) return;
    const updatedItems = editableCard.checklist.items.filter(item => item.id !== itemId);
    handleFieldChange('checklist', { ...editableCard.checklist, items: updatedItems });
  };

  const handleMemberToggle = (user: User) => {
    const isMember = editableCard.members.some(m => m.id === user.id);
    const updatedMembers = isMember
      ? editableCard.members.filter(m => m.id !== user.id)
      : [...editableCard.members, user];
    handleFieldChange('members', updatedMembers);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
    handleFieldChange('dueDate', newDate);
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
      const updatedAttachments = [...(editableCard.attachments || []), attachment];
      handleFieldChange('attachments', updatedAttachments);
    } catch (error) {
        console.error("Failed to add attachment to DB", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
        await deleteFile(attachmentId);
        const updatedAttachments = (editableCard.attachments || []).filter(att => att.id !== attachmentId);
        handleFieldChange('attachments', updatedAttachments);
    } catch (error) {
        console.error("Failed to delete attachment", error);
    }
  };
  
  const handlePreviewAttachment = async (attachment: Attachment) => {
    setPreviewingAttachment(attachment);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...(editableCard.comments || []), comment];
    handleFieldChange('comments', updatedComments);
    setNewComment('');
  };

  const checklistProgress = editableCard.checklist?.items.length
    ? (editableCard.checklist.items.filter(i => i.completed).length / editableCard.checklist.items.length) * 100
    : 0;
    
  const formattedDueDate = editableCard.dueDate ? editableCard.dueDate.split('T')[0] : '';
  const isOverdue = editableCard.dueDate ? new Date(editableCard.dueDate) < new Date() : false;


  return (
    <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div 
        ref={modalRef}
        className="bg-background-card rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-border-default"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-border-default flex items-start justify-between">
          <div>
            <input
              type="text"
              value={editableCard.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-2xl font-bold text-text-default bg-transparent focus:outline-none focus:bg-background-subtle rounded-md px-2 py-1 w-full disabled:cursor-not-allowed disabled:bg-background-card/50"
              disabled={isReadOnly}
            />
            <p className="text-sm text-text-muted mt-1 ml-2">en la lista <span className="font-semibold">{listTitle}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-default transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        {isReadOnly && (
          <div className="flex-shrink-0 bg-warning-light text-warning-text text-sm p-3 text-center border-b border-border-default">
              <p>Estás en modo de solo lectura. Solo los administradores pueden modificar los detalles de la tarjeta.</p>
          </div>
        )}

        <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-default flex items-center mb-2">
                <DescriptionIcon className="w-5 h-5 mr-3 text-text-muted" />
                Descripción
              </h3>
              <textarea
                value={editableCard.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder={isReadOnly ? "Solo los administradores pueden editar la descripción." : "Añadir una descripción más detallada..."}
                className="w-full bg-background-subtle border border-border-default rounded-lg p-3 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition min-h-[120px] disabled:cursor-not-allowed"
                rows={4}
                disabled={isReadOnly}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-default flex items-center mb-3">
                <AttachmentIcon className="w-5 h-5 mr-3 text-text-muted" />
                Archivos Adjuntos
              </h3>
              <div className="space-y-3">
                {editableCard.attachments?.map(att => (
                  <div key={att.id} className="flex items-center bg-background-subtle p-2 rounded-lg group">
                    {getFileIcon(att.type)}
                    <div className="ml-3 flex-grow overflow-hidden">
                      <p className="text-sm font-semibold text-text-default truncate">{att.name}</p>
                      <p className="text-xs text-text-muted">{formatBytes(att.size)}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                        <button onClick={() => handlePreviewAttachment(att)} className="text-xs text-primary font-semibold hover:underline mr-2">Previsualizar</button>
                        <button onClick={() => handleDeleteAttachment(att.id)} disabled={isReadOnly} className={`p-1 rounded-full text-text-muted hover:text-white hover:bg-danger transition-opacity ${isReadOnly ? 'cursor-not-allowed opacity-20' : 'opacity-0 group-hover:opacity-100'}`}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
               <button onClick={() => fileInputRef.current?.click()} disabled={isReadOnly} className="mt-3 w-full flex items-center justify-center text-sm p-2 rounded-lg bg-background-subtle hover:bg-border-default transition-colors duration-200 text-text-muted disabled:opacity-60 disabled:cursor-not-allowed">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Añadir un archivo adjunto
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept={SUPPORTED_FILES} className="hidden" disabled={isReadOnly}/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-text-default flex items-center">
                  <ChecklistIcon className="w-5 h-5 mr-3 text-text-muted" />
                  Lista de Tareas
                </h3>
                <button onClick={handleAddChecklistItem} disabled={isReadOnly} className="text-sm px-3 py-1 bg-background-subtle rounded-md hover:bg-border-default text-text-muted disabled:opacity-60 disabled:cursor-not-allowed">Añadir ítem</button>
              </div>
              {editableCard.checklist && editableCard.checklist.items.length > 0 && (
                <div className="w-full bg-background-subtle rounded-full h-2 mb-3">
                  <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: `${checklistProgress}%` }}></div>
                </div>
              )}
              <div className="space-y-2">
                {editableCard.checklist?.items.map(item => (
                  <div key={item.id} className="flex items-center group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                      className="w-5 h-5 bg-background-subtle border-border-default rounded text-primary focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isReadOnly}
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleChecklistItemTextChange(item.id, e.target.value)}
                      className={`flex-grow bg-transparent ml-3 p-1 rounded-md focus:bg-background-subtle focus:outline-none ${item.completed ? 'line-through text-text-muted' : 'text-text-default'} disabled:cursor-not-allowed disabled:bg-transparent`}
                      disabled={isReadOnly}
                    />
                    <button onClick={() => handleDeleteChecklistItem(item.id)} disabled={isReadOnly} className={`ml-2 p-1 rounded-full text-text-muted hover:bg-danger hover:text-white transition-opacity ${isReadOnly ? 'cursor-not-allowed opacity-20' : 'opacity-0 group-hover:opacity-100'}`}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-text-default flex items-center mb-3">
                <ChatBubbleIcon className="w-5 h-5 mr-3 text-text-muted" />
                Actividad y Comentarios
              </h3>
              <div className="flex items-start space-x-3 mb-4">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-grow">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full bg-background-subtle border border-border-default rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition"
                    rows={2}
                  />
                  {newComment && (
                    <button
                      onClick={handleAddComment}
                      className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Comentar
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {editableCard.comments?.slice().reverse().map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-9 h-9 rounded-full flex-shrink-0" />
                    <div className="flex-grow bg-background-subtle p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-default text-sm">{comment.userName}</span>
                        <span className="text-xs text-text-muted">{formatRelativeTime(comment.timestamp)}</span>
                      </div>
                      <p className="text-text-default mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <div>
              <h4 className="font-semibold text-text-default mb-2">Miembros</h4>
              <div className="flex flex-wrap gap-2">
                {editableCard.members.map(member => (
                  <img key={member.id} src={member.avatar} alt={member.name} title={member.name} className="w-10 h-10 rounded-full" />
                ))}
                <div ref={assignRef} className="relative">
                  <button onClick={() => setIsAssigning(true)} disabled={isReadOnly} className="w-10 h-10 rounded-full bg-background-subtle hover:bg-border-default flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                    <PlusIcon className="w-6 h-6 text-text-muted" />
                  </button>
                  {isAssigning && (
                    <div className="absolute left-0 top-12 w-64 bg-background-card border border-border-default rounded-lg shadow-xl z-10 p-2">
                      <h5 className="text-xs text-text-muted font-semibold p-2">Asignar a...</h5>
                      {users.map(user => (
                        <button key={user.id} onClick={() => handleMemberToggle(user)} className="w-full text-left p-2 flex items-center rounded-md hover:bg-background-subtle">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                          <span className="text-sm text-text-default flex-grow">{user.name}</span>
                           {editableCard.members.some(m => m.id === user.id) && '✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-text-default mb-2">Etiquetas</h4>
              <div className="flex flex-wrap gap-1">
                {editableCard.labels.map(label => (
                  <span key={label.id} className={`text-sm font-semibold px-2 py-1 rounded ${label.color}`}>{label.text}</span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-default mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Fecha de Vencimiento
              </h4>
               <input
                type="date"
                value={formattedDueDate}
                onChange={handleDateChange}
                className={`w-full bg-background-subtle border rounded-lg p-2.5 text-text-default focus:ring-2 focus:ring-primary focus:border-primary transition ${isOverdue && !editableCard.dueDate ? '' : (isOverdue ? 'border-danger text-danger-text' : 'border-border-default')} disabled:cursor-not-allowed`}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-border-default">
          <button onClick={() => onDeleteCard(card.id)} disabled={isReadOnly} className="flex items-center text-sm p-2 rounded-lg hover:bg-danger-light transition-colors duration-200 text-danger-text disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent">
            <TrashIcon className="w-5 h-5 mr-2" />
            Eliminar Tarjeta
          </button>
        </footer>
      </div>
    </div>
    {previewingAttachment && (
      <AttachmentPreviewModal
        attachment={previewingAttachment}
        onClose={() => setPreviewingAttachment(null)}
      />
    )}
    </>
  );
};

export default CardDetailModal;