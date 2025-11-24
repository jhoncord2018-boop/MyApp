import axios from 'axios';
import { ConnectionSettings, ResolumeComposition } from '../types';

/*
  CORS NOTE:
  Resolume acts as a local web server. If you access this React app from a different
  origin (e.g., localhost:3000 vs localhost:8080), the browser will block requests
  unless Resolume sends Access-Control-Allow-Origin headers.
  
  Resolume usually handles this, but if issues arise:
  1. Ensure you are on the same network.
  2. Chrome extension "Allow CORS" can be used for testing.
  3. In production, serving this build folder directly *from* Resolume's webserver folder
     avoids CORS entirely.
*/

const getBaseUrl = (settings: ConnectionSettings) => {
    return `http://${settings.ip}:${settings.port}/api/v1`;
};

export const fetchComposition = async (settings: ConnectionSettings): Promise<ResolumeComposition> => {
    const url = `${getBaseUrl(settings)}/composition`;
    const response = await axios.get(url);
    return response.data;
};

export const triggerClip = async (settings: ConnectionSettings, layerIndex: number, clipIndex: number) => {
    // Resolume API: POST /composition/layers/{layer_id}/clips/{clip_id}/connect
    // Note: Resolume uses 1-based indices in some docs but the array is 0-indexed. 
    // Usually the REST API maps array indices directly.
    const url = `${getBaseUrl(settings)}/composition/layers/${layerIndex + 1}/clips/${clipIndex + 1}/connect`;
    await axios.post(url);
};

export const clearLayer = async (settings: ConnectionSettings, layerIndex: number) => {
    // Trigger the "Clear" button for the layer (effectively disconnects active clip)
    const url = `${getBaseUrl(settings)}/composition/layers/${layerIndex + 1}/clear`;
    await axios.post(url);
};

export const setLayerOpacity = async (settings: ConnectionSettings, layerIndex: number, value: number) => {
    // PUT /composition/layers/{id}/video/opacity
    // Value should be 0.0 to 1.0
    const url = `${getBaseUrl(settings)}/composition/layers/${layerIndex + 1}/video/opacity`;
    
    // Resolume expects the value directly or wrapped in an object depending on version.
    await axios.put(url, { value: value });
};

export const triggerColumn = async (settings: ConnectionSettings, columnIndex: number) => {
    // POST /composition/columns/{columnIndex}/connect
    // API is 1-based for columns
    const url = `${getBaseUrl(settings)}/composition/columns/${columnIndex + 1}/connect`;
    await axios.post(url);
};

export const fetchClipThumbnail = async (settings: ConnectionSettings, layerIndex: number, clipIndex: number): Promise<string | null> => {
    // GET /composition/layers/{layerId}/clips/{clipId}/thumbnail
    // Returns binary image data
    try {
        const url = `${getBaseUrl(settings)}/composition/layers/${layerIndex + 1}/clips/${clipIndex + 1}/thumbnail`;
        const response = await axios.get(url, { responseType: 'blob' });
        if (response.data) {
            return URL.createObjectURL(response.data);
        }
        return null;
    } catch (e) {
        // Thumbnail might not exist or connection failed
        return null;
    }
};

export const fetchCompositionThumbnail = async (settings: ConnectionSettings): Promise<string | null> => {
    // GET /composition/thumbnail
    // Returns binary image data for the master output
    try {
        const url = `${getBaseUrl(settings)}/composition/thumbnail`;
        // We append a timestamp to prevent browser caching of the request
        const response = await axios.get(url, { 
            responseType: 'blob',
            params: { t: Date.now() }
        });
        if (response.data) {
            return URL.createObjectURL(response.data);
        }
        return null;
    } catch (e) {
        return null;
    }
};