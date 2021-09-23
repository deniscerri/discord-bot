
const Discord = require("discord.js");
const fetch = require('node-fetch');

let reddit = [
    "dankruto",
    "memes",
    "funny",
    "animememes",
    "AdviceAnimals",
    "dankmemes",
    "wholesomememes",
    "meirl",
    "2meirl4meirl",
    "comedyheaven",
    "programmerhumor",
    "cursedcomments",
    "blursedimages",
    "dashcamgifs",
    "theyknew",
    "CrappyDesign",
    "starterpacks"
]



module.exports = {
    name: 'meme',
    aliases: ['memes','meem','mem'],
    description: 'Send Memes',
    execute(message, args) {
        let subreddit = '';
        if(!args){
            subreddit = reddit[Math.floor(Math.random() * reddit.length)];
        }else{
            subreddit = args[0];
        }
        fetch(`https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=100`)
        .then(res => res.json())
        .then(json => {
            if(json.data.dist == 0){
                message.channel.send("Couldn't find subreddit.");
            }else{
                var random = Math.floor(Math.random() * (json.data.children).length);

                if((json.data.children)[0].data.over_18){
                    if(!message.channel.nsfw){
                        message.channel.send("This subreddit is NSFW. Send the command in a NSFW Channel!");
                        return;
                    }
                }
                var thememe = (json.data.children)[random].data;
                
                let embed = new Discord.MessageEmbed()
                    .setTitle(thememe.title)
                    .setURL(`https://reddit.com${thememe.permalink}`)
                    .setFooter(`👍 ${thememe.ups} 💬 ${thememe.num_comments} | Subreddit: r/ ${thememe.subreddit}`)

                message.channel.send(thememe.url)
                message.channel.send(embed);
                
                
            }
            
        
        });

      return;
  },
};