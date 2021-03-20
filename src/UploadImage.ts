/* tslint:disable:no-console */
import 'dotenv/config';
import { IgApiClient } from 'instagram-private-api';
import { get } from 'request-promise'; // request is already declared as a dependency of the library
import probe from 'probe-image-size';
import { Post } from './objects/Post';
import { isInDatabase } from './database/DatabaseHandler';
import { logError, logInfo } from './logger';

// TODO: Categorize TYPE on posts too! SOONTM For Videos :)
export const checkValidImages = async (posts : Post[]) => {
    const filteredPosts : Post[] = [];
    const regex = /(\w|\d)*.(png|jpeg|jpg)/;
    
    for(let i = 0; i<posts.length ; i++){
        if(!isInDatabase(posts[i]) && regex.test(posts[i].data)){
            const dimensions = await probe(posts[i].data);
            const ratio : number = dimensions.width/dimensions.height;
            if((ratio >= 1 && ratio <= 1.91)){
                filteredPosts.push(posts[i]);
            }
        }
    }

    return filteredPosts;
}

export const uploadPicture = async (title: string, imageUrl : string) => {
    const caption = `${title}\n.\n.\n.\n.\nTags! Ignore this.\n#meme #dankmeme #reddit #bot #automatedcontent #cursedmeme #cursed #funny #cat #pet #programming`;

    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME ? process.env.IG_USERNAME : "" );
    //ig.state.proxyUrl = process.env.IG_PROXY;
    const auth = await ig.account.login(process.env.IG_USERNAME ? process.env.IG_USERNAME : "", process.env.IG_PASSWORD ? process.env.IG_PASSWORD : "");
    console.log(JSON.stringify(auth));

    // getting random square image from internet as a Buffer

    const imageBuffer = await get({
        url: imageUrl, // random picture with 800x800 size
        encoding: null, // this is required, only this way a Buffer is returned
    });


    try{
        const publishResult = await ig.publish.photo({
            file: imageBuffer, // image buffer, you also can specify image from your disk using fs
            caption: caption, // nice caption (optional)
            
        });
        

        console.log(publishResult) // publishResult.status should be "ok"
    }
    catch(err){
        logError(err);
        logInfo("Image URL: " + imageUrl);
        logInfo("Image Caption: " + title);
    }
}
