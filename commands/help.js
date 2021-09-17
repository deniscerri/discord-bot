const Discord = require('discord.js');
const fs = require('fs');



module.exports = {
	name: 'help',
	description: 'Shows all commands',
	execute(message, args) {
		const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
        const commandEmbed = new Discord.MessageEmbed()
                    .setColor(0x333333)
                    .setAuthor("All Commands of DenisBot")
                    .setImage('https://media1.giphy.com/media/Te4NwB59ZFn68/200.gif')
    
        for (const file of commandFiles) {
            const command = require(`${__dirname}/${file}`);
            commandEmbed.addField(command.name.substring(0,1).toUpperCase()+command.name.substring(1), command.description + '\n' + (command.aliases || ''))
        }
                    
        message.channel.send(commandEmbed);

	},
};