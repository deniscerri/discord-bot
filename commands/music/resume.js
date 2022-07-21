const index = require('../../index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('resume')
	.setDescription('Resumes the currently paused song!'),
	async execute(message) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.reply({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            if(!server_queue) {
                message.reply({content: 'No song is playing!'}); return;
            }else{
                server_queue.audioPlayer.unpause();
                message.reply({content:`▶️ Resumed **${server_queue.songs[0].title}**`})
            }
        }else{
            message.reply({content: 'You need to be in the same audio channel as the bot to pause a song!'});
        }
        
    }
}