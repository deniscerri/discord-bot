const index = require('../../index.js');
const player = require(`${__dirname}/play.js`);



module.exports = {
	name: 'rewind',
	description: 'Move back certain seconds in the song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;

        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        if(!message.guild.me.voice.channel) return message.channel.send({content: 'I am not in a voice channel!'});
        
        if(message.guild.me.voice.channel == voice_ch){
            forwardSong(message, args);
        }else{
            message.channel.send({content: 'You need to be in the same audio channel as the bot to kick it!'});
        }

    }
}


const forwardSong = (message, args) => {
    const queue = index.queue;
    const server_queue = queue.get(message.guild.id);

    var hours = 0, minutes = 0, seconds = 0;
    var elements = args[0].split(':');


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
    seek = (server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0) + (server_queue.songs[0].seek ?? 0) - seek;
    if(!typeof seek == "number" || isNaN(seek)){
        return message.channel.send({content: "Incorrect input. Try writing it in ``seconds`` or ``minute:seconds`` format!"})
    }

    if(seek <= 0){
        seek = 1;
    }
    
    message.channel.send({content: `⏪ Rewinding back to ${player.convert_length(seek)}`})
    player.video_player(message, queue, message.guild, server_queue.songs[0], seek);

}