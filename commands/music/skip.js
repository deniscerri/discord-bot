const index = require('../../index.js');

module.exports = {
	name: 'skip',
	description: 'Skips the current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) return message.channel.send('There are no songs to skip in the queue!');
        server_queue.connection.dispatcher.end();

    }
}