const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const fetch =  require("axios");

module.exports = {
    data: new SlashCommandBuilder()
	.setName('avatar')
	.setDescription('Shows Avatar of a user!')
	.addStringOption(option => 
        option.setName('type')
        .setDescription('Choose which type avatar type!')
        .setRequired(true)
        .addChoices(
            { name: 'Server', value: 'server' },
            { name: 'Global', value: 'global' },
        )
    )
    .addUserOption(option => 
        option.setName('user')
        .setDescription('Choose which type avatar type!')
        .setRequired(false)
    ),
	name: 'avatar',
    aliases: ['profile','pfp','icon'],
	async execute(message) {
        const user = message.options._hoistedOptions.length == 1 ? message.user : message.options._hoistedOptions[1].user
        const type = message.options._hoistedOptions[0].value
        var image = undefined;
        if(type == "server"){
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
        
        const avatarEmbed = new EmbedBuilder()
            .setTitle('URL')
            .setURL(image)
            .setImage(image);
        message.reply({embeds: [avatarEmbed]});
	},
};