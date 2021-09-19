const Discord = require("discord.js");
const index = require('../../index.js');
const play = require(`${__dirname}/play.js`);
const now_playing = require(`${__dirname}/now_playing.js`);


module.exports = {
	name: 'playtop',
    aliases: ['pt'],
	description: 'Puts song result at the top of the queue',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.channel.send('I am not in a voice channel!');
        
        if(!(message.guild.me.voice.channel == voice_ch)){
            return message.channel.send('You need to be in the same audio channel as the bot to play a song!');
        }

        if(!server_queue){
            let songs = await play.search(message, queue, server_queue, voice_ch, args);
            play.add_to_queue(message, queue, server_queue, songs, voice_ch);
            return;
        }

        let songs = await play.search(message, queue, server_queue, voice_ch, args);
        songs.forEach((song, index) => server_queue.songs.splice((index+1), 0, song))
        
        if(songs.length > 1){
            return now_playing.added_to_queue(message, server_queue, 'playlist', 1)
        }
        return now_playing.added_to_queue(message, server_queue, 'song', 1);
    }
}