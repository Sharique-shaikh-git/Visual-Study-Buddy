import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChatMessage, Subject } from '../types';
import { Bot, User, Code2, BookOpen, Copy, Check, ImageIcon, ThumbsUp, ThumbsDown, Play, Terminal, Activity, Download, AlertTriangle, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  subject?: Subject;
  onGenerateImage?: (prompt: string) => void;
  pythonStatus?: 'initializing' | 'ready' | 'error';
}

// Global definition for Pyodide
declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

const CodeBlock = ({ inline, className, children, pythonStatus, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const match = /language-(\w+)/.exec(className || '');
  const isPython = match && match[1] === 'python';
  const isPythonReady = pythonStatus === 'ready';
  
  if (inline || !match) {
    return (
      <code className="bg-slate-800 text-cyan-200 px-1 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunPython = async () => {
    setHasError(false);
    setOutput([]);
    
    if (!window.pyodide || !isPythonReady) {
      setHasError(true);
      setOutput(['System Error: Python environment is still initializing. Please wait a moment.']);
      return;
    }
    
    setIsRunning(true);
    
    try {
      // Capture stdout
      const logs: string[] = [];
      window.pyodide.setStdout({ batched: (msg: string) => logs.push(msg) });
      
      // Safety: Ensure packages are loaded (should be done by App.tsx, but just in case)
      await window.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
      
      // Run code
      await window.pyodide.runPythonAsync(String(children));
      
      if (logs.length === 0) {
          setOutput(['> Code executed successfully (No output).']);
      } else {
          setOutput(logs);
      }
    } catch (err: any) {
      setHasError(true);
      const cleanMsg = err.message || "Unknown error occurred";
      setOutput([cleanMsg]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
        <span className="text-[10px] font-bold text-cyan-500 uppercase font-mono tracking-wider flex items-center gap-1">
            <Code2 className="w-3 h-3" />
            {match[1]}
        </span>
        <div className="flex items-center gap-2">
            {isPython && (
                <button
                    onClick={handleRunPython}
                    disabled={isRunning || !isPythonReady}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all border group/run
                      ${!isPythonReady 
                         ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed' 
                         : 'hover:bg-emerald-900/30 border-transparent hover:border-emerald-500/30 text-emerald-400'}
                    `}
                    aria-label="Run Python"
                >
                    {!isPythonReady ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                    )}
                    <span className="text-[10px] font-bold">
                        {!isPythonReady ? 'LOADING...' : (isRunning ? 'RUNNING...' : 'RUN')}
                    </span>
                </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 group/btn"
              aria-label="Copy code"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400 group-hover/btn:text-cyan-400" />}
              <span className={`text-[10px] font-bold ${isCopied ? 'text-emerald-400' : 'text-slate-400 group-hover/btn:text-cyan-400'}`}>
                {isCopied ? 'COPIED' : 'COPY'}
              </span>
            </button>
        </div>
      </div>
      <div className="p-0">
        <code className={`${className} block p-4 text-sm font-mono overflow-x-auto leading-relaxed text-slate-300`} {...props}>
          {children}
        </code>
      </div>

      {/* Terminal Output */}
      {output.length > 0 && (
          <div className={`border-t p-3 font-mono text-xs ${hasError ? 'bg-red-950/20 border-red-900/50' : 'bg-black/80 border-slate-800'}`}>
              <div className={`flex items-center gap-2 mb-2 select-none ${hasError ? 'text-red-400' : 'text-slate-500'}`}>
                  {hasError ? <AlertTriangle className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                  <span className="uppercase tracking-widest text-[10px]">
                      {hasError ? 'Execution Error' : 'Terminal Output'}
                  </span>
              </div>
              <div className={`space-y-1 ${hasError ? 'text-red-300' : 'text-slate-300'}`}>
                  {output.map((line, i) => (
                      <div key={i} className="break-all whitespace-pre-wrap">{line}</div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, subject, onGenerateImage, pythonStatus }) => {
  const isUser = message.role === 'user';
  const [activeTab, setActiveTab] = useState<'concept' | 'code'>('concept');
  const [codeCopied, setCodeCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Parse for split
  const SPLIT_MARKER = "|||SECTION_SPLIT|||";
  const hasSplit = message.content.includes(SPLIT_MARKER);
  
  const [conceptPart, codePart] = hasSplit 
    ? message.content.split(SPLIT_MARKER)
    : [message.content, ''];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codePart.replace(/```python|```/g, '').trim());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  
  const handleCopyText = () => {
      // Copy the currently visible text
      const textToCopy = activeTab === 'concept' ? conceptPart : codePart;
      navigator.clipboard.writeText(textToCopy);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
  };

  const handleDownloadImage = () => {
      if (message.imageUrl) {
          const link = document.createElement('a');
          link.href = message.imageUrl;
          link.download = `visual-study-buddy-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const handleVisualizeFlow = () => {
    if (onGenerateImage && conceptPart) {
        // Create a summary prompt for flow visualization
        const snippet = conceptPart.substring(0, 150).replace(/\n/g, ' ');
        onGenerateImage(`Create a step-by-step execution flow diagram or flowchart for: ${snippet}...`);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
          ${isUser 
            ? 'bg-purple-900/50 border-purple-500/50 text-purple-300' 
            : 'bg-cyan-900/50 border-cyan-500/50 text-cyan-300'
          }
        `}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Content Bubble */}
        <div className={`
          flex flex-col min-w-0 rounded-2xl overflow-hidden border shadow-lg relative
          ${isUser 
            ? 'bg-purple-950/40 border-purple-800/50 rounded-tr-none' 
            : 'bg-slate-900/80 border-slate-700/50 rounded-tl-none backdrop-blur-md'
          }
        `}>
          
          {/* Tab Headers if split exists */}
          {!isUser && hasSplit && (
            <div className="flex border-b border-slate-700/50 bg-slate-950/30 items-center justify-between pr-2">
              <div className="flex">
                <button
                    onClick={() => setActiveTab('concept')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                    ${activeTab === 'concept' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}
                    `}
                >
                    <BookOpen className="w-3 h-3" /> Concept
                </button>
                <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors
                    ${activeTab === 'code' ? 'text-emerald-300 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-500 hover:text-slate-300'}
                    `}
                >
                    <Code2 className="w-3 h-3" /> Python Code
                </button>
              </div>
              
              {/* Copy Button in Tab Header */}
              <button
                onClick={handleCopyText}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all"
                title="Copy text"
              >
                {textCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
          
          {/* Image Content (if any) */}
          {message.imageUrl && (
            <div className="relative p-2 pb-0">
               <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black/50">
                  <img src={message.imageUrl} alt="Generated Visualization" className="w-full h-auto object-cover max-h-[300px]" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      GENERATED VISUALIZATION
                  </div>
               </div>
               
               {/* Download Button */}
               <button 
                  onClick={handleDownloadImage}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/30 text-xs font-bold transition-all"
               >
                   <Download className="w-3 h-3" />
                   DOWNLOAD IMAGE
               </button>
            </div>
          )}

          {/* Body Content */}
          {message.content && (
            <div className="p-4 overflow-x-auto relative">
              
              {/* Copy Button Overlay for Non-Split AI Messages */}
              {!isUser && !hasSplit && (
                  <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={handleCopyText}
                        className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all backdrop-blur-sm"
                        title="Copy explanation"
                      >
                        {textCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                  </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre: ({ children }) => <>{children}</>,
                    code: (props) => <CodeBlock {...props} pythonStatus={pythonStatus} />
                  }}
                >
                  {activeTab === 'concept' ? conceptPart : codePart}
                </ReactMarkdown>

                {/* Visualize Flow Button for AI/Algorithms */}
                {!isUser && subject === Subject.AI_ALGO && activeTab === 'concept' && onGenerateImage && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-start">
                        <button 
                            onClick={handleVisualizeFlow}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all group"
                        >
                            <Activity className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            VISUALIZE EXECUTION FLOW
                        </button>
                    </div>
                )}

                {/* Copy Button for Code Tab */}
                {activeTab === 'code' && (
                  <div className="mt-4 flex justify-end">
                      <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 rounded-md hover:bg-emerald-900/40 transition-colors"
                      >
                          {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {codeCopied ? 'Copied Full Source!' : 'Copy Full Source'}
                      </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Footer Metadata & Feedback */}
          <div className="px-4 pb-2 flex items-center justify-between">
              <div className="text-[10px] text-slate-500 opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {!isUser && (
                  <div className="flex gap-2">
                      <button 
                        onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${feedback === 'up' ? 'text-cyan-400' : 'text-slate-600'}`}
                      >
                          <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${feedback === 'down' ? 'text-red-400' : 'text-slate-600'}`}
                      >
                          <ThumbsDown className="w-3 h-3" />
                      </button>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};