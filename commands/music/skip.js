const index = require('../../index.js');
const player = require('./play.js');
const queue_functions = require(`${__dirname}/queue.js`)

module.exports = {
	name: 'skip',
	description: 'Skips the current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);
        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            skip(message,queue, server_queue, args);
        }else{
            message.channel.send({content: 'You need to be in the same audio channel as the bot to skip a song!'});
        }

    }
}


function skip(message,queue, server_queue, args){
    if(!server_queue) return message.channel.send({content: 'There are no songs to skip in the queue!'});

    var cmd = '';
    if(args[0] != undefined){
        cmd = args[0].toLowerCase();
    }
    if(Number.isInteger(parseInt(cmd))){
        cmd = parseInt(cmd);
        let limit = server_queue.songs.length;
        if(cmd >= limit){
            if(limit == 1){
                return message.channel.send({content: 'There are no songs to skip in the queue!'});
            }else{
                let plural_song = (server_queue.songs.length == 2) ? 'song' : 'songs';
                return message.channel.send({content: 'There are only '+(limit-1)+' '+plural_song+' in the queue!'});
            }
        }else{
            for(var i = 0; i < cmd-1; i++){
                server_queue.songs.shift();
            }
        }
    }
    message.channel.send({content: '⏭ Skipping!'})
    server_queue.songs.shift();
    server_queue.length_seconds = queue_functions.recalculate_queue_length(server_queue)
    player.video_player(message, queue, message.guild, server_queue.songs[0]);
}