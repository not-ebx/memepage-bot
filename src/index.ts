import { checkValidImages, uploadPicture } from './UploadImage';
import axios from 'axios';
import { Post } from './objects/Post';
import { addToDatabase } from './database/DatabaseHandler';
import { configLogger, logError } from './logger';
import { waitFor } from './utils/Wait';

// Get posts from reddit
// Every X hours, upload the best one (?)
// rinse and repeat.

//uploadPicture("https://picsum.photos/800/800");

const getImagePosts = async () => {
    const memeSource = "https://www.reddit.com/r/cursedmemes/top/.json"; // Default is 22 posts :)
    try {
        const memeSourceJson = await axios.get(memeSource);
        const redditPosts : any[] = memeSourceJson.data['data']['children'];
        //console.log(redditPosts);

        // First, filter the ones that are not an image.
        // Image location: 'url_overriden_by_dest' -> *.png / *.jpg
        const postData = redditPosts.map(
            (post : any) => {
                const newPost : Post = {
                    id: post['data']['permalink'],
                    type: "image",
                    caption: post['data']['title'],
                    data: post['data']['url_overridden_by_dest']
                }
                return newPost;
            }
        );

        // Filter the array, get only images.
        const postImages = await checkValidImages(postData); 

        return postImages;
    }
    catch(exception) {
        logError("Error during getImagePosts...");
        logError(exception);
        return null;
    }
}

const main = async () => {
    const images = await getImagePosts();
    console.log(images);
    // Select a random one
    if(images && images.length > 0){
        const selected = Math.floor(Math.random() * Math.floor(images.length));
        console.log(`SELECTED IMAGE: ${selected} / ${images.length-1}`);
        console.log(`URL: ${images[selected].data}`)

        addToDatabase(images[selected]);
        //uploadPicture(images[selected].caption, images[selected].data);
        const ret = await uploadPicture("test caption", "https://i.redd.it/sw651simx2o61.png");

        // If ret is false, we will wait 5 minutes then we post.
        if(!ret){
            await waitFor(1000*60*5);
            main();
        }
    }
    else{
        logError("NO MORE POSTS FOUND sad face");
    }
}

configLogger();
//logError("Test");


setInterval(
    () => main(),
    1000 * 60 * 60 * 4 // Post every 4 hours D:
);

