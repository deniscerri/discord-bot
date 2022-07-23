const fs = require('fs');
const Discord = require('discord.js');
const keepAlive = require('./server.js');
const {Meme} = require('./helpers/reddit_memes');
var meme_helper = new Meme();


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


client.once('ready', () => {
	(async () => {
		// init memes
		console.log('Initializing Memes!')
		await meme_helper.update_collection()
		setInterval(async () => {
			await meme_helper.update_collection()
		}, 600000)

		console.log('DenisBot is online!');
		client.user.setActivity('Games!',{type: 'PLAYING'});
	})()

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
