const fs = require('fs');
const Discord = require('discord.js');
const keepAlive = require('./server.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
client.commands = new Discord.Collection();

const commands = []


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const musicCommandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

for (const file of musicCommandFiles) {
	const command = require(`./commands/music/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}


client.once('ready', () => {
	const client_id = client.user.id;
	const rest = new REST({version: '9'}).setToken(process.env['TOKEN']);
	(async () => {
		try{
			await rest.put(
				Routes.applicationCommands(client_id),
				{body: commands},
			);
			console.log('DenisBot is online!');
		}catch(err){
			console.error(err)
		}
	})();
	client.user.setActivity('Games!',{type: 'PLAYING'});
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	
	const command = client.commands.get(interaction.commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		interaction.reply({content: 'there was an error trying to execute that command!'});
	}
});



const musicQueue = new Map();
module.exports.queue = getMusicQueue();
function getMusicQueue(){
	return musicQueue;
}

keepAlive();
client.login(process.env['TOKEN']);
