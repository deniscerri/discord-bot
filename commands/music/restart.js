const index = require('../../index.js');
const player = require(`${__dirname}/play.js`);
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('restart')
	.setDescription('Restarts the current playing song!'),
	async execute(message) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);

        let msg = await message.reply({fetchReply: true, content: `Restarting: **${server_queue.songs[0].title}**`})
        
        if(server_queue){
            player.video_player(msg, queue, message.guild, server_queue.songs[0]);
        }else{
            message.reply({content: 'No song is playing!'});
        }
    }
}