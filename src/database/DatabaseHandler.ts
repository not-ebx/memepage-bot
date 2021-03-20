import { Post } from "src/objects/Post";
import * as fs from 'fs';

const DB_LOCATION = "./database.json";

interface PostData {
    dataUrl: string;
    creationDate: number;
}

const createDatabaseIfDoesNotExists = () => {
    // check if database exists
    if(fs.existsSync(DB_LOCATION)){
       return; 
    }
    else{
        // If it doesnt, we create it.
        const emptyDb : PostData[] = [];
        const db = JSON.stringify(emptyDb);
        fs.writeFileSync(DB_LOCATION, db)
    }
}


export const addToDatabase = ( post : Post ) => {
    const db : PostData[] = readDatabase();
    const newPostData : PostData = {
        dataUrl : post.data,
        creationDate: (new Date(Date.now() + 604800000)).getTime()
    }

    db.push(newPostData);

    fs.writeFileSync(DB_LOCATION, JSON.stringify(db));
}

export const readDatabase = () => {
    createDatabaseIfDoesNotExists();
    // Read database contents
    const jsonDB = fs.readFileSync(DB_LOCATION);
    const database : PostData[] = JSON.parse(jsonDB.toString());

    // We will now filter!
    const date = new Date().getTime();
    const filteredDatabase = database.filter(
        (post : PostData) => post.creationDate > date // It is 1 week old
    );

    return filteredDatabase;
}

export const isInDatabase = (post: Post) => {
    const database : PostData[] = readDatabase();

    const isIn : boolean = database.some(
        (postData : PostData) => postData.dataUrl === post.data
    )

    return isIn;
}