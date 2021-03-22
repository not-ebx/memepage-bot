import { checkValidImages, uploadPicture } from './UploadImage';
import axios from 'axios';
import { Post } from './objects/Post';
import { addToDatabase } from './database/DatabaseHandler';
import { configLogger, logError, logInfo } from './logger';
import { waitFor } from './utils/Wait';
import { REDDIT_SECTION, REDDIT_URLS } from './constats';

// Get posts from reddit
// Every X hours, upload the best one (?)
// rinse and repeat.



const getImagePosts = async () => {
    let allPosts : Post[] = [];
    try {
        for(let i = 0; i<REDDIT_URLS.length; i++){
            for(let j = 0; j<REDDIT_SECTION.length; j++){
                const memeSourceJson = await axios.get(REDDIT_URLS[i] + REDDIT_SECTION[j]);
                console.log(REDDIT_URLS[i] + REDDIT_SECTION[j]);
                const redditPosts : any[] = memeSourceJson.data['data']['children'];
                //console.log(redditPosts);

                // First, filter the ones that are not an image.
                // Image location: 'url_overriden_by_dest' -> *.png / *.jpg
                const postData = redditPosts.map(
                    (post : any) => {
                        const newPost : Post = {
                            id: post['data']['name'],
                            type: "image",
                            caption: post['data']['title'],
                            data: post['data']['url_overridden_by_dest']
                        }
                        return newPost;
                    }
                );

                // Filter the array, get only images.
                const postImages = await checkValidImages(postData); 
                allPosts = allPosts.concat(postImages);
            }
        }

        logInfo("Selected " +allPosts.length + " posts.");
        return allPosts;
    }
    catch(exception) {
        logError("Error during getImagePosts...");
        logError(exception);
        return null;
    }
}

const main = async () => {
    const images = await getImagePosts();
    // Select a random one
    if(images && images.length > 0){
        const selected = Math.floor(Math.random() * Math.floor(images.length));
        console.log(images);
        console.log(`SELECTED IMAGE: ${selected} / ${images.length-1}`);
        console.log(`URL: ${images[selected].data}`)

        
        addToDatabase(images[selected]);
        uploadPicture(images[selected].caption, images[selected].data)
        .catch(
            async (error) => {
                logError(error);
                await waitFor(1000*30);
                main();
            }
        );
        
    }
    else{
        logError("NO MORE POSTS FOUND sad face");
    }
}

configLogger();

main();
setInterval(
    () => main(),
    1000 * 60 * 60 * 4 // Post every 4 hours D:
);

