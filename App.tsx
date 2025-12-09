import React, { useState, useEffect, useRef } from 'react';
import { Subject, ChatMessage } from './types';
import { ChatService } from './services/geminiService';
import { DropZone } from './components/DropZone';
import { SubjectSelector } from './components/SubjectSelector';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { BrainCircuit, Settings, CheckCircle2, Loader2 } from 'lucide-react';

// Define Pyodide types globally for App usage
declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

const App: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.CALCULUS);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pythonStatus, setPythonStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  
  // Use a ref for ChatService to persist across renders
  const chatServiceRef = useRef<ChatService>(new ChatService());

  // Initialize Pyodide on App Mount (Silent/Background)
  useEffect(() => {
    const initPython = async () => {
      try {
        if (!window.loadPyodide) {
          console.warn("Pyodide script not loaded yet.");
          return;
        }

        // Only initialize if not already done
        if (!window.pyodide) {
            setPythonStatus('initializing');
            window.pyodide = await window.loadPyodide();
            // Explicitly load data science packages
            await window.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
        }
        setPythonStatus('ready');
      } catch (err) {
        console.error("Failed to initialize Pyodide:", err);
        setPythonStatus('error');
      }
    };

    // Small delay to ensure script tag processing
    const timer = setTimeout(initPython, 1000);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (role: 'user' | 'model', content: string, imageUrl?: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      imageUrl,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFileAccepted = async (file: File) => {
    setCurrentFile(file);
    setIsLoading(true);
    // Reset chat on new image
    setMessages([]); 
    
    try {
      await chatServiceRef.current.startSession(selectedSubject);
      const analysis = await chatServiceRef.current.analyzeImage(file);
      addMessage('model', analysis);
    } catch (err: any) {
      addMessage('model', `Error: ${err.message || "Failed to analyze image. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    addMessage('user', text);
    setIsLoading(true);
    
    try {
      const response = await chatServiceRef.current.sendMessage(text);
      addMessage('model', response);
    } catch (err: any) {
      addMessage('model', `Error: ${err.message || "Failed to send message. Check connection."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    // If prompt came from the user typing, add it as a user message
    if (!messages.length || messages[messages.length - 1].role !== 'model') {
       addMessage('user', `Visualize: ${prompt}`);
    } else {
       addMessage('user', "Visualize this concept.");
    }
    
    setIsLoading(true);

    try {
        const base64Image = await chatServiceRef.current.generateImage(prompt);
        addMessage('model', '', base64Image);
    } catch (err: any) {
        addMessage('model', `Error: ${err.message || "Failed to generate image."}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCurrentFile(null);
    setMessages([]);
  };

  return (
    <div className="h-screen w-screen cyber-grid relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full bg-slate-950 z-[-2]" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] z-[-1]" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] z-[-1]" />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onClearData={handleClear} 
      />

      {/* Settings Button - Absolute Top Right */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Layout - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Controls & Image (40% width on Desktop) */}
        <div className="w-full md:w-[40%] flex flex-col border-r border-slate-800 bg-slate-950/50 backdrop-blur-sm overflow-y-auto p-6 relative">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-900 border border-cyan-500/50 rounded-lg neon-glow">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-wider uppercase brand-font">
                Visual Study Buddy
              </h1>
              <span className="text-xs text-slate-500 font-mono tracking-widest">PHASE 7 // INTERACTIVE</span>
            </div>
          </div>

          <SubjectSelector 
            selectedSubject={selectedSubject} 
            onSelect={setSelectedSubject} 
          />
          
          <div className="flex-1 flex flex-col">
             <DropZone 
              currentFile={currentFile} 
              onFileAccepted={handleFileAccepted}
              onClear={handleClear}
              isLoading={isLoading}
            />
            
            {/* Context/Tips Area */}
            {!currentFile && (
              <div className="mt-auto p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 text-sm leading-relaxed">
                <strong className="text-cyan-400 block mb-2">Professor's Instructions:</strong>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Select your domain (Math, CS, Science).</li>
                  <li>Upload a clear image of the problem/diagram.</li>
                  <li>I will analyze it and provide a step-by-step solution.</li>
                  <li>Use <strong className="text-purple-400">Visualize It</strong> to generate diagrams!</li>
                  <li>Run generated Python code directly in the chat.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Interface (60% width on Desktop) */}
        <div className="w-full md:w-[60%] h-full relative">
            <ChatInterface 
                messages={messages} 
                selectedSubject={selectedSubject}
                onSendMessage={handleSendMessage}
                onGenerateImage={handleGenerateImage}
                isLoading={isLoading}
                pythonStatus={pythonStatus}
            />
        </div>

      </div>
    </div>
  );
};

export default App;