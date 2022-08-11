const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const path = require('path')
const gif = 'https://c.tenor.com/R_mwXHSitkQAAAAC/plank-ed-edd-n-eddy.gif';
const get_commands = require('../helpers/get_commands')


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
        var commandFiles = ''
        
        if(cmd == 'music'){
            title = 'All Music Commands of DenisBot';
            commandFiles = get_commands.execute(`${__dirname}/music`)
        }else{
            commandFiles = get_commands.getFirstlevel(path.join(__dirname, '/'))
        }
		
        let embed = createHelpEmbed(title, commandFiles);            
        return message.reply({embeds: [embed], ephemeral: true });
	},
};

const createHelpEmbed = (title, commandFiles) => {
    var description = '';
    let commandEmbed = new EmbedBuilder()
        .setAuthor({name: title})
        .setImage(gif)
    
    for (const file of commandFiles) {
        const command = require(file);
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