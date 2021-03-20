# Meme Bot for Instagram
Meme bot for instagram is a NodeJS application that uses [instagram-private-api](https://github.com/dilame/instagram-private-api) to automate the stealing and posting of memes from reddit to instagram. This behaviour is based on the usual behaviour of meme pages on that site.

## How to use
To use meme bot, all you have to do is `npm install`, create a `.env` file using `.env.example` as an example, and fill it with your username / password data. Keep in mind that I was not using a proxy, so the line for the proxy usage is commented out on `src/UploadImage.ts`.

After configuring your instagram account, you can edit the file `src/constants.ts` to select the subreddits you wanna steal from, by editing the array `REDDIT_URLS`.

On the same file, there's a variable called `defaultCaption`, that's what's going to be written at the caption after the title of the post on reddit, so it will be something like this:
```
{Reddit Thread Title} + {defaultCaption}
```

## Executing
This project uses typescript, you can compile the project by using `npm run watch` and then execute it by using `npm run dev`, the project uses tsc and nodemon to do so.

## TO-DOs
- [x] Basic version with image upload
- [ ] Video ~~stealing~~ upload support
- [ ] Share memes to stories
- [ ] Rate the best memes (Need to have followers so probably never gonna happen)


## Credits
Well, credits goes to reddit for having the json output for their subreddits and instagram-private-api, cause they saved my ass by having this available for everyone!
And me I guess, cause I hacked this together... ?

## License
We use GNU General Public License v3.0, you can read more about it on the `LICENSE` file at the repository or at [choosealicense.com site](https://choosealicense.com/licenses/gpl-3.0/).
