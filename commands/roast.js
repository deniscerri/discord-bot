const {SlashCommandBuilder} = require('discord.js');
const fs = require('fs');
const path = require("path")

module.exports = {
	data: new SlashCommandBuilder()
	.setName('roast')
	.setDescription('Send a roast!')
    .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(false)),
	execute(message) {
        var roastText = fs.readFileSync(path.resolve(__dirname, "../txt/roast.txt")).toString();
        var roast = roastText.split("\n");
		if(!(message.options._hoistedOptions[0] === undefined)){
            let user = `<@${message.options._hoistedOptions[0].user.id}>`;
            message.reply({content: user + ' '+ roast[Math.floor(Math.random() * roast.length)]}); 
        }else{
            message.reply({content: roast[Math.floor(Math.random() * roast.length)]});       
        }
	},
};