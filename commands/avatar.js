const { SlashCommandBuilder } = require('@discordjs/builders');

const Discord = require("discord.js");
const fetch =  require("axios");

module.exports = {
    data: new SlashCommandBuilder()
	.setName('avatar')
	.setDescription('Shows Avatar of a user!')
	.addSubcommand(command =>
        command
            .setName('global')
            .setDescription('global')
            .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)))
    .addSubcommand(command =>
        command
            .setName('server')
            .setDescription('server')
            .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true))),
	name: 'avatar',
    aliases: ['profile','pfp','icon'],
	async execute(message) {
        const user = message.options._hoistedOptions[0].user
        var image = undefined;
        if(message.options._subcommand == "server"){
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
        message.reply({embeds: [avatarEmbed]});
	},
};