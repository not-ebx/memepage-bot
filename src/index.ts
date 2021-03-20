import { checkValidImages, uploadPicture } from './UploadImage';
import axios from 'axios';
import { Post } from './objects/Post';
import { addToDatabase } from './database/DatabaseHandler';
import { configLogger, logError, logInfo } from './logger';
import { waitFor } from './utils/Wait';

// Get posts from reddit
// Every X hours, upload the best one (?)
// rinse and repeat.

//uploadPicture("https://picsum.photos/800/800");

const REDDIT_URLS = [
    "https://www.reddit.com/r/cursedmemes/top/.json",
    "https://www.reddit.com/r/shitposting/top/.json",
    "https://www.reddit.com/r/Cursed_Images/top/.json",
    "https://www.reddit.com/r/dankmemes/top/.json",
    "https://www.reddit.com/r/bonehurtingjuice/top/.json",
];

const getImagePosts = async () => {
    let allPosts : Post[] = [];
    try {
        for(let i = 0; i<REDDIT_URLS.length; i++){
            const memeSourceJson = await axios.get(REDDIT_URLS[i]);
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
    console.log(images);
    console.log(images?.length);
    // Select a random one
    if(images && images.length > 0){
        const selected = Math.floor(Math.random() * Math.floor(images.length));
        console.log(`SELECTED IMAGE: ${selected} / ${images.length-1}`);
        console.log(`URL: ${images[selected].data}`)
        logInfo("Selected imageUrl: " + images[selected].data);

        addToDatabase(images[selected]);

        const ret = uploadPicture(images[selected].caption, images[selected].data);

        // If ret is false, we will wait 5 minutes then we post.
        
        if(!ret){
            logError(images[selected].data + " failed. Waiting to start again...");
            await waitFor(1000*60*5);
            logInfo("Starting main again.");
            main();
        }
        else{
            logInfo("Succesful post for "+images[selected].data);
        }
        
    }
    else{
        logError("NO MORE POSTS FOUND sad face");
    }
}

configLogger();
//logError("Test");


main();
setInterval(
    () => main(),
    1000 * 60 * 60 * 4 // Post every 4 hours D:
);

