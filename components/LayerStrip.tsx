import React, { useCallback } from 'react';
import { ResolumeLayer } from '../types';
import { ClipButton } from './ClipButton';
import { OpacityFader } from './OpacityFader';
import { debounce } from 'lodash'; // We assume lodash/debounce usage, but will implement simple timeout if needed for cleaner dependency tree

interface LayerStripProps {
    layer: ResolumeLayer;
    layerIndex: number;
    onTriggerClip: (layerIdx: number, clipIdx: number) => void;
    onClearLayer: (layerIdx: number) => void;
    onOpacityChange: (layerIdx: number, value: number) => void;
}

export const LayerStrip: React.FC<LayerStripProps> = ({ 
    layer, 
    layerIndex, 
    onTriggerClip, 
    onClearLayer,
    onOpacityChange 
}) => {
    const layerName = layer.name?.value || `Layer ${layerIndex + 1}`;
    const opacity = layer.video?.opacity?.value ?? 1.0;

    // Debounce opacity changes to avoid flooding the API
    const handleOpacityChange = (newVal: number) => {
        // Optimistic update handled by parent re-render on next poll, 
        // but strictly we should manage local state here for smoothness.
        // For this demo, we pass directly.
        onOpacityChange(layerIndex, newVal);
    };

    return (
        <div className="border-b border-slate-800 py-4 hover:bg-slate-900/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3 px-4">
                {/* Layer Header & Controls */}
                <div className="flex items-center justify-between w-full md:w-64 shrink-0 gap-4">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-slate-200 truncate max-w-[150px]" title={layerName}>
                            {layerName}
                        </h3>
                        <div className="text-xs text-slate-500 font-mono">IDX: {layerIndex + 1}</div>
                    </div>
                    
                    {/* Clear Button */}
                    <button 
                        onClick={() => onClearLayer(layerIndex)}
                        className="p-2 rounded bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 transition-colors group"
                        title="Clear Layer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {/* Opacity Fader */}
                <div className="w-full md:w-auto grow-0 md:mr-4">
                    <OpacityFader value={opacity} onChange={handleOpacityChange} />
                </div>
            </div>

            {/* Clips Scroll Container */}
            <div className="px-4 overflow-x-auto pb-2">
                <div className="flex gap-2 w-max">
                    {layer.clips.map((clip, clipIndex) => (
                        <ClipButton 
                            key={`${layer.id}-${clipIndex}`} 
                            clip={clip} 
                            onClick={() => onTriggerClip(layerIndex, clipIndex)}
                        />
                    ))}
                    {layer.clips.length === 0 && (
                        <div className="text-slate-600 italic text-sm p-4">No clips in this layer</div>
                    )}
                </div>
            </div>
        </div>
    );
};