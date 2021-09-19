const index = require('../../index.js');
const Discord = require("discord.js");

module.exports = {
	name: 'queue',
	description: 'Shows the Music Queue',
	async execute(message, args) {
        const queue = index.queue;
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) return message.channel.send('There are no songs in the queue!');

        if(args[0] == 'clear'){
            clear_queue(message,queue, server_queue, args);
            return;
        }

        var embeds = [];
        var limit = 10;

        var lengths = [];
        var totalLength = 0;
        for(var i = 0; i < server_queue.songs.length; i++){
            let length = 0;
            if(server_queue.songs[i].length_seconds < 3600){
                length = new Date(server_queue.songs[i].length_seconds * 1000).toISOString().substr(14, 5)
            }else{
                length = new Date(server_queue.songs[i].length_seconds * 1000).toISOString().substr(11, 8)
            }
            lengths.push(length);
            totalLength += server_queue.songs[i].length_seconds;
        }
        //current playing song streaming time
        let time = server_queue.connection.dispatcher.streamTime / 1000 || 0;
        totalLength = totalLength - time;
        if(totalLength < 3600){
            totalLength = new Date(totalLength * 1000).toISOString().substr(14, 5)
        }else{
            totalLength = new Date(totalLength * 1000).toISOString().substr(11, 8)
        }

        for(var i = 0; i < server_queue.songs.length; i+=limit){
            let tmp_embed = build_queue(server_queue, lengths, message , i, limit);
            embeds.push(tmp_embed);
        }
        
        
        let plural_song = (server_queue.songs.length == 2) ? 'song' : 'songs';
        embeds.forEach((e, i) => {
            e.setFooter(`\n\n ${server_queue.songs.length-1} ${plural_song} in queue | ${totalLength} Total Length\nPage ${i+1}/${embeds.length}`);
        });

        var i = 0;
        let query = parseInt(args[0]);
        if(Number.isInteger(query)){
            if(query <= embeds.length){
                i = query % (embeds.length+1);
                if(i >= 1){
                    i--;
                }
            }else{
                let plural_page = (embeds.length == 1) ? 'page' : 'pages';
                message.channel.send('There are only '+embeds.length+' '+plural_page+' in the queue!');
                return;
            }
            
        }
        var msg = message.channel.send(embeds[i])
            .then(async function(msg){
                if(embeds.length > 1){
                    msg.react('⏭')
                    await msg.awaitReactions(reaction => {
                    if(reaction.emoji.reaction.count > 1){
                        switch(reaction.emoji.name){
                            case '⏭':
                            i = ++i % embeds.length;
                            break;
                            case '⏮':
                            i = --i % embeds.length;
                            break;
                        }
                        msg.edit(embeds[i]);
                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        if(i == embeds.length){
                            msg.react('⏮')
                        }else if(i == 0){
                            msg.react('⏭')
                        }else{
                            msg.react('⏮')
                            msg.react('⏭')
                        }
                    }
                    
                    }, {time: 600000});
                }
            })

    }
}


const build_queue = (server_queue, lengths, message, index, limit) =>{

    var embed = new Discord.MessageEmbed()
        .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setTitle(`${message.guild.name}'s Music Queue!`)
        .setColor('#FFFF00')
    index++;

    let description = `**NOW PLAYING**\n [${server_queue.songs[0].title}](${server_queue.songs[0].url}) | `+'`'+lengths[0]+' Requested by: '+server_queue.songs[0].requestedBy+'`';
    if(server_queue.connection.dispatcher != null){
        if(server_queue.connection.dispatcher.pausedSince != null && server_queue.connection.dispatcher.pausedSince > 0){
            description+=' ⏸';
        }
    }
    
    if(server_queue.repeat){description+=' 🔂'}
    
    tmp_limit = (index + limit) - server_queue.songs.length;
    if(tmp_limit >= 0) {
        limit = server_queue.songs.length
    }else{
        limit = index+limit;
    }
    

    if(limit > 1){
        description += '\n\n :arrow_down: Up Next: :arrow_down: \n\n';
    }

    for(var i = index; i < limit;i++){
        description += '`'+i+'.`' + ` [${server_queue.songs[i].title}](${server_queue.songs[i].url}) | `+'`'+lengths[i]+' Requested by: '+server_queue.songs[i].requestedBy+'`\n';
    }
    embed.setDescription(description);

    return embed;
}

const clear_queue = (message,queue, server_queue, args) => {
    const voice_ch = message.member.voice.channel;
    if(!(message.guild.me.voice.channel == voice_ch)){
        return message.channel.send('You need to be in the same audio channel as the bot to clear the queue!');
    }
    if(!args[1]){
        server_queue.songs = [];
        server_queue.connection.dispatcher.end();
        queue.delete(message.guild.id);
        message.channel.send('Queue cleared completely!')
        return;
    }
    let start = args[1];
    let end = args[1];
    if(args[2]){
        end = args[2];
    }
    start = parseInt(start);
    end = parseInt(end);
    if(!(Number.isInteger(start) && Number.isInteger(end))){
        return message.channel.send('Add only numbers as indexes!');
    }
    let limit = server_queue.songs.length;
    if((start < 0 || start == 0 || start > limit) || (end < 0 || end == 0 || end > limit) || end < start){
        return message.channel.send('Indexes are out of reach.');
    }
    try{
        server_queue.songs.splice(start, end-start+1);
        message.channel.send('Queue cleared!');
    }catch(err){
        message.channel.send('Error clearing queue!');
    }
}