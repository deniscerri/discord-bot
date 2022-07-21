const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require("path")

module.exports = {
  data: new SlashCommandBuilder()
	.setName('8ball')
	.setDescription('Responds to your stupid questions!!')
	.addStringOption(option =>
		option.setName('question')
			.setDescription('The question')
			.setRequired(true)),
	execute(message) {
    var question = message.options._hoistedOptions[0].value;

    let answerText = fs.readFileSync(path.resolve(__dirname, "../txt/8ball.txt")).toString();
    let answers = answerText.split("\n");
    let answer = answers[Math.floor(Math.random() * answers.length)]
    message.reply({content: `*${question}*\n\n**${answer}**`});
  
	},
};
