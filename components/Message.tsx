import React from 'react';
import { ChatMessage } from '../types';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-cyan-400">
          É
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-2xl shadow-md ${
          isUser
            ? 'bg-cyan-600/80 rounded-br-none'
            : 'bg-slate-700/80 rounded-bl-none'
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="User upload"
            className="rounded-lg mb-3 max-w-xs h-auto"
          />
        )}
        <p className="text-slate-100 whitespace-pre-wrap">{message.text}</p>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold">
          VOUS
        </div>
      )}
    </div>
  );
};

export default Message;
