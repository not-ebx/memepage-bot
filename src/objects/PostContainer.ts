/* tslint:disable:no-console */
import probe from 'probe-image-size';
import { isInDatabase } from '../database/DatabaseHandler';
import { REDDIT_SECTION, REDDIT_URLS } from '../constats';
import { VideoPost, ImagePost } from "./Post";
import axios from 'axios';

export class PostContainer {
    imagePosts : ImagePost[];
    videoPosts : VideoPost[];
    
    constructor() {
        this.imagePosts = new Array<ImagePost>();
        this.videoPosts = new Array<VideoPost>();
    }

    private validRatio = (h: number, w: number) => {
        const ratio : number = w/h;
        return ratio >= 1 && ratio <= 1.91;
    }

    // Returns "video" if it is a video, "image" if an image, "none" if none.
    private isValidImage = async (posts: ImagePost) => {

        // Regex to find if it is an image
        const imgRegex = /(\w|\d)*.(png|jpeg|jpg)/;

        
        if(!isInDatabase(posts) && imgRegex.test(posts.url)){
                const dimensions = await probe(posts.url);

                // Check if the ratio is correct for instagram post
                if(this.validRatio(dimensions.height, dimensions.width )){
                    return true;
                }
        }
        return false;

    }

    private hasAudio = (vidUrl: string) => {
        const strSplit = vidUrl.split("DASH");
        if(strSplit.length < 2) // Has less than 2 values
            return "";

        const audioLink = strSplit[0] + "DASH_audio.mp4";

        return axios.get(audioLink)
            .then(
                (_result) => {
                    // Has audio.
                    return audioLink;
                }
            )
            .catch(
                (_error) => {
                    // Has no audio.
                    return "";
                }
            );
    }

    private isValidVideo = (video: VideoPost) => {
        const vidRegex = /(\w|\d)*.(mp4)/;
        if(!isInDatabase(video) && video.url !== undefined && vidRegex.test(video.url) && this.validRatio(video.h, video.w)){
            return true;
        }
        return false;
    }


    getValidPosts = async () => {
        for(let i = 0; i<REDDIT_URLS.length; i++){
            for(let j = 0; j<REDDIT_SECTION.length; j++){
                const memeSourceJson = await axios.get(REDDIT_URLS[i] + REDDIT_SECTION[j]);
                console.log(REDDIT_URLS[i] + REDDIT_SECTION[j]);
                const redditPosts : any[] = memeSourceJson.data['data']['children'];
                //console.log(redditPosts);

                // First, filter the ones that are not an image.
                // Image location: 'url_overriden_by_dest' -> *.png / *.jpg
                for(let i = 0; i< redditPosts.length; i++){
                    let post = redditPosts[i];

                    if(post['data']["is_video"] === false){
                        const newPost : ImagePost = {
                            id: post['data']['name'],
                            poster: post['data']['author'],
                            caption: post['data']['title'],
                            url: post['data']['url_overridden_by_dest']
                        }
                        if(await this.isValidImage(newPost)){
                            this.imagePosts.push(newPost);
                        }
                        
                    }
                    else{
                        // If it is a video...
                        const newPost : VideoPost = {
                            id: post['data']['name'],
                            poster: post['data']['author'],
                            caption: post['data']['title'],
                            url : post['data']['media']['reddit_video']['fallback_url'],
                            h: post['data']['media']['reddit_video']['height'],
                            w: post['data']['media']['reddit_video']['width'],
                            duration: post['data']['media']['reddit_video']['duration'],
                            isGif: post['data']['media']['reddit_video']['is_gif'],
                            audioUrl: await this.hasAudio(post['data']['media']['reddit_video']['fallback_url']) //false
                        }

                        if(this.isValidVideo(newPost)){
                            this.videoPosts.push(newPost);
                        }
                    }
                }
            }
        }

    }   
}