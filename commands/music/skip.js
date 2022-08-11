const index = require('../../index.js');
const player = require('./play.js');
const queue_functions = require(`${__dirname}/queue/queue.js`)
const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
	.setName('skip')
	.setDescription('Skip current playing song.')
    .addStringOption(option =>
		option.setName('index')
			.setDescription('Write the song index from the queue to skip to it!')
			.setRequired(false)),
	async execute(message) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);
        if(!message.guild.members.me.voice.channel) return message.reply({content: 'I am not in a voice channel!'});
        
        if(message.guild.members.me.voice.channel == voice_ch){
            await skip(message,queue, server_queue);
        }else{
            message.reply({content: 'You need to be in the same audio channel as the bot to skip a song!'});
        }

    }
}


async function skip(message,queue, server_queue){
    if(!server_queue) return message.reply({content: 'There are no songs to skip in the queue!'});
    var cmd = '';
    if(message.options._hoistedOptions.length != 0){
        cmd = message.options._hoistedOptions[0].value.toLowerCase();
    }
    if(Number.isInteger(parseInt(cmd))){
        cmd = parseInt(cmd);
        let limit = server_queue.songs.length;
        if(cmd >= limit){
            if(limit == 1){
                return message.reply({content: 'There are no songs to skip in the queue!'});
            }else{
                let plural_song = (server_queue.songs.length == 2) ? 'song' : 'songs';
                return message.reply({content: 'There are only '+(limit-1)+' '+plural_song+' in the queue!'});
            }
        }else{
            for(var i = 0; i < cmd-1; i++){
                server_queue.songs.shift();
            }
        }
    }
    let msg = await message.reply({fetchReply: true, content: '⏭ Skipping!'})
    server_queue.songs.shift();
    server_queue.length_seconds = queue_functions.recalculate_queue_length(server_queue)
    player.video_player(msg, queue, message.guild, server_queue.songs[0]);
}