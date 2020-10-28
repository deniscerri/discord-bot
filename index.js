const  fs = require('fs');
const Discord = require('discord.js');
const keepAlive = require('./server.js');

const {Client, MessageAttachment} = require('discord.js');
const client = new Client();
client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));



for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}



client.once('ready', () => {
    console.log('DenisBot is online!');
});

const prefix = 'w';


client.on('message', message => {


	if (!(message.content.toLowerCase()).startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	
  const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});






keepAlive();
client.login('NzQ2ODI3NTY5MzExMTIxNDc5.X0F_Xw.Ib7PVyXUH9VKDVpgTEgRF8m66YI');
