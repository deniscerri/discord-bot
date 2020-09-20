const Discord = require("discord.js");

module.exports = {
	name: 'avatar',
	description: 'Shows Avatar!',
	execute(message, args) {
      const user = message.mentions.users.first() || message.author;
                const avatarEmbed = new Discord.MessageEmbed()
                    .setAuthor(user.username, '', user.avatarURL)
                    .setImage(user.avatarURL({dynamic: true, size: 4096}));
                    
                message.channel.send(avatarEmbed);
	},
};