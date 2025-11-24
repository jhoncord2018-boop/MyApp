// Basic representation of Resolume JSON structure
// Note: Resolume API returns a very deep object. We map only what we need.

export interface ResolumeParam {
    id: number;
    value: number;
    min?: number;
    max?: number;
}

export interface ResolumeClip {
    id: number;
    name: {
        value: string;
    };
    connected: {
        value: boolean; // "Connected" means currently playing
    };
    transport?: {
        position?: {
            value: number;
            max: number;
        }
    };
    thumbnail?: {
        value: string; // Base64 string sometimes provided
    };
}

export interface ResolumeLayer {
    id: number;
    name: {
        value: string;
    };
    clips: ResolumeClip[];
    video: {
        opacity: ResolumeParam;
    };
    // Used for clearing the layer
    connected?: {
        value: boolean;
    };
}

export interface ResolumeComposition {
    name: {
        value: string;
    };
    layers: ResolumeLayer[];
}

export interface ConnectionSettings {
    ip: string;
    port: number;
}