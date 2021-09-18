const index = require('../../index.js');
const player = require(`${__dirname}/play.js`);

module.exports = {
	name: 'restart',
	description: 'Restarts the current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);
        
        if(server_queue){
            player.video_player(message, queue, message.guild, server_queue.songs[0]);
        }else{
            message.channel.send('No song is playing!');
        }
    }
}