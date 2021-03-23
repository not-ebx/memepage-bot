import { uploadPicture } from './UploadImage';
import { addToDatabase } from './database/DatabaseHandler';
import { configLogger, logError } from './logger';
import { waitFor } from './utils/Wait';
import { downloadAndUploadVideo} from './UploadVideo';  
import { PostContainer } from './objects/PostContainer';

// Get posts from reddit
// Every X hours, upload the best one (?)
// rinse and repeat.


const accountManager = async (postVideo : boolean) => {
    const postDB = new PostContainer();
    await postDB.getValidPosts()
    .catch(
        (err) => {
            console.log(err);
            logError(err);
        }
    );
    
    //downloadAndUploadVideo(postDB.videoPosts[0]);
    const selected = postVideo ? postDB.videoPosts : postDB.imagePosts;
    
    if(selected && selected.length > 0){
        const ri = Math.floor(Math.random() * Math.floor(selected.length));
        console.log(`SELECTED IMAGE: ${ri} / ${selected.length-1}`);
        console.log(`URL: ${selected[ri].url}`)
    

        
        addToDatabase(selected[ri]);
        if(!postVideo)
            uploadPicture(postDB.imagePosts[ri].caption, selected[ri].url)
            .catch(
                async (error) => {
                    logError(error);
                    await waitFor(1000*30);
                    accountManager(postVideo);
                }
            );
        else
            downloadAndUploadVideo(postDB.videoPosts[ri])
                .catch(
                    async (error) => {
                        logError(error);
                        await waitFor(1000*30);
                        accountManager(postVideo);
                    }
                )
        
    }
    else{
        logError("NO MORE POSTS FOUND sad face");
    }
}


const main = async () => {
    let video = true;
    configLogger();

    accountManager(video);
    setInterval(
        () => {
            video = !video;
            accountManager(video);
        },
        1000 * 60 * 60 * 3 // Every 3 Hours.
    )
}

configLogger();
main();


