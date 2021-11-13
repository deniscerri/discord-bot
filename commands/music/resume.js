const index = require('../../index.js');

module.exports = {
	name: 'resume',
	description: 'Resumes the current song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            if(!server_queue) {
                message.channel.send({content: 'No song is playing!'}); return;
            }else{
                server_queue.audioPlayer.unpause();
                message.channel.send({content:`▶️ Resumed **${server_queue.songs[0].title}**`})
            }
        }else{
            message.channel.send({content: 'You need to be in the same audio channel as the bot to pause a song!'});
        }
        
    }
}