
const Discord = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    name: 'fact',
    aliases: ['facts'],
    description: 'Send Random Facts',
    execute(message, args) {
        fetch(`https://uselessfacts.jsph.pl/random.json?language=en`)
        .then(res => res.json())
        .then(json => {
            if(json == 'Too Many Attempts.'){
                message.channel.send({content: "Too Many Attempts. Wait a lil bit and try again!"});
            }else{
                message.channel.send({content: json.text});
            }
            
        
        });

      return;
  },
};