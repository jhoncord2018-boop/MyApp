import React from 'react';
import { ResolumeClip } from '../types';

interface ClipButtonProps {
    clip: ResolumeClip;
    onClick: () => void;
    thumbnailUrl?: string | null;
}

export const ClipButton: React.FC<ClipButtonProps> = ({ clip, onClick, thumbnailUrl }) => {
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
            {/* Thumbnail Background */}
            {thumbnailUrl && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={thumbnailUrl} 
                        alt={displayName} 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isConnected ? 'opacity-40' : 'opacity-60 group-hover:opacity-80'}`}
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}

            {/* Connect/Play Icon if active */}
            {isConnected && (
                <div className="absolute top-1 right-1 z-10">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
            )}

            {/* Clip Name */}
            <span className={`relative z-10 text-xs font-medium text-center px-2 truncate w-full shadow-black drop-shadow-md ${isConnected ? 'text-cyan-100' : 'text-slate-200 group-hover:text-white'}`}>
                {displayName}
            </span>

            {/* Progress bar placeholder (if we had position data) */}
            {isConnected && (
                <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-full animate-[progress_2s_linear_infinite] z-10"></div>
            )}
        </button>
    );
};
