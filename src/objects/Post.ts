export interface ImagePost {
    id: string;
    poster: string;
    caption: string;
    url: string;
}

export interface VideoPost {
    id: string;
    poster: string;
    caption: string;
    url: string;
    h: number;
    w: number;
    duration: number; // Check if this is shorter than 60 seconds.
    isGif: boolean;
    audioUrl: string;
}

export const generateCaption = (post : VideoPost | ImagePost) => {
    return `${post.caption}\n(By u/${post.poster} on Reddit)\n`
}