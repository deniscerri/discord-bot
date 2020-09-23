const Discord = require("discord.js");

module.exports = {
	name: 'avatar',
	description: 'Shows Avatar!',
	execute(message, args) {
      const user = message.mentions.users.first() || message.author;
      const image = user.displayAvatarURL({dynamic: true, size: 4096});
                const avatarEmbed = new Discord.MessageEmbed()
                    .setTitle('URL')
                    .setURL(image)
                    .setImage(image);
                message.channel.send(avatarEmbed);
	},
};