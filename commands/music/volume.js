const index = require('../../index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const player = require(`${__dirname}/play.js`);

module.exports = {
	data: new SlashCommandBuilder()
	.setName('volume')
	.setDescription('Change the volume of current audio session.')
    .addStringOption(option =>
        option.setName('value')
        .setDescription('Set volume from 0.1 to 2')
        .setRequired(true)
    ),
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
                let volume = message.options._hoistedOptions[0].value
                if(isNaN(volume)){
                    return message.reply({content: "Try writing a number!"})
                }

                if(volume < 0 || volume > 2){
                    return message.reply({content: "Number is beyond limits. Try writing a value between 0.1 and 2"})
                }

                server_queue.volume = volume

                let seek = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
                seek += server_queue.songs[0].seek ?? 0;

                let lag = Math.round((Date.now() - message.createdAt) / 1000)
                if(seek > 0 && seek < server_queue.songs[0].length_seconds - 1){
                    seek += lag
                }

                let msg = await message.reply({fetchReply: true, content: `🔊 Changing volume to ${volume}`})
                player.video_player(msg, queue, message.guild, server_queue.songs[0], seek);
            }
        }else{
            message.reply({content: 'You need to be in the same audio channel as the bot to pause a song!'});
        }
        
    }
}