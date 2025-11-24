import React, { useState, useEffect } from 'react';
import { ConnectionSettings } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onSave: (settings: ConnectionSettings) => void;
    initialSettings: ConnectionSettings;
    status?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onSave, initialSettings, status }) => {
    const [ip, setIp] = useState(initialSettings.ip);
    const [port, setPort] = useState(initialSettings.port);

    useEffect(() => {
        setIp(initialSettings.ip);
        setPort(initialSettings.port);
    }, [initialSettings]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ip, port });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md shadow-2xl shadow-cyan-900/20">
                <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    Connection Settings
                </h2>
                
                <p className="text-slate-400 text-sm mb-6">
                    Enter the IP address and Port of the machine running Resolume Arena/Avenue. 
                    Default is <code className="text-cyan-300">localhost:8080</code>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">IP Address</label>
                        <input 
                            type="text" 
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            placeholder="127.0.0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Port</label>
                        <input 
                            type="number" 
                            value={port}
                            onChange={(e) => setPort(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            placeholder="8080"
                        />
                    </div>

                    {status && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
                            {status}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                        Connect
                    </button>
                </form>
            </div>
        </div>
    );
};