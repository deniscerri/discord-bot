const index = require('../../index.js');
const Discord = require("discord.js");

module.exports = {
	name: 'queue',
	description: 'Shows the Music Queue',
	async execute(message, args) {
        const queue = index.queue;
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) return message.channel.send('There are no songs in the queue!');

        var embeds = [];
        var limit = 10;
        for(var i = 0; i < server_queue.songs.length; i+=limit){
            let tmp_embed = build_queue(server_queue, message , i, limit);
            embeds.push(tmp_embed);
        }
        
        
        let plural = (server_queue.songs.length == 1) ? 'song' : 'songs';
        if(embeds.length > 1){
            embeds.forEach((e, i) => {
                e.setFooter(`\n\n ${server_queue.songs.length-1} ${plural} in queue\nPage ${i+1} out of ${embeds.length}`);
            });
        }

        var i = 0;
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


const build_queue = (server_queue, message, index, limit) =>{
    var embed = new Discord.MessageEmbed()
        .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setTitle(`${message.guild.name}'s Music Queue!`)
        .setColor('#FFFF00')
    index++;

    let description = `**NOW PLAYING**\n${server_queue.songs[0].title}`;
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
        description += '`'+i+'.`' + ` ${server_queue.songs[i].title}\n`;
    }
    embed.setDescription(description);

    return embed;
}