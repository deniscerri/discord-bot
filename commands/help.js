const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Shows all commands',
	execute(message, args) {
		
     const commandEmbed = new Discord.MessageEmbed()
                    .setColor(0x333333)
                    .setAuthor("All Commands of DenisBot")
                    .addFields(
                        {name: 'Ping', value: 'If u write this, the bot answers you pong lol'},
                        {name: 'Topic', value: 'Bot gives u a topic to talk about. 1300+ topics'},
                        {name: 'Avatar', value: 'Shows your avatar or others'},
                        {name: 'Hug', value: 'Send hug gifs xD'},
                        {name: 'Roast', value: 'Roast the shit out of u or others. 200+ roasts'},
                        {name: 'Img', value: 'Shows you an image from the internet based on your input'},
                        {name: '8ball', value: 'Replies to your stupid ass questions'},
                        {name: 'Define', value: 'Defines your words lol. Use . for random definition'},
                        {name: 'Meme', value: 'Send memes from Reddit'},
                        {name: 'Movie', value: 'Search for movies from Imdb and watch them'},
                    )
                    .setImage('https://media1.giphy.com/media/Te4NwB59ZFn68/200.gif')
                    
                    
                message.channel.send(commandEmbed);


	},
};