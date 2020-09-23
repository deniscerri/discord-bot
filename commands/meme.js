const fetch = require('node-fetch');
const Discord = require('discord.js');



module.exports = {
    name: 'meme',
    aliases: ['memes','meem','mem'],
    description: 'Send Memes',
    execute(message, args) {
      meme(message);
      return;
  },
};


async function meme(message){

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

        fetch(`https://meme-api.herokuapp.com/gimme/${subreddit}`)
            .then(res => res.json())
            .then(json => {
                
                let embed = new Discord.MessageEmbed()
                    .setTitle(json.title)
                    .setURL(json.postLink)
                    .setImage(json.url)
                    .setFooter(`👍 ${json.ups} Author: ${json.author}    Subreddit: r/ ${json.subreddit}`)
                message.channel.send(embed)
            });
}

