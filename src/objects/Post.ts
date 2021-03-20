export interface Post {
    id: string; // permalink
    caption: string;
    type: "image" | "video";
    data: string; // url_thing...
}