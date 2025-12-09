import React from 'react';
import { Subject } from '../types';
import { Calculator, Cpu, Atom, Activity, Database, Brain, Shapes } from 'lucide-react';

interface SubjectSelectorProps {
  selectedSubject: Subject;
  onSelect: (subject: Subject) => void;
}

const CATEGORIES = [
  {
    name: 'Mathematics',
    items: [
      { id: Subject.CALCULUS, icon: Calculator, label: 'Calculus' },
      { id: Subject.LINEAR_ALGEBRA, icon: Activity, label: 'Linear Algebra' },
      { id: Subject.PROB_STAT, icon: Activity, label: 'Prob & Stat' }, // Reusing Activity for now
      { id: Subject.GEOMETRY, icon: Shapes, label: 'Geometry' },
    ]
  },
  {
    name: 'Computer Science',
    items: [
      { id: Subject.DLD, icon: Cpu, label: 'DLD' },
      { id: Subject.AI_ALGO, icon: Brain, label: 'AI & Algos' },
      { id: Subject.DATA_SCIENCE, icon: Database, label: 'Data Science' },
    ]
  },
  {
    name: 'Other',
    items: [
      { id: Subject.SCIENCE, icon: Atom, label: 'Gen. Science' }
    ]
  }
];

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSelect }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="animate-fade-in">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">{cat.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cat.items.map((sub) => {
                const isActive = selectedSubject === sub.id;
                const Icon = sub.icon;
                
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelect(sub.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200
                      ${isActive 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
