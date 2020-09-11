const fs = require("fs");

module.exports = {
	name: 'hug',
	description: 'Send hug gifs!',
	execute(message, args) {


      var text = fs.readFileSync("./txt/hug.txt").toString();
      var hug = text.split("\n");

      if(!(args[1] === undefined)){
                    message.channel.send(message.author.username +' hugs ' + message.mentions.users.first().username);
                }
                message.channel.send(hug[Math.floor(Math.random() * hug.length)]);
	},
};