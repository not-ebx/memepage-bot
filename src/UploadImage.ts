/* tslint:disable:no-console */
import { IgApiClient } from 'instagram-private-api';
import { get } from 'request-promise'; // request is already declared as a dependency of the library
import probe from 'probe-image-size';
import { ImagePost } from './objects/Post';
import { isInDatabase } from './database/DatabaseHandler';
import { defaultCaption, PASSWORD, USERNAME } from './constats';

// TODO: Categorize TYPE on posts too! SOONTM For Videos :)
export const checkValidImages = async (posts : ImagePost[]) => {
    const filteredPosts : ImagePost[] = [];

    // Regex to find if it is an image
    const regex = /(\w|\d)*.(png|jpeg|jpg)/;
    
    // For post in posts...
    for(let i = 0; i<posts.length ; i++){
        // Check the filter, both db and regex
        if(!isInDatabase(posts[i]) && regex.test(posts[i].url)){
            const dimensions = await probe(posts[i].url);
            const ratio : number = dimensions.width/dimensions.height;

            // Check if the ratio is correct for instagram post
            if((ratio >= 1 && ratio <= 1.91)){
                filteredPosts.push(posts[i]);
            }
        }
    }

    return filteredPosts;
}

export const uploadPicture = async (title: string, imageUrl : string) => {
    const caption = `${title} ${defaultCaption}`;

    const ig = new IgApiClient();
    ig.state.generateDevice(USERNAME);
    const auth = await ig.account.login(USERNAME,PASSWORD);
    console.log(auth);

    const imageBuffer = await get({
        url: imageUrl, 
        encoding: null, 
    });


    // We return the promise, so we can handle the error in the main function    
    return ig.publish.photo({
        file: imageBuffer, // image buffer, you also can specify image from your disk using fs
        caption: caption, // nice caption (optional)
        
    });
}
