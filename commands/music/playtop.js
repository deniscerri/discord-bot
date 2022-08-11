const {SlashCommandBuilder} = require("discord.js");
const index = require('../../index.js');
const play = require(`${__dirname}/play.js`);
const now_playing = require(`${__dirname}/now_playing.js`);
const queue_functions = require(`${__dirname}/queue/queue.js`)


module.exports = {
	data: new SlashCommandBuilder()
	.setName('playtop')
	.setDescription('Puts song result at the top of the queue')
    .addStringOption(option =>
		option.setName('query')
			.setDescription('Write a query or link!')
			.setRequired(true)),
	async execute(message) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        var server_queue = queue.get(message.guild.id);

        if(!message.guild.members.me.voice.channel) return message.reply({content: 'I am not in a voice channel!'});
        
        if(!(message.guild.members.me.voice.channel == voice_ch)){
            return message.reply({content: 'You need to be in the same audio channel as the bot to play a song!'});
        }

        let args = message.options._hoistedOptions[0].value

        if(!server_queue){
            server_queue = play.init_queue(message);
            let [songs, msg] = await play.search(message, queue, server_queue, voice_ch, args);
            play.add_to_queue(msg, queue, server_queue, songs, voice_ch);
            return;
        }

        let [songs, msg] = await play.search(message, queue, server_queue, voice_ch, args);
        songs.forEach((song, index) => server_queue.songs.splice((index+1), 0, song))

        server_queue.length_seconds = queue_functions.recalculate_queue_length(server_queue)
        
        if(songs.length > 1){
            return now_playing.added_to_queue(msg, server_queue, 'playlist', 1)
        }
        return now_playing.added_to_queue(msg, server_queue, 'song', 1);
    }
}