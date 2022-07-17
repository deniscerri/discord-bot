const Discord = require("discord.js");
const fetch =  require("axios");

module.exports = {
	name: 'avatar',
    aliases: ['profile','pfp','icon'],
	description: 'Shows Avatar! ```Write the word \'server\' after the command to show the server avatar instead of the default one```',
	async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        var image = undefined;
        if(args[0] == "server"){
            let res = await fetch.get(`https://discord.com/api/guilds/${message.guild.id}/members/${user.id}`, {
                headers: {
                    Authorization: `Bot ${process.env['TOKEN']}`
                }
            })

            if(res.data.avatar !== undefined && res.data.avatar !== null){
                image = `https://cdn.discordapp.com/guilds/${message.guild.id}/users/${user.id}/avatars/${res.data.avatar}.webp?size=4096`
            }
        }
        if (image === undefined){
            image = user.displayAvatarURL({dynamic: true, size: 4096});
        }
        
        const avatarEmbed = new Discord.MessageEmbed()
            .setTitle('URL')
            .setURL(image)
            .setImage(image);
        message.channel.send({embeds: [avatarEmbed]});
	},
};