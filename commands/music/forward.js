const index = require('../../index.js');
const player = require(`${__dirname}/play.js`);
const {SlashCommandBuilder} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
	.setName('forward')
	.setDescription('Forward up certain seconds in the song')
    .addStringOption(option =>
		option.setName('timestamp')
			.setDescription('Write in [hh:mm:ss] / [mm:ss] / or [ss] format')
			.setRequired(true)),
	async execute(message) {
        const voice_ch = message.member.voice.channel;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        if(!message.guild.members.me.voice.channel) return message.reply({content: 'I am not in a voice channel!'});
        
        if(message.guild.members.me.voice.channel == voice_ch){
            await forwardSong(message);
        }else{
            message.reply({content: 'You need to be in the same audio channel as the bot to kick it!'});
        }

    }
}


const forwardSong = async (message) => {
    const queue = index.queue;
    const server_queue = queue.get(message.guild.id);

    var hours = 0, minutes = 0, seconds = 0;
    var elements = message.options._hoistedOptions[0].value.split(':');

    switch(elements.length){
        case 1:
            seconds = elements[0]
            break
        case 2:
            minutes = elements[0]
            seconds = elements[1]
            break
        case 3:
            hours = elements[0]
            minutes = elements[1]
            seconds = elements[2]
            break
    }

    let seek = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    seek = (server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0) + (server_queue.songs[0].seek ?? 0) + seek;
    if(!typeof seek == "number" || isNaN(seek)){
        return message.reply({content: "Incorrect input. Write in [hh:mm:ss] / [mm:ss] / or [ss] format!"})
    }
    
    if(seek > server_queue.songs[0].length_seconds){
        return message.reply({content: "Couldn't forward! Forward surpassed song length!"})
    }
    
    let msg = await message.reply({fetchReply: true, content: `⏩ Forwading to ${player.convert_length(seek)}`})
    player.video_player(msg, queue, message.guild, server_queue.songs[0], seek);

}