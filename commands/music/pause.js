const index = require('../../index.js');

module.exports = {
	name: 'pause',
	description: 'Pauses the current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) {
            message.channel.send('No song is playing!'); return;
        }else{
            server_queue.connection.dispatcher.pause(true);
            message.channel.send(`⏸ Paused **${server_queue.songs[0].title}**`)
        }
    }
}