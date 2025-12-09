import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Subject } from '../types';
import { MessageBubble } from './MessageBubble';
import { Send, Sparkles, AlertCircle, Loader2, RefreshCw, Paintbrush } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  selectedSubject: Subject;
  onSendMessage: (text: string) => void;
  onGenerateImage: (prompt: string) => void;
  isLoading: boolean;
  pythonStatus: 'initializing' | 'ready' | 'error';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, selectedSubject, onSendMessage, onGenerateImage, isLoading, pythonStatus }) => {
  const [inputText, setInputText] = useState('');
  const [loadingText, setLoadingText] = useState("Processing...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cycle loading text
  useEffect(() => {
    if (!isLoading) return;
    const texts = [
      "Establishing neural link...",
      "Scanning visual data...",
      "Querying knowledge base...",
      "Formulating response...",
      "Rendering conceptual model...",
      "Optimizing output..."
    ];
    let i = 0;
    setLoadingText(texts[0]);
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleVisualize = () => {
    if (isLoading) return;
    
    // Mode A: User typed something to visualize
    if (inputText.trim()) {
      onGenerateImage(inputText);
      setInputText('');
      return;
    }

    // Mode B: User wants to visualize the last explanation
    // Find the last model message
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && !m.content.startsWith("Error:"));
    if (lastModelMessage) {
       onGenerateImage(lastModelMessage.content.substring(0, 500)); // Limit context length for prompt
    }
  };

  // Determine if the last message was an error
  const lastMessage = messages[messages.length - 1];
  const isLastError = lastMessage?.content.startsWith("Error:");

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border-l border-slate-800">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <Sparkles className="w-12 h-12 mb-4 text-cyan-500/50" />
            <p className="text-sm font-medium">Upload an image to consult the Professor.</p>
          </div>
        ) : (
          messages.map((msg) => (
             <div key={msg.id} className={msg.content.startsWith("Error:") ? "animate-shake" : ""}>
                 {msg.content.startsWith("Error:") ? (
                     <div className="flex justify-center mb-6 w-full">
                         <div className="bg-red-950/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 max-w-[90%] shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-sm">
                             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                             <div className="flex flex-col">
                               <span className="font-bold text-red-400 text-xs tracking-wider uppercase mb-1">System Alert</span>
                               <span className="text-sm leading-relaxed">{msg.content.replace("Error: ", "")}</span>
                             </div>
                         </div>
                     </div>
                 ) : (
                    <MessageBubble 
                        message={msg} 
                        subject={selectedSubject} 
                        onGenerateImage={onGenerateImage}
                        pythonStatus={pythonStatus}
                    />
                 )}
             </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start mb-8 w-full animate-fade-in">
             <div className="flex max-w-[80%] gap-4 flex-row items-center">
                 <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <div className="text-cyan-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                        {loadingText}
                    </div>
                    <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-full animate-progress-indeterminate rounded-full" />
                    </div>
                 </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isLastError ? "Try checking your settings or asking again..." : "Ask a question or describe a diagram..."}
            disabled={isLoading}
            className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all disabled:opacity-50
              ${isLastError 
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/20'}
            `}
          />
          
          {/* Visualize Button */}
          <button
            type="button"
            onClick={handleVisualize}
            disabled={isLoading || (messages.length === 0 && !inputText.trim())}
            title={inputText.trim() ? "Generate Image from Text" : "Visualize Last Explanation"}
            className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/40 hover:text-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(147,51,234,0.1)] hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Paintbrush className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg
              ${isLastError 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-200' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-cyan-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'}
            `}
          >
            {isLastError ? <RefreshCw className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};