const path = require("path")
const {Client, GatewayIntentBits, Collection} = require('discord.js');
const keepAlive = require('./server.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {Meme} = require('./helpers/reddit_memes');
const get_commands = require('./helpers/get_commands')
var meme_helper = new Meme();


const client = new Client({ intents:[
							GatewayIntentBits.Guilds,
							GatewayIntentBits.GuildMessages,
							GatewayIntentBits.GuildVoiceStates,
							GatewayIntentBits.MessageContent
						]});
client.commands = new Collection();

const commands = []
const commandFiles = get_commands.execute(path.join(__dirname, '/commands'))

for (const file of commandFiles) {
	const command = require(file);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	const client_id = client.user.id;
	const rest = new REST({version: '9'}).setToken(process.env['TOKEN']);
	(async () => {
		// add commands
		console.log('Adding / Commands!')
		try{
			await rest.put(
				Routes.applicationCommands(client_id),
				{body: commands},
			);
		}catch(err){
			console.error(err)
		}

		// init memes
		console.log('Initializing Memes!')
		await meme_helper.update_collection()
		setInterval(async () => {
			await meme_helper.update_collection()
		}, 600000)

		console.log('DenisBot is online!');
	})();
	client.user.setActivity('/help',{type: 'PLAYING'});
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
module.exports.meme_storage = getMemeStorage()

function getMusicQueue(){
	return musicQueue;
}

function getMemeStorage(){
	return meme_helper;
}



keepAlive();
client.login(process.env['TOKEN']);
