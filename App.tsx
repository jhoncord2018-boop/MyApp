import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ConnectionSettings, ResolumeComposition } from './types';
import * as api from './services/resolumeService';
import { SettingsModal } from './components/SettingsModal';
import { LayerStrip } from './components/LayerStrip';
import { ColumnHeader } from './components/ColumnHeader';

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
    
    // Feature States
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [areThumbnailsLoaded, setAreThumbnailsLoaded] = useState<boolean>(false);
    
    // Master Preview State
    const [masterPreviewBlob, setMasterPreviewBlob] = useState<string | null>(null);
    const activePreviewBlobRef = useRef<string | null>(null);

    // Polling References
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const previewRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch Data Logic
    const fetchData = async () => {
        try {
            const data = await api.fetchComposition(settings);
            setComposition(prev => {
                // If we are dragging a slider, we might want to defer updates, 
                // but for now, we just overwrite. Ideally, we merge opacity if interacting.
                // However, the optimistic update below handles the immediate interaction.
                return data;
            });
            setIsConnected(true);
            setError(null);
            if (!isConnected && error) setIsSettingsOpen(false);
        } catch (err) {
            setIsConnected(false);
        }
    };

    // Initialize & Composition Polling
    useEffect(() => {
        fetchData();
        pollingRef.current = setInterval(fetchData, 500);
        
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [settings]);

    // Master Preview Polling (Blob Strategy)
    useEffect(() => {
        if (!isConnected) return;

        const updatePreview = async () => {
            try {
                // Fetch new blob
                const blobUrl = await api.fetchCompositionThumbnail(settings);
                if (blobUrl) {
                    // Revoke old blob to prevent memory leak
                    if (activePreviewBlobRef.current) {
                        URL.revokeObjectURL(activePreviewBlobRef.current);
                    }
                    // Update state
                    activePreviewBlobRef.current = blobUrl;
                    setMasterPreviewBlob(blobUrl);
                }
            } catch (e) {
                console.error("Preview fetch failed", e);
            }
        };

        // Poll every 1 second (1000ms) as requested
        previewRef.current = setInterval(updatePreview, 1000);
        updatePreview(); // Initial fetch

        return () => {
            if (previewRef.current) clearInterval(previewRef.current);
            // Cleanup blob on unmount/re-effect
            if (activePreviewBlobRef.current) {
                URL.revokeObjectURL(activePreviewBlobRef.current);
                activePreviewBlobRef.current = null;
            }
        };
    }, [settings, isConnected]);

    // Load Clip Thumbnails Logic
    useEffect(() => {
        // Only load if connected, composition exists, and haven't loaded yet
        if (isConnected && composition && !areThumbnailsLoaded) {
            const loadAllThumbnails = async () => {
                const newThumbnails: Record<string, string> = {};
                const promises: Promise<void>[] = [];

                composition.layers.forEach((layer, layerIdx) => {
                    layer.clips.forEach((clip, clipIdx) => {
                        const p = api.fetchClipThumbnail(settings, layerIdx, clipIdx)
                            .then(url => {
                                if (url) {
                                    newThumbnails[`${layerIdx}-${clipIdx}`] = url;
                                }
                            });
                        promises.push(p);
                    });
                });

                await Promise.all(promises);
                setThumbnails(prev => ({ ...prev, ...newThumbnails }));
                setAreThumbnailsLoaded(true);
            };

            loadAllThumbnails();
        }
    }, [composition, isConnected, areThumbnailsLoaded, settings]);

    // Cleanup object URLs for clip thumbnails on unmount
    useEffect(() => {
        return () => {
            Object.values(thumbnails).forEach(url => URL.revokeObjectURL(url));
        };
    }, []); // Run only on unmount

    // Derived State
    const maxColumns = useMemo(() => {
        if (!composition) return 0;
        return Math.max(...composition.layers.map(l => l.clips.length), 0);
    }, [composition]);

    // Handlers
    const handleSaveSettings = (newSettings: ConnectionSettings) => {
        setSettings(newSettings);
        localStorage.setItem('resolume_settings', JSON.stringify(newSettings));
        setIsSettingsOpen(false);
        setComposition(null);
        setError(null);
        
        // Reset thumbnail state on new connection
        setThumbnails({});
        setAreThumbnailsLoaded(false);

        // Reset Master Preview state
        if (activePreviewBlobRef.current) {
            URL.revokeObjectURL(activePreviewBlobRef.current);
            activePreviewBlobRef.current = null;
        }
        setMasterPreviewBlob(null);
    };

    const handleTriggerClip = async (layerIdx: number, clipIdx: number) => {
        try {
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

    const handleTriggerColumn = async (colIdx: number) => {
        try {
            await api.triggerColumn(settings, colIdx);
        } catch (e) {
            console.error("Failed to trigger column", e);
        }
    };

    // FIXED: Optimistic UI Update for Opacity
    const handleOpacityChange = async (layerIdx: number, value: number) => {
        // 1. Optimistically update local state so the slider moves instantly
        setComposition(prev => {
            if (!prev) return null;
            
            // Create a deep copy of the layers to modify the specific opacity
            const newLayers = prev.layers.map((layer, idx) => {
                if (idx !== layerIdx) return layer;
                return {
                    ...layer,
                    video: {
                        ...layer.video,
                        opacity: {
                            ...layer.video.opacity,
                            value: value
                        }
                    }
                };
            });

            return { ...prev, layers: newLayers };
        });

        // 2. Send API request in background
        try {
            await api.setLayerOpacity(settings, layerIdx, value);
        } catch (e) {
            console.error("Failed to set opacity", e);
            // On error, the next polling cycle will revert the slider, which is acceptable behavior
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
                        <h1 className="text-xl font-bold tracking-wider text-slate-100 hidden sm:block">
                            RESO<span className="text-cyan-400">CTRL</span>
                        </h1>
                    </div>
                    
                    {/* Master Preview Box (Mini) */}
                    {isConnected && (
                        <div className="hidden md:flex items-center gap-3 bg-black/40 p-1 rounded border border-slate-700">
                            <span className="text-[10px] font-mono text-slate-500 uppercase px-1 transform -rotate-90">Master</span>
                            <div className="w-24 h-14 bg-black relative rounded overflow-hidden">
                                {masterPreviewBlob ? (
                                    <img 
                                        src={masterPreviewBlob} 
                                        alt="Live Output" 
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        <div className="w-4 h-4 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
            <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                {!composition && !isConnected ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                        <p>Connecting to Resolume...</p>
                        <p className="text-xs mt-2">Check your IP/Port settings.</p>
                    </div>
                ) : composition ? (
                    <div className="flex-1 flex flex-col pb-20">
                        {/* Composition Info Banner */}
                        <div className="p-4 bg-slate-900/50 flex items-center justify-between border-b border-slate-800">
                            <div>
                                <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Composition</h2>
                                <p className="text-lg text-white font-bold">{composition.name?.value || "Untitled"}</p>
                            </div>
                        </div>

                        {/* Column Header Sticky Row */}
                        <ColumnHeader numColumns={maxColumns} onTriggerColumn={handleTriggerColumn} />

                        {/* Layers Container */}
                        <div className="flex flex-col-reverse">
                            {composition.layers.map((layer, idx) => (
                                <LayerStrip 
                                    key={layer.id} 
                                    layer={layer} 
                                    layerIndex={idx}
                                    onTriggerClip={handleTriggerClip}
                                    onClearLayer={handleClearLayer}
                                    onOpacityChange={handleOpacityChange}
                                    thumbnails={thumbnails}
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