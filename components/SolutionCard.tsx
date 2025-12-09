import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Zap, RotateCcw, BookOpen } from 'lucide-react';

interface SolutionCardProps {
  markdown: string;
  isSimplifying: boolean;
  isSimplified: boolean;
  onSimplify: () => void;
  onReset: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  markdown, 
  isSimplifying, 
  isSimplified,
  onSimplify, 
  onReset 
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-slate-900/60 border border-slate-700 shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="font-bold text-slate-200 tracking-wider brand-font">
              {isSimplified ? 'SIMPLIFIED EXPLANATION' : 'ANALYSIS RESULT'}
            </span>
          </div>
          
          <div className="flex gap-2">
            {!isSimplified ? (
              <button
                onClick={onSimplify}
                disabled={isSimplifying}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-cyan-900 bg-cyan-400 rounded hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimplifying ? (
                   <span className="animate-pulse">SIMPLIFYING...</span>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    SIMPLIFY
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-purple-200 bg-purple-900/50 border border-purple-500/50 rounded hover:bg-purple-900/80 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                SHOW ORIGINAL
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[800px] custom-scrollbar">
          <div className="prose prose-invert prose-cyan max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // Custom renderer for cleaner math display in this theme
                p: ({node, ...props}) => <p className="leading-relaxed text-slate-300 mb-4" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 border-b border-slate-700 pb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-cyan-200 mt-6 mb-4 flex items-center gap-2" {...props} />,
                strong: ({node, ...props}) => <strong className="text-cyan-100 font-bold" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                code: ({node, className, children, ...props}) => { // Fixed type definition
                    const match = /language-(\w+)/.exec(className || '')
                    return !className ? (
                      <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="mockup-code bg-slate-950 text-slate-200 p-4 rounded-lg my-4 border border-slate-800 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    )
                },
                table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-slate-700">
                        <table className="min-w-full divide-y divide-slate-700" {...props} />
                    </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-slate-800" {...props} />,
                th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider" {...props} />,
                tbody: ({node, ...props}) => <tbody className="bg-slate-900/50 divide-y divide-slate-800" {...props} />,
                td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono" {...props} />,
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50" />
      </div>
    </div>
  );
};
