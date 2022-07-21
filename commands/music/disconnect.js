const index = require('../../index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
	.setName('leave')
	.setDescription('Disconnects the bot from the audio channel!'),
	async execute(message) {
        message.deferReply();
        message.deleteReply();

        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        if(!message.guild.me.voice.channel) return message.reply({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            let server_queue = queue.get(message.guild.id);
            server_queue.connection.disconnect();
            queue.delete(message.guild.id);
        }else{
            message.reply({content: 'You need to be in the same audio channel as the bot to kick it!'});
        }

    }
}