export type VideoSourceType = 'file' | 'youtube';

export interface VideoSource {
    type: VideoSourceType;
    data: File | string;
    userDescription?: string; // For file uploads
}

export interface ThumbnailCandidate {
    url: string;
    timestamp?: number;
}
