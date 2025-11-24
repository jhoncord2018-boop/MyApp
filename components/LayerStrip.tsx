import React from 'react';
import { ResolumeLayer } from '../types';
import { ClipButton } from './ClipButton';
import { OpacityFader } from './OpacityFader';

interface LayerStripProps {
    layer: ResolumeLayer;
    layerIndex: number;
    onTriggerClip: (layerIdx: number, clipIdx: number) => void;
    onClearLayer: (layerIdx: number) => void;
    onOpacityChange: (layerIdx: number, value: number) => void;
    thumbnails: Record<string, string>; // Keys: "layerIdx-clipIdx"
}

export const LayerStrip: React.FC<LayerStripProps> = ({ 
    layer, 
    layerIndex, 
    onTriggerClip, 
    onClearLayer,
    onOpacityChange,
    thumbnails
}) => {
    const layerName = layer.name?.value || `Layer ${layerIndex + 1}`;
    const opacity = layer.video?.opacity?.value ?? 1.0;

    const handleOpacityChange = (newVal: number) => {
        onOpacityChange(layerIndex, newVal);
    };

    return (
        <div className="border-b border-slate-800 py-3 hover:bg-slate-900/50 transition-colors group/layer">
            <div className="flex flex-col md:flex-row px-4 gap-4">
                
                {/* Control Panel (Left Sidebar) */}
                {/* Width fixed to w-24 to align with ColumnHeader spacer */}
                <div className="w-full md:w-24 shrink-0 flex flex-row md:flex-col justify-between gap-2 md:gap-3 border-r md:border-r-0 md:border-b-0 border-slate-800/50 md:border-none pb-2 md:pb-0">
                    <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-200 text-sm truncate" title={layerName}>
                                {layerName}
                            </h3>
                            <div className="text-[10px] text-slate-500 font-mono">L-{layerIndex + 1}</div>
                        </div>
                        
                        {/* Clear Button */}
                        <button 
                            onClick={() => onClearLayer(layerIndex)}
                            className="p-1.5 rounded bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 transition-colors group"
                            title="Clear Layer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>

                    {/* Opacity Control */}
                    <div className="w-1/2 md:w-full flex items-center">
                        <OpacityFader value={opacity} onChange={handleOpacityChange} />
                    </div>
                </div>

                {/* Clips Container */}
                <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex gap-2 w-max">
                        {layer.clips.map((clip, clipIndex) => (
                            <ClipButton 
                                key={`${layer.id}-${clipIndex}`} 
                                clip={clip} 
                                onClick={() => onTriggerClip(layerIndex, clipIndex)}
                                thumbnailUrl={thumbnails[`${layerIndex}-${clipIndex}`]}
                            />
                        ))}
                        {layer.clips.length === 0 && (
                            <div className="text-slate-600 italic text-sm p-4 border border-dashed border-slate-800 rounded w-full">No clips in this layer</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};