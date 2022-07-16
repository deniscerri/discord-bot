const Discord = require("discord.js");
const lyricsParse = require('lyrics-parse');
const index = require('../../index.js');
const {MessageButton, MessageActionRow} = require("discord.js");

module.exports = {
	name: 'lyrics',
	description: 'Show lyrics of current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        var title = ''
        var author = ''

        if(!args.join(' ')){
            if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
            const server_queue = queue.get(message.guild.id);

            if(!message.guild.me.voice.channel) return message.channel.send('I am not in a voice channel!');
            
            if(!(message.guild.me.voice.channel == voice_ch)){
                return message.channel.send('You need to be in the same audio channel as the bot to show lyrics!');
            }

            if(!server_queue){ message.channel.send('There are no songs playing!'); return;}

            title = server_queue.songs[0].title;
        }else{
            title = args.join(' ');
        }

        // remove words inside ()
        title = title.replace(/ \([\s\S]*?\)/g, '');
        // remove words inside []
        title = title.replace(/ \[[\s\S]*?\]/g, '');
        
        let lyrics = await lyricsParse(title, author);
        if(!lyrics) message.channel.send('No lyrics found! :(')
        else{
            let lyrics_arr = [];
            while(lyrics.length > 4000){
                lyrics_arr.push(lyrics.substring(0, 4000));
                lyrics = lyrics.substring(4000);
            }
            lyrics_arr.push(lyrics);

            //navigation buttons
            let next = new MessageButton()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle("PRIMARY")
            let prev = new MessageButton()
                .setCustomId("prev")
                .setLabel("Previous")
                .setStyle("PRIMARY")  

            let row = new MessageActionRow();
            let msg;
            var embed = build_lyrics_embed(title, lyrics_arr, 0);
            if(lyrics_arr.length > 1){
                row.addComponents(next);
                msg = message.channel.send({embeds: [embed], components: [row]})
            }else{
                msg = message.channel.send({embeds: [embed]})
            }
       


            var i = 0;
            msg.then(async function(msg){
                if(lyrics_arr.length > 1){
                    const collector = msg.createMessageComponentCollector({
                        time: 600000
                    });
    
                    collector.on("collect", async (ButtonInteraction) => {
                        ButtonInteraction.deferUpdate();
                        const id = ButtonInteraction.customId;
                        switch(id){
                            case 'next':
                                i = ++i % lyrics_arr.length;
                                break;
                            case 'prev':
                                i = --i % lyrics_arr.length;
                                break;
                            }
                        row = new MessageActionRow();
                        if(i == lyrics_arr.length-1){
                            row.addComponents(prev);
                        }else if(i == 0){
                            row.addComponents(next);
                        }else{
                            row.addComponents(prev);
                            row.addComponents(next);
                        }
                        msg.edit({embeds: [build_lyrics_embed(title, lyrics_arr, i)], components: [row]});
                    });
    
                    collector.on("end", async (ButtonInteraction) => {
                        msg.edit({embeds: [build_lyrics_embed(title, lyrics_arr, i)], components: []});
                    })
                }
            })

        }
    }
}

const build_lyrics_embed = (title, lyrics_arr, i) => {
    var embed = new Discord.MessageEmbed()
    .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .setTitle(`${title}'s Lyrics!`)
    .setColor('#FFFF00')
    .setDescription(lyrics_arr[i])
    return embed;
 }