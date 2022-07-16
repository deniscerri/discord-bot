const Discord = require("discord.js");
const index = require('../../index.js');
const play = require(`${__dirname}/play.js`);
const queue_functions = require(`${__dirname}/queue.js`)

module.exports = {
	name: 'playskip',
    aliases: ['ps'],
	description: 'Puts song result at the top of the queue and plays it',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(!(message.guild.me.voice.channel == voice_ch)){
            return message.channel.send({content: 'You need to be in the same audio channel as the bot to play a song!'});
        }
        if(!args.length){
            return message.channel.send({content: 'You need to write a song name or link first'})
        }

        if(!server_queue){
            let songs = await play.search(message, queue, server_queue, voice_ch, args);
            play.add_to_queue(message, queue, server_queue, songs, voice_ch);
            return;
        }

        let songs = await play.search(message, queue, server_queue, voice_ch, args);
        songs.forEach((song, index) => server_queue.songs.splice((index+1), 0, song))
        server_queue.songs.shift();
        server_queue.length_seconds = queue_functions.recalculate_queue_length(server_queue)
        play.video_player(message, queue, message.guild, server_queue.songs[0]);

    }
}