import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { logError } from './logger';
import { generateCaption, VideoPost } from './objects/Post';
import fs from 'fs';
import { IgApiClient } from 'instagram-private-api';
import { defaultCaption, PASSWORD, USERNAME } from './constats';


const promiseCommand = (cmd : FfmpegCommand) => {
    return new Promise(
        (cb) => {
            cmd
            .on('end', () => { cb(null) })
            .on('error', (error: any) => { cb(error) })
            .run()
        }
    )
}

// timestamp.mp3

const uploadVideo = (ig : IgApiClient, vidLocation: string, coverLocation: string, video: VideoPost) => {
    if(video.duration > 60){
        // Upload to igTv
        return ig.publish.igtvVideo({
            video: fs.readFileSync(vidLocation),
            coverFrame: fs.readFileSync(coverLocation),
            title: video.caption + defaultCaption,
            caption: generateCaption(video)
            
        })
    }
    else{
        return ig.publish.video({
            video: fs.readFileSync(vidLocation),
            coverImage: fs.readFileSync(coverLocation),
            caption: generateCaption(video) + defaultCaption
        })
    }
}

export const downloadAndUploadVideo = async (videoPost : VideoPost) => {
    const timeStamp : number = new Date(Date.now()).getTime();
    let succ = false;
    console.log(videoPost);

    // Log into instagram
    const ig = new IgApiClient();
    ig.state.generateDevice(USERNAME);
    
    // Logged In!
    await ig.account.login(USERNAME, PASSWORD);

    // First, we generate the thumbnail.
    const tmbCmd = ffmpeg(videoPost.url)
        .takeScreenshots({
            count: 1,
            timemarks: [0]
            
        })
        .output(`./videos/${timeStamp}.jpg`)

    await promiseCommand(tmbCmd);

    if(fs.existsSync(`./video/${timeStamp}.jpg`)){
        console.log("Cant create thumbnail.");
        return Promise.reject(new Error('Could not generate thumbnail.'));
    }

    let cmd : FfmpegCommand;
    if(videoPost.audioUrl !== ""){
        cmd = ffmpeg(videoPost.url)
            .input(videoPost.audioUrl)
            .outputOptions(["-c:v copy", "-c:a aac"])
            .output(`./videos/${timeStamp}.mp4`)
    }
    else{
        cmd = ffmpeg(videoPost.url)
            .outputOption("-c:v copy")
            .output(`./videos/${timeStamp}.mp4`)
    }
    
    promiseCommand(cmd)
    .then(
        () => {
            console.log("Successful")
            // Upload the video
            uploadVideo(ig, `./videos/${timeStamp}.mp4`, `./videos/${timeStamp}.jpg`, videoPost)
            .then(
                () => {
                    succ = true;
                    fs.rm(`./videos/${timeStamp}.mp4`,
                        (error) => {
                            if(error)
                                logError(`Could not delete ${timeStamp}.mp4: ${error.message}`)
                        }
                    )
                    fs.rm(`./videos/${timeStamp}.jpg`,
                        (error) => {
                            if(error)
                                logError(`Could not delete ${timeStamp}.mp4: ${error.message}`)
                        }
                    )
                }
            )
            .catch(
                (err) => {
                    succ = false;
                    logError(err);

                    fs.rm(`./videos/${timeStamp}.mp4`,
                        (error) => {
                            if(error)
                                logError(`Could not delete ${timeStamp}.mp4: ${error.message}`)
                        }
                    )
                    fs.rm(`./videos/${timeStamp}.jpg`,
                        (error) => {
                            if(error)
                                logError(`Could not delete ${timeStamp}.mp4: ${error.message}`)
                        }
                    )

                }
            )
        })
    .catch(
        (err) => {
            console.log(err);
            logError(err);
        }
    );

    return succ 
    ? Promise.reject(new Error('Error while making the video'))
    : Promise.resolve();
}
