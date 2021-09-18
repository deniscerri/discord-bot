const index = require('../../index.js');
const Discord = require("discord.js");

module.exports = {
	name: 'np',
	description: 'Shows current playing song',
	async execute(message, args) {
        const queue = index.queue;
        const server_queue = queue.get(message.guild.id);
        
        if(server_queue){
            let song = server_queue.songs[0];
            let embed = new Discord.MessageEmbed()
                .setTitle('Now Playing :musical_note:')
            let url = new URL(song.url);
            let videoID = new URLSearchParams(url.search);
            embed.setThumbnail(`https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`)

            let description = '';
            description += `[${song.title}](${song.url})\n\n`;

            let length = 0;
            if(server_queue.songs[0].length_seconds < 3600){
                length = new Date(parseInt(server_queue.songs[0].length_seconds) * 1000).toISOString().substr(14, 5)
            }else{
                length = new Date(parseInt(server_queue.songs[0].length_seconds) * 1000).toISOString().substr(11, 8)
            }
            description += '`Length:` ' + length + '\n\n'; 
            description += '`Requested by:` ' + song.requestedBy +'\n\n';

            let upNext = 'Nothing';
            if(server_queue.songs[1]){
                upNext = server_queue.songs[1].title;
            }
            description += '`Up Next:` '+upNext;
            embed.setDescription(description);
            message.channel.send(embed);
        }else{
            message.channel.send('The queue is empty!');
        }
    }
}