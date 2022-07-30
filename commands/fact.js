const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
	.setName('fact')
	.setDescription('Send a random fact!'),
	async execute(message) {
        await message.deferReply();
        fetch(`https://uselessfacts.jsph.pl/random.json?language=en`)
        .then(res => res.json())
        .then(json => {
            if(json == 'Too Many Attempts.'){
                message.editReply({content: "Too Many Attempts. Wait a lil bit and try again!"});
            }else{
                message.editReply({content: json.text});
            }
            
        
        });

      return;
  },
};
