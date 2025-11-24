import React from 'react';

interface ColumnHeaderProps {
    numColumns: number;
    onTriggerColumn: (colIdx: number) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({ numColumns, onTriggerColumn }) => {
    // Create an array of column indices [0, 1, 2, ...]
    const columns = Array.from({ length: numColumns }, (_, i) => i);

    return (
        <div className="border-b border-slate-800 py-2 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-sm shadow-md">
            <div className="flex flex-col md:flex-row px-4 gap-4">
                
                {/* Spacer Div - Aligns with LayerStrip Control Panel */}
                {/* Must match width of LayerStrip sidebar (w-24) exactly */}
                <div className="hidden md:flex w-24 shrink-0 items-center">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest pl-1">Columns</span>
                </div>

                {/* Columns Scroll Container */}
                <div className="overflow-x-auto w-full custom-scrollbar">
                    <div className="flex gap-2 w-max pb-2">
                        {columns.map((colIndex) => (
                            <button
                                key={`col-${colIndex}`}
                                onClick={() => onTriggerColumn(colIndex)}
                                className="w-32 h-8 rounded bg-slate-800 border border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center"
                            >
                                COL {colIndex + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};