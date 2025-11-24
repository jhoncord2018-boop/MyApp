import React, { useState, useEffect, useRef } from 'react';
import { ConnectionSettings, ResolumeComposition } from './types';
import * as api from './services/resolumeService';
import { SettingsModal } from './components/SettingsModal';
import { LayerStrip } from './components/LayerStrip';

// Default settings
const DEFAULT_SETTINGS: ConnectionSettings = {
    ip: '127.0.0.1',
    port: 8080
};

const App: React.FC = () => {
    // Application State
    const [settings, setSettings] = useState<ConnectionSettings>(() => {
        const saved = localStorage.getItem('resolume_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });
    
    const [composition, setComposition] = useState<ResolumeComposition | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    // Polling Reference
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch Data Logic
    const fetchData = async () => {
        try {
            const data = await api.fetchComposition(settings);
            setComposition(data);
            setIsConnected(true);
            setError(null);
            // If we successfully fetch, close settings if it was forced open due to error
            if (!isConnected && error) setIsSettingsOpen(false);
        } catch (err) {
            setIsConnected(false);
            // Only set error if we were previously connected or if this is the initial attempt
            // This prevents error flashing during simple network hiccups
            // console.error(err); 
        }
    };

    // Initialize & Polling Loop
    useEffect(() => {
        // Immediate fetch
        fetchData();

        // Start polling
        pollingRef.current = setInterval(fetchData, 500); // Poll every 500ms for high responsiveness

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [settings]); // Re-run when settings change

    // Handlers
    const handleSaveSettings = (newSettings: ConnectionSettings) => {
        setSettings(newSettings);
        localStorage.setItem('resolume_settings', JSON.stringify(newSettings));
        setIsSettingsOpen(false);
        // Reset state to force a fresh connection attempt UI
        setComposition(null);
        setError(null);
    };

    const handleTriggerClip = async (layerIdx: number, clipIdx: number) => {
        try {
            // Optimistic UI update could go here, but Resolume is fast enough with 500ms polling usually
            await api.triggerClip(settings, layerIdx, clipIdx);
        } catch (e) {
            console.error("Failed to trigger clip", e);
        }
    };

    const handleClearLayer = async (layerIdx: number) => {
        try {
            await api.clearLayer(settings, layerIdx);
        } catch (e) {
            console.error("Failed to clear layer", e);
        }
    };

    const handleOpacityChange = async (layerIdx: number, value: number) => {
        try {
            // Immediate local update for smooth slider dragging (optional, simpler to just send)
            await api.setLayerOpacity(settings, layerIdx, value);
        } catch (e) {
            console.error("Failed to set opacity", e);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
                    <h1 className="text-xl font-bold tracking-wider text-slate-100">
                        RESO<span className="text-cyan-400">CTRL</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {!isConnected && (
                        <span className="text-xs text-red-400 hidden md:inline-block">
                            Attempting connection to {settings.ip}:{settings.port}...
                        </span>
                    )}
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        title="Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {!composition && !isConnected ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                        <p>Connecting to Resolume...</p>
                        <p className="text-xs mt-2">Check your IP/Port settings.</p>
                    </div>
                ) : composition ? (
                    <div className="pb-20">
                        {/* Composition Info */}
                        <div className="p-4 bg-slate-900/50 mb-2">
                            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Composition</h2>
                            <p className="text-lg text-white">{composition.name?.value || "Untitled"}</p>
                        </div>

                        {/* Layers */}
                        <div className="flex flex-col-reverse"> 
                        {/* Flex-col-reverse because usually Layer 1 is at bottom visually in Resolume UI, 
                            but standard VJ setup usually lists Layer 3 above Layer 1. 
                            Let's keep standard array order (Layer 1 top) or reverse based on preference. 
                            Resolume API returns Layer 1 at index 0. 
                            Resolume GUI puts Layer 1 at bottom. Let's reverse to match GUI. 
                        */}
                            {composition.layers.map((layer, idx) => (
                                <LayerStrip 
                                    key={layer.id} 
                                    layer={layer} 
                                    layerIndex={idx}
                                    onTriggerClip={handleTriggerClip}
                                    onClearLayer={handleClearLayer}
                                    onOpacityChange={handleOpacityChange}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}
            </main>

            {/* Modals */}
            <SettingsModal 
                isOpen={isSettingsOpen || (!isConnected && !composition)}
                onSave={handleSaveSettings}
                initialSettings={settings}
                status={!isConnected ? "Not Connected" : "Connected"}
            />
        </div>
    );
};

export default App;