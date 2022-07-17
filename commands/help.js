const Discord = require('discord.js');
const fs = require('fs');
const gif = 'https://c.tenor.com/R_mwXHSitkQAAAAC/plank-ed-edd-n-eddy.gif';


module.exports = {
	name: 'help',
	description: 'Shows the bot\'s commands',
	execute(message, args) {
        var cmd = '';
        if(args[0] != undefined){
            cmd = args[0].toLowerCase();
        }
        var title = '';
        var directory = '';    

        if(cmd == 'music'){
            title = 'All Music Commands of DenisBot';
            directory = `${__dirname}/music/`;
            
            return message.channel.send({embeds: [createHelpEmbed(title, directory)]});
        }
		
        title = 'All Commands of DenisBot';
        directory = `${__dirname}/`;
        let embed = createHelpEmbed(title, directory);
        embed.setFooter('Write whelp music, for Music Commands');
            
        return message.channel.send({embeds: [embed]});
        


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
        let aliases = '';
        if(command.aliases != undefined && command.aliases.length > 0){
            aliases = `***Aliases***: \`${command.aliases.join(', ')}\`\n`
        }
        
        description += `**- ${command.name.substring(0,1).toUpperCase()+command.name.substring(1)}**\n${command.description}\n${aliases}\n`
    }

    commandEmbed.setDescription(description);
                
    return commandEmbed;
}