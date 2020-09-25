
const Discord = require("discord.js");
const fetch = require('node-fetch');

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

module.exports = {
    name: 'meme',
    aliases: ['memes','meem','mem','memw'],
    description: 'Send Memes',
    execute(message, args) {
      
      
   
    let subreddit = '';
    if(args == ''){
        subreddit = reddit[Math.floor(Math.random() * reddit.length)];
    }else{
        subreddit = args;
    }

    
    postMeme(message,subreddit);

    

      return;
  },
};


function postMeme(message, subreddit){
    fetch(`https://www.reddit.com/r/${subreddit}.json?sort=top&t=week`)
    .then(res => res.json())
    .then(json => {


        if(json.data.dist == 0){
            message.channel.send("Couldn't find subreddit.");
        }else{
            var random = Math.floor(Math.random() * (json.data.children).length);

            console.log((json.data.children)[random]);
            
            let embed = new Discord.MessageEmbed()
                .setTitle((json.data.children)[random].data.title)
                .setURL(`https://reddit.com${(json.data.children)[random].data.permalink}`)
                .setImage((json.data.children)[random].data.url)
                .setFooter(`👍 ${(json.data.children)[random].data.ups} 💬 ${(json.data.children)[random].data.num_comments} | Subreddit: r/ ${(json.data.children)[random].data.subreddit}`)
             message.channel.send(embed)
        }
        
       
    });
}
