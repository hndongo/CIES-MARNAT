import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-md p-4 border-b border-slate-700">
        <h1 className="text-xl md:text-2xl font-bold text-center text-cyan-400">
          Professeur Éloi: Votre Tuteur de Maths IA
        </h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
