const index = require('../../index.js');


module.exports = {
	name: 'disconnect',
    aliases: ['leave'],
	description: 'Kick the bot out of Audio Channel',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            let server_queue = queue.get(message.guild.id);
            server_queue.connection.disconnect();
            queue.delete(message.guild.id);
        }else{
            message.channel.send({content: 'You need to be in the same audio channel as the bot to kick it!'});
        }

    }
}