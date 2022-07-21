const Discord = require('discord.js');
const fs = require('fs');
const gif = 'https://c.tenor.com/R_mwXHSitkQAAAAC/plank-ed-edd-n-eddy.gif';
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('help')
	.setDescription('List all commands!')
    .addSubcommand(command =>
        command
            .setName('default')
            .setDescription('List all default commands'))
    .addSubcommand(command =>
        command
            .setName('music')
            .setDescription('List all music commands')),
	execute(message) {
        var cmd = message.options._subcommand;

        var title = '';
        var directory = '';    

        if(cmd == 'music'){
            title = 'All Music Commands of DenisBot';
            directory = `${__dirname}/music/`;
            
            return message.reply({embeds: [createHelpEmbed(title, directory)]});
        }
		
        title = 'All Commands of DenisBot';
        directory = `${__dirname}/`;
        let embed = createHelpEmbed(title, directory);
        embed.setFooter('Write whelp music, for Music Commands');
            
        return message.reply({embeds: [embed]});
        


	},
};


const createHelpEmbed = (title, directory) => {
    const commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
    var description = '';
    let commandEmbed = new Discord.MessageEmbed()
        .setAuthor(title)
        .setImage(gif)
    
    for (const file of commandFiles) {
        const command = require(`${directory}/${file}`);
        description += `** /${command.data.name}**\n${command.data.description}\n`
    }

    commandEmbed.setDescription(description);
                
    return commandEmbed;
}