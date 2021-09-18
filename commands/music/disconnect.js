const index = require('../../index.js');

module.exports = {
	name: 'disconnect',
    aliases: ['leave'],
	description: 'Kick the bot out of Audio Channel',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);
        
        if(server_queue == undefined) { return message.channel.send('Bot is not in an audio channel currently!')}
        server_queue.songs = [];
        server_queue.connection.disconnect();
    }
}