import React from 'react';

interface OpacityFaderProps {
    value: number; // 0.0 to 1.0
    onChange: (val: number) => void;
}

export const OpacityFader: React.FC<OpacityFaderProps> = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2 w-full">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0"><path d="M11 12h10"/><path d="M11 5h7"/><path d="M11 19h10"/><path d="M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/></svg>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
        </div>
    );
};