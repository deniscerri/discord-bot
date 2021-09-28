
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
    name: 'fact',
    aliases: ['facts'],
    description: 'Send Random Facts',
    execute(message, args) {
        fetch(`https://uselessfacts.jsph.pl/random.json?language=en`)
        .then(res => res.json())
        .then(json => {
            if(json == 'Too Many Attempts.'){
                message.channel.send("Too Many Attempts. Wait a lil bit and try again!");
            }else{
                message.channel.send(json.text);
            }
            
        
        });

      return;
  },
};