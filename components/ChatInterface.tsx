import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getTutorResponse } from '../services/geminiService';
import Message from './Message';
import Spinner from './Spinner';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: "Bonjour ! Je suis le Professeur Éloi. Téléchargez une photo de votre problème d'algèbre ou de calcul, et nous le résoudrons ensemble, pas à pas.",
    },
  ]);
  const [input, setInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        // Once a math problem is uploaded, we switch to thinking mode
        setIsThinkingMode(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !uploadedImage) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      image: uploadedImage,
    };
    
    // Add user message to state, and pass the previous state to the API call
    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);

    try {
      const aiResponseText = await getTutorResponse(currentHistory, userMessage, isThinkingMode);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Oups, quelque chose s'est mal passé. Pourriez-vous réessayer ?",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, uploadedImage, messages, isThinkingMode]);

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg m-2 md:m-4">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 md:p-6 border-t border-slate-700 bg-slate-900/50">
        {uploadedImage && (
          <div className="mb-3 p-2 bg-slate-700 rounded-lg inline-block relative">
            <img src={uploadedImage} alt="Preview" className="h-20 w-auto rounded" />
            <button 
              onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
            >
              X
            </button>
          </div>
        )}

        <div className="flex items-center bg-slate-700 rounded-full p-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-slate-600 transition-colors duration-200"
            aria-label="Upload image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Posez une question ou décrivez votre étape..."
            className="w-full bg-transparent px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none"
            disabled={isLoading}
          />

          <div className="p-2">
            {isLoading ? (
              <Spinner />
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !uploadedImage)}
                className="bg-cyan-500 rounded-full p-2 text-white hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
