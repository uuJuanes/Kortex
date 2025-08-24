
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { User, ChatMessage } from '../../types';
import { XIcon } from '../icons/XIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface ChatWindowProps {
  currentUser: User;
  onClose: () => void;
}

const API_KEY = process.env.API_KEY;

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, onClose }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!API_KEY) {
      setMessages([
        {
          id: 'error-1',
          sender: 'model',
          text: 'Error: La clave de API de Gemini no está configurada. El chat no funcionará.',
        }
      ]);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "Eres Kortex AI, un asistente experto en gestión de proyectos. Tu objetivo es ayudar al usuario a planificar, organizar y analizar sus proyectos. Sé proactivo, claro y ofrece sugerencias accionables. Comunícate en español.",
      },
    });
    setChat(newChat);

    setMessages([
      {
        id: 'init-1',
        sender: 'model',
        text: `¡Hola ${currentUser.name.split(' ')[0]}! Soy Kortex AI. ¿En qué puedo ayudarte hoy? Puedes pedirme que genere ideas para un proyecto, desglose tareas o analice riesgos.`,
        userAvatar: currentUser.avatar,
      }
    ]);
  }, [currentUser.name, currentUser.avatar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userInput.trim(),
      userAvatar: currentUser.avatar,
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userMessage.text });

      let currentResponse = '';
      const modelMessageId = `msg-${Date.now()}-model`;
      
      // Add a placeholder for the model's response
      setMessages(prev => [...prev, { id: modelMessageId, sender: 'model', text: '' }]);

      for await (const chunk of stream) {
        currentResponse += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, text: currentResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'model',
        text: 'Lo siento, he encontrado un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chat, currentUser.avatar]);

  return (
    <div className="fixed bottom-20 right-6 w-[400px] h-[550px] bg-background-card rounded-xl shadow-2xl border border-border-default flex flex-col z-50 transform transition-all duration-300">
      <header className="flex-shrink-0 p-3 border-b border-border-default flex items-center justify-between bg-background-subtle rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="url(#logo_bg_gradient)"/>
                <path d="M12 5L15.5 8.5L12 12L8.5 8.5L12 5Z" fill="white" fillOpacity="0.8"/>
                <path d="M8.5 15.5L12 19L15.5 15.5L12 12L8.5 15.5Z" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-default">Kortex AI</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full text-text-muted hover:bg-background-card hover:text-text-default transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'model' && (
                <svg width="28" height="28" viewBox="0 0 24 24" className="flex-shrink-0"><rect width="24" height="24" rx="14" fill="url(#logo_bg_gradient)"/></svg>
              )}
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${message.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-background-subtle text-text-default rounded-bl-none'}`}>
                 {message.text || <span className="inline-block w-2 h-4 bg-text-default animate-pulse rounded-full"></span>}
              </div>
               {message.sender === 'user' && message.userAvatar && (
                <img src={message.userAvatar} alt="user" className="w-7 h-7 rounded-full flex-shrink-0" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="flex-shrink-0 p-3 border-t border-border-default">
        <div className="flex items-center gap-2 bg-background-subtle rounded-lg border border-border-default focus-within:ring-2 focus-within:ring-primary">
          <textarea
            ref={textAreaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            placeholder="Pregúntale algo a Kortex AI..."
            className="flex-grow bg-transparent p-2.5 text-sm text-text-default placeholder-text-muted focus:outline-none resize-none max-h-28"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="p-2.5 text-white bg-primary rounded-md m-1.5 hover:bg-primary/90 disabled:bg-border-default disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensaje"
          >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </footer>
       <defs>
          <linearGradient id="logo_bg_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6"/>
              <stop offset="1" stopColor="#2563EB"/>
          </linearGradient>
       </defs>
    </div>
  );
};

export default ChatWindow;
