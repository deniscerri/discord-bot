const index = require('../../index.js')
const Discord = require("discord.js");


module.exports = {
    name: 'shuffle',
    description: 'Shuffles the queue',
    async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if (!voice_ch) { return message.channel.send({ content: 'You need to be in a audio channel to execute this command!' }); }
        const server_queue = queue.get(message.guild.id);

        if (!message.guild.me.voice.channel) return message.channel.send({ content: 'I am not in a voice channel!' });

        if (message.guild.me.voice.channel == voice_ch) {
            if (!server_queue || server_queue.songs.length <= 1) { message.channel.send({ content: 'No songs available to shuffle!' }); return; }

            let current_playing = server_queue.songs[0];
            server_queue.songs.shift();
            server_queue.songs = shuffle(server_queue.songs);

            let new_queue = [];
            new_queue.push(current_playing);
            server_queue.songs.forEach(song => {
                new_queue.push(song);
            });

            server_queue.songs = new_queue;

            let embed = new Discord.MessageEmbed()
            embed.setTitle('Queue Shuffled!')
            let description = '`Up Next:` ' + `[${server_queue.songs[1].title}](${server_queue.songs[1].url})\n\n`;
            let playbackDuration;
            try {
                playbackDuration = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
            } catch (err) {
                playbackDuration = 0;
            }

            est = server_queue.songs[0].length_seconds - playbackDuration - server_queue.songs[0].seek ?? 0;
            if (est < 3600) {
                est = new Date(est * 1000).toISOString().substring(14, 19)
            } else {
                est = new Date(est * 1000).toISOString().substring(11, 19)
            }
            description += '`Estimated time until playing:` ' + est + '\n\n';

            embed.setDescription(description);

            message.channel.send({ embeds: [embed] });



        } else {
            message.channel.send({ content: 'You need to be in the same audio channel as the bot to activate song repeat!' });
        }


    }
}


const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}