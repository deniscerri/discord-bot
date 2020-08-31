const randomPuppy = require('random-puppy');


module.exports = {
    name: 'meme',
    aliases: ['memes'],
    execute(message, args) {
      meme(message, args);
      return;
  },
};



async function meme(message, args){

    let reddit = [
        "dankruto",
        "memes",
        "funny",
        "animememes",
        "dankmemes",
        "wholesomememes",
        "meirl",
        "2meirl4meirl"
        
    ]

    let subreddit = reddit[Math.floor(Math.random() * reddit.length)];



    randomPuppy(subreddit).then(async url => {
            await message.channel.send({
                files: [{
                    attachment: url,
                    name: 'meme.png',
                }]
            })
    }).catch(err => console.error(err));


    

    return;

}

