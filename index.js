const fs = require('fs');
const Discord = require('discord.js');
const keepAlive = require('./server.js');

const {Client, MessageAttachment} = require('discord.js');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
client.commands = new Discord.Collection();

const prefix = 'w';


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const musicCommandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of musicCommandFiles) {
	const command = require(`./commands/music/${file}`);
	client.commands.set(command.name, command);
}


const musicQueue = new Map();
module.exports.queue = getMusicQueue();
function getMusicQueue(){
	return musicQueue;
}


client.once('ready', () => {
    console.log('DenisBot is online!');
	client.user.setActivity('Ninja Gaiden [NES]',{type: 'PLAYING'});
});


client.on('messageCreate', message => {
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
		message.reply({content: 'there was an error trying to execute that command!'});
	}
});





keepAlive();
client.login(process.env['TOKEN']);
