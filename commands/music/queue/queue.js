const index = require('../../../index.js');
const Discord = require("discord.js");
const {MessageButton, MessageActionRow} = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
        
//navigation buttons
let next = new MessageButton()
.setCustomId("next")
.setLabel("Next")
.setStyle("PRIMARY")

let prev = new MessageButton()
.setCustomId("prev")
.setLabel("Previous")
.setStyle("PRIMARY") 

let first = new MessageButton()
.setCustomId("first")
.setLabel("First Page")
.setStyle("SECONDARY") 

let last = new MessageButton()
.setCustomId("last")
.setLabel("Last Page")
.setStyle("SECONDARY") 


module.exports = {
    data: new SlashCommandBuilder()
	.setName('queue')
	.setDescription('Show the Music Queue.')
    .addStringOption(option =>
        option.setName('page')
        .setDescription('Write the page number!')
        .setRequired(false)
    ),
	async execute(message) {
        const queue = index.queue;
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) return message.reply({content: 'There are no songs in the queue!'});
        message.deferReply();
        message.deleteReply();
        
        var embeds = [];
        var limit = 10; 
        
        //total length of the queue
        var totalLength = server_queue.length_seconds;
        
        //current playing song streaming time
        let time = server_queue.audioPlayer._state.resource.playbackDuration / 1000 ?? 0;
        
        //remaining length 
        totalLength -= time;
        if(totalLength < 3600){
            totalLength = new Date(totalLength * 1000).toISOString().substr(14, 5)
        }else{
            totalLength = new Date(totalLength * 1000).toISOString().substr(11, 8)
        }

        for(var i = 0; i < server_queue.songs.length; i+=limit){
            let tmp_embed = build_queue(server_queue, message , i, limit);
            embeds.push(tmp_embed);
        }
        
        
        let plural_song = (server_queue.songs.length == 2) ? 'song' : 'songs';
        embeds.forEach((e, i) => {
            e.setFooter(`\n\n ${server_queue.songs.length-1} ${plural_song} in queue | ${totalLength} Total Length\nPage ${i+1}/${embeds.length}`);
        });

        var i = 0;
        if(message.options._hoistedOptions.length != 0){
            let query = parseInt(message.options._hoistedOptions[0].value);
            if(Number.isInteger(query)){
                if(query <= embeds.length){
                    i = query % (embeds.length+1);
                    if(i >= 1){
                        i--;
                    }
                }else{
                    let plural_page = (embeds.length == 1) ? 'page' : 'pages';
                    message.reply({content: 'There are only '+embeds.length+' '+plural_page+' in the queue!'});
                    return;
                }
                
            }
        }

        let row = new MessageActionRow();
        let msg;

        if(embeds.length > 1){
            row.addComponents(next);
            if(embeds.length > 2){
                row.addComponents(last);
            }
            msg = message.channel.send({fetchReply: true, embeds: [embeds[i]], components: [row]})
        }else{
            msg = message.channel.send({fetchReply: true, embeds: [embeds[i]]})
        }

        msg.then(async function(msg){
            if(embeds.length > 1){
                const collector = msg.createMessageComponentCollector({
                    time: 600000
                });

                collector.on("collect", async (ButtonInteraction) => {
                    ButtonInteraction.deferUpdate();
                    const id = ButtonInteraction.customId;
                    switch(id){
                        case 'next':
                            i = ++i % embeds.length;
                            break;
                        case 'prev':
                            i = --i % embeds.length;
                            break;
                        case 'first':
                            i = 0;
                            break;
                        case 'last':
                            i = embeds.length - 1;
                            break;
                        }
                    row = new MessageActionRow();
                    if(i == embeds.length-1){
                        row.addComponents(first);
                        row.addComponents(prev);
                    }else if(i == 0){
                        row.addComponents(next);
                        row.addComponents(last);
                    }else{
                        row.addComponents(first);
                        row.addComponents(prev);
                        row.addComponents(next);
                        row.addComponents(last);
                    }
                    msg.edit({embeds: [embeds[i]], components: [row]});
                });

                collector.on("end", async (ButtonInteraction) => {
                    msg.edit({embeds: [embeds[i]], components: []});
                })
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

    let description = `**NOW PLAYING**\n [${server_queue.songs[0].title}](${server_queue.songs[0].url}) | `+'`'+server_queue.songs[0].length+' Requested by: '+server_queue.songs[0].requestedBy+'`';
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
        description += '`'+i+'.`' + ` [${server_queue.songs[i].title}](${server_queue.songs[i].url}) | `+'`'+server_queue.songs[i].length+' Requested by: '+server_queue.songs[i].requestedBy+'`\n';
    }
    embed.setDescription(description);

    return embed;
}

const clear_queue = (message,queue, server_queue) => {
    const voice_ch = message.member.voice.channel;
    if(!(message.guild.me.voice.channel == voice_ch)){
        return message.reply({content: 'You need to be in the same audio channel as the bot to clear the queue!'});
    }
    if(message.options._subcommand == 'all'){
        server_queue.songs = [server_queue.songs[0]]
        message.reply({content: 'Queue cleared completely!'})
        return;
    }

    if(message.options._subcommand == 'user'){
        let author = message.options._hoistedOptions[0].user
        try{
            server_queue.songs = server_queue.songs.filter(function(song, i){
                return (song.requestedBy !== author.username+'#'+author.discriminator) || i == 0;
            });
            server_queue.length_seconds = recalculate_queue_length(server_queue);
            message.reply({content: `Cleared all songs from user ${author}!`});
            return;
        }catch(err){
            console.log(err);
            message.reply({content: 'Error clearing queue!'});
        }
    }

    let start = null
    let end = null

    if(message.options._subcommand == 'one'){
        start = message.options._hoistedOptions[0].value
        end = message.options._hoistedOptions[0].value
    }
    if(message.options._subcommand == 'multiple'){
        start = message.options._hoistedOptions[0].value
        end = message.options._hoistedOptions[1].value
    }

    start = parseInt(start);
    end = parseInt(end);
    if(!(Number.isInteger(start) && Number.isInteger(end))){
        return message.reply({content: 'Add only numbers as indexes!'});
    }
    let limit = server_queue.songs.length;
    if((start < 0 || start == 0 || start > limit) || (end < 0 || end == 0 || end > limit) || end < start){
        return message.reply({content: 'Indexes are out of reach.'});
    }
    try{
        let deleted = server_queue.songs[start].title;
        server_queue.songs.splice(start, end-start+1);
        server_queue.length_seconds = recalculate_queue_length(server_queue);
        if(start == end){
            message.reply({content: "Removed ``" + `${deleted}`+"`` from the queue!"});
        }else{
            message.reply({content: `Removed all songs from range ${start}-${end}`})
        }
    }catch(err){
        console.log(err);
        message.reply({content: 'Error clearing queue!'});
    }
}

const recalculate_queue_length = (server_queue) => {
    var length = 0;
    for(var i = 0; i < server_queue.songs.length; i++){
        length += parseInt(server_queue.songs[i].length_seconds);
    }

    return length;
};

module.exports.recalculate_queue_length = recalculate_queue_length;