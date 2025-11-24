import React from 'react';
import { ResolumeClip } from '../types';

interface ClipButtonProps {
    clip: ResolumeClip;
    onClick: () => void;
}

export const ClipButton: React.FC<ClipButtonProps> = ({ clip, onClick }) => {
    const isConnected = clip.connected?.value;
    const hasName = clip.name?.value && clip.name.value !== "";
    const displayName = hasName ? clip.name.value : `Clip`;

    // Dynamic classes based on state
    const baseClasses = "relative w-32 h-20 rounded-md border-2 transition-all duration-100 flex flex-col items-center justify-center overflow-hidden group active:scale-95 select-none";
    
    const activeClasses = isConnected 
        ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
        : "bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750";

    return (
        <button 
            onClick={onClick}
            className={`${baseClasses} ${activeClasses}`}
        >
            {/* Connect/Play Icon if active */}
            {isConnected && (
                <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
            )}

            {/* Clip Name */}
            <span className={`text-xs font-medium text-center px-2 truncate w-full ${isConnected ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {displayName}
            </span>

            {/* Progress bar placeholder (if we had position data) */}
            {isConnected && (
                <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-full animate-[progress_2s_linear_infinite]"></div>
            )}
        </button>
    );
};