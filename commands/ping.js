const {SlashCommandBuilder} = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Pong!'),
	execute(message) {
		var ping = Date.now() - message.createdAt + " ms";
    	message.reply({content: 'Pong :ping_pong: '+ `**${ping}**`});
	},
};