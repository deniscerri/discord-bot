const index = require('../../index.js');

module.exports = {
	name: 'np',
	description: 'Shows current playing song',
	async execute(message, args) {
        const queue = index.queue;
        const server_queue = queue.get(message.guild.id);
        
        if(server_queue){
            message.channel.send(`🎶 Now playing **${server_queue.songs[0].title}**`);
        }else{
            message.channel.send('The queue is empty!');
        }
    }
}