const index = require('../../index.js');
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
	.setName('np')
	.setDescription('Shows current playing song'),
    async execute(message, args) {
        message.deferReply?.();
        message.deleteReply?.();

        const queue = index.queue;
        const server_queue = args === undefined ? queue.get(message.guild.id): args[0];
        let skipped = args === undefined ? false : args[1];
        if (server_queue) {
            let song = server_queue.songs[0];
            let embed = new EmbedBuilder()
            embed.setTitle('Now Playing')
            if(song === undefined){
                return;
            }
            let url = new URL(song.url);
            let videoID = new URLSearchParams(url.search);
            embed.setThumbnail(`https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`)

            let description = `[${song.title}](${song.url})\n\n`;

            let length = song.length;
            
            if (!skipped && (server_queue.audioPlayer._state.status == 'playing' || server_queue.audioPlayer._state.status == 'paused')) {
                let playbackDuration = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
                playbackDuration += song.seek ?? 0;
                
                let increment = 10;
                let totalLength = Math.round(song.length_seconds / increment);
                let progress = Math.round(totalLength / increment);
                if(progress < 1) { progress = 1};   
                let dial = false;
                for (var i = 0; i < totalLength; i += progress) {
                    if (i + progress >= (playbackDuration / increment) && dial == false) {
                        description += '◉'
                        dial = true;
                    } else {
                        description += '▬'

                    }
                }

                if (playbackDuration < 3600) {
                    playbackDuration = new Date(parseInt(playbackDuration) * 1000).toISOString().substr(14, 5)
                } else {
                    playbackDuration = new Date(parseInt(playbackDuration) * 1000).toISOString().substr(11, 8)
                }
                description += '\n\n';
                description += '`' + playbackDuration + '/' + length + '`\n\n'
            } else {
                if (length != 0) {
                    description += '`Length:` ' + length + '\n\n';
                }
            }

            description += '`Requested by:` ' + song.requestedBy + '\n\n';

            let upNext = 'Nothing';
            if (server_queue.repeat) {
                upNext = server_queue.songs[0].title + ' 🔂';
            }
            else if (server_queue.songs[1]) {
                upNext = server_queue.songs[1].title;
            }
            description += '`Up Next:` ' + upNext;
            embed.setDescription(description);

            message.channel.send({ embeds: [embed] });

        } else {
            message.channel.send({ content: 'The queue is empty!' });
        }
    }
}


const added_to_queue = (message, server_queue, type, position) => {
    /*
        Position is used to figure out which song got added to the queue.
        If it was added at the top, the Position is 1.
        If it was added at the bottom, the Position is the queue length -1,
    */
    let song = server_queue.songs[position];
    let url = new URL(song.url);
    let videoID = new URLSearchParams(url.search);
    let thumbnail = `https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`;

    if (type == 'song') {
        let embed = new EmbedBuilder()
            .setTitle('Added To Queue')
        embed.setThumbnail(thumbnail)

        
        let description = `[${song.title}](${song.url})\n\n`;
        if (song.length != 0) {
            description += '`Length:` ' + song.length + '\n\n';
        }

        let est = 0;
        let playbackDuration;
        try {
            playbackDuration = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
        } catch (err) {
            playbackDuration = 0;
        }
        if(position == 1){
            est = server_queue.songs[0].length_seconds - playbackDuration;
        }else{
            est = server_queue.length_seconds - playbackDuration - song.length_seconds;
        }
        if (est < 3600) {
            est = new Date(est * 1000).toISOString().substring(14, 19)
        } else {
            est = new Date(est * 1000).toISOString().substring(11, 19)
        }
        description += '`Estimated time until playing:` ' + est + '\n\n';
        let pos = server_queue.songs.length - 1;

        description += '`Position in queue:` ' + position;
        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    }
    else if (type == 'playlist') {
        let embed = new EmbedBuilder()
            .setTitle('Added Playlist To Queue')
            .setThumbnail(thumbnail)
            .setDescription(`[${song.playlist_title}](${song.playlist_url})\n\n`);
        message.channel.send({ embeds: [embed] });
    }
}

module.exports.added_to_queue = added_to_queue;
