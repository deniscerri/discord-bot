const index = require('../../index.js');

module.exports = {
	name: 'disconnect',
    aliases: ['leave'],
	description: 'Kick the bot out of Audio Channel',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        if(!message.guild.me.voice.channel) return message.channel.send('I am not in a voice channel!');
        
        if(message.guild.me.voice.channel == voice_ch){
            queue.delete(message.guild.id);
            message.guild.me.voice.channel.leave();
        }else{
            message.channel.send('You need to be in the same audio channel as the bot to kick it!');
        }

    }
}