const index = require('../../index.js');
const Discord = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord.js");


module.exports = {
    name: 'np',
    description: 'Shows current playing song',
    async execute(message, args) {
        const queue = index.queue;
        const server_queue = args[0] || queue.get(message.guild.id);
        let skipped = args[1] || false;
        if (server_queue) {
            let song = server_queue.songs[0];
            let embed = new Discord.MessageEmbed()
            embed.setTitle('Now Playing')
            let url = new URL(song.url);
            let videoID = new URLSearchParams(url.search);
            embed.setThumbnail(`https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`)

            let description = `[${song.title}](${song.url})\n\n`;

            let length = 0;
            if (song.length_seconds < 3600 && song.length_seconds > 0) {
                length = new Date(song.length_seconds * 1000).toISOString().substr(14, 5)
            } else if (song.length_seconds > 3600) {
                length = new Date(song.length_seconds * 1000).toISOString().substr(11, 8)
            }
            if (!skipped && (server_queue.audioPlayer._state.status == 'playing' || server_queue.audioPlayer._state.status == 'paused')) {
                let playbackDuration = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
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
        let embed = new Discord.MessageEmbed()
            .setTitle('Added To Queue')
        embed.setThumbnail(thumbnail)

        let length = 0;
        if (song.length_seconds < 3600 && song.length_seconds > 0) {
            length = new Date(song.length_seconds * 1000).toISOString().substr(14, 5)
        } else if (song.length_seconds > 3600) {
            length = new Date(song.length_seconds * 1000).toISOString().substr(11, 8)
        }

        let description = `[${song.title}](${song.url})\n\n`;
        if (length != 0) {
            description += '`Length:` ' + length + '\n\n';
        }

        let est = 0;
        let playbackDuration;
        try {
            playbackDuration = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
        } catch (err) {
            playbackDuration = 0;
        }

        var totalLength = server_queue.songs[0].length_seconds - playbackDuration;
        for (var i = 1; i < position; i++) {
            totalLength += parseInt(server_queue.songs[i].length_seconds);
        }
        est = totalLength;
        if (est < 3600) {
            est = new Date(totalLength * 1000).toISOString().substr(14, 5)
        } else {
            est = new Date(totalLength * 1000).toISOString().substr(11, 8)
        }
        description += '`Estimated time until playing:` ' + est + '\n\n';
        let pos = server_queue.songs.length - 1;

        description += '`Position in queue:` ' + position;
        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    }
    else if (type == 'playlist') {
        let embed = new Discord.MessageEmbed()
            .setTitle('Added Playlist To Queue')
            .setThumbnail(thumbnail)
            .setDescription(`[${song.playlist_title}](${song.playlist_url})\n\n`);
        message.channel.send({ embeds: [embed] });
    }
}

module.exports.added_to_queue = added_to_queue;
