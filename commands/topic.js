const {SlashCommandBuilder} = require('discord.js');
const fs = require('fs');
const path = require("path")

module.exports = {
	data: new SlashCommandBuilder()
	.setName('topic')
	.setDescription('Send a topic!'),
	execute(message) {
    var topicText = fs.readFileSync(path.resolve(__dirname, "../txt/topic.txt")).toString();
    var topic = topicText.split("\n");
	message.reply({content:topic[Math.floor(Math.random() * topic.length)]});
	},
};