// FIX: Import ThumbnailCandidate type to resolve TypeScript errors.
import type { ThumbnailCandidate } from '../types';

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string));
    reader.onerror = (error) => reject(error);
  });

export const urlContentToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    // For data URLs, we can parse them directly
    if (url.startsWith('data:')) {
        const parts = url.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const base64 = parts[1];
        return { base64, mimeType };
    }
    
    // For other URLs, fetch the content
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = reject;
    });
};

export const extractFramesFromVideo = (videoFile: File, frameCount: number): Promise<ThumbnailCandidate[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fileURL = URL.createObjectURL(videoFile);

        video.src = fileURL;
        video.muted = true;

        let frames: ThumbnailCandidate[] = [];

        video.onloadedmetadata = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const duration = video.duration;
            if (duration === Infinity || isNaN(duration) || duration === 0) {
                 reject(new Error("Could not determine video duration. The video file might be corrupted or in an unsupported format."));
                 return;
            }

            const interval = duration / (frameCount + 1);

            for (let i = 1; i <= frameCount; i++) {
                const timestamp = interval * i;
                video.currentTime = timestamp;
                // Wait for the seek to complete
                await new Promise<void>(resolveSeek => {
                    video.onseeked = () => resolveSeek();
                });

                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push({
                        url: canvas.toDataURL('image/jpeg'),
                        timestamp: Math.round(timestamp)
                    });
                }
            }
            URL.revokeObjectURL(fileURL);
            resolve(frames);
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(fileURL);
            console.error("Video element error:", e);
            reject(new Error("Failed to load video file. It might be corrupted or in an unsupported format."));
        };
    });
};