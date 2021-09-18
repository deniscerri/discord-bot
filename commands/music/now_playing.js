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
                .setAuthor('Now Playing')
            let url = new URL(song.url);
            let videoID = new URLSearchParams(url.search);
            embed.setThumbnail(`https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`)

            let description = `[${song.title}](${song.url})\n\n`;

            let length = 0;
            if(song.length_seconds < 3600){
                length = new Date(parseInt(song.length_seconds) * 1000).toISOString().substr(14, 5)
            }else{
                length = new Date(parseInt(song.length_seconds) * 1000).toISOString().substr(11, 8)
            }

            let time = server_queue.connection.dispatcher.streamTime / 1000;
            if(time > 0){
                let increment = 10;
                let totalLength = Math.round(song.length_seconds / increment);
                let progress = Math.round(totalLength / increment);
                let tick = false;
                for(var i = 0; i < totalLength; i+=progress){
                    if(i + progress >= (time / increment) && tick == false){
                        description += '🔘'
                        tick = true;
                    }else{
                        description += '▬'
                        
                    }
                }
                
                if(time < 3600){
                    time = new Date(parseInt(time) * 1000).toISOString().substr(14, 5)
                }else{
                    time = new Date(parseInt(time) * 1000).toISOString().substr(11, 8)
                }
                description += '\n\n';
                description += '`'+time+'/'+length+'`\n\n'

            }else{
                description += '`Length:` ' + length + '\n\n'; 
            }
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


const added_to_queue = (message, server_queue) => {
    let song = server_queue.songs[server_queue.songs.length-1];
    let embed = new Discord.MessageEmbed()
        .setAuthor('Added To Queue')
    let url = new URL(song.url);
    let videoID = new URLSearchParams(url.search);
    embed.setThumbnail(`https://img.youtube.com/vi/${videoID.get('v')}/mqdefault.jpg`)

    let length = 0;
    if(song.length_seconds < 3600){
        length = new Date(parseInt(song.length_seconds) * 1000).toISOString().substr(14, 5)
    }else{
        length = new Date(parseInt(song.length_seconds) * 1000).toISOString().substr(11, 8)
    }

    let description = `[${song.title}](${song.url})\n\n`;
    description += '`Length:` ' + length + '\n\n';

    let est = 0;
    let time = server_queue.connection.dispatcher.streamTime / 1000 || 0;
    
    var totalLength = server_queue.songs[0].length_seconds - time;
    for(var i = 1; i < server_queue.songs.length-1; i++){
        totalLength += parseInt(server_queue.songs[i].length_seconds);
    }
    est = totalLength;
    est = new Date(totalLength * 1000).toISOString().substr(14, 5)
    description +='`Estimated time until playing:` ' + est + '\n\n';
    let pos = server_queue.songs.length - 1;
    description += '`Position in queue:` ' + pos;
    embed.setDescription(description);
    message.channel.send(embed);
}

module.exports.added_to_queue = added_to_queue;