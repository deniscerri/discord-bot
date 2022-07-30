const Discord = require('discord.js');
const fs = require('fs');
const gif = 'https://c.tenor.com/R_mwXHSitkQAAAAC/plank-ed-edd-n-eddy.gif';
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('help')
	.setDescription('List all commands!')
    .addStringOption(option => 
        option.setName('type')
        .setDescription('Choose which command category to show!')
        .setRequired(true)
        .addChoices(
            { name: 'Default', value: 'default' },
            { name: 'Music', value: 'music' },
        )
    ),
	execute(message) {
        var cmd = message.options._hoistedOptions[0].value;

        var title = 'All Commands of DenisBot';
        var directory = `${__dirname}/`; 

        if(cmd == 'music'){
            title = 'All Music Commands of DenisBot';
            directory = `${__dirname}/music/`;
        }
		
        let embed = createHelpEmbed(title, directory);            
        return message.reply({embeds: [embed], ephemeral: true });
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
        description += `** /${command.data.name}**\t${command.data.description}\n`
        if(command.data.options.length > 0){
            for(const option of command.data.options){
                description += "```\t"+ option.name +": " + option.description + "```"
            }
        }
        description += "\n"
    }

    commandEmbed.setDescription(description);
                
    return commandEmbed;
}