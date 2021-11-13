const index = require('../../index.js')


module.exports = {
	name: 'repeat',
	description: 'Repeats the current playing song after finishing',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            if(!server_queue) {message.channel.send({content: 'No song is playing! Song Repeat stays OFF!'}); return;}
            if(server_queue.repeat){
                message.channel.send({content: '🎶 Song Repeat Turned OFF!'})
            }else{
                message.channel.send({content: '🎶 Song Repeat Turned ON!'})
            }
            server_queue.repeat = !server_queue.repeat;
        }else{
            message.channel.send({content: 'You need to be in the same audio channel as the bot to activate song repeat!'});
        }
        
        
    }
}