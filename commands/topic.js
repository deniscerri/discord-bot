const fs = require('fs');

module.exports = {
	name: 'topic',
	description: 'Sends a random topic!',
	execute(message, args) {
    
    var topicText = fs.readFileSync("./txt/topic.txt").toString();
    var topic = topicText.split("\n");

		message.channel.send({content:topic[Math.floor(Math.random() * topic.length)]});
    
	},
};