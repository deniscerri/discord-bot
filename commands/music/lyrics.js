const Discord = require("discord.js");
const lyricsParse = require('lyrics-parse');
const index = require('../../index.js');

module.exports = {
	name: 'lyrics',
	description: 'Show lyrics of current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) return message.channel.send('I am not in a voice channel!');
        
        if(!(message.guild.me.voice.channel == voice_ch)){
            return message.channel.send('You need to be in the same audio channel as the bot to show lyrics!');
        }

        if(!server_queue){ message.channel.send('There are no songs playing!'); return;}
     
        const author = '';
        // remove words inside ()
        var title = server_queue.songs[0].title.replace(/ \([\s\S]*?\)/g, '');
        // remove words inside []
        title = title.replace(/ \[[\s\S]*?\]/g, '');
        
        let lyrics = await lyricsParse(title, author);

        if(!lyrics) message.channel.send('No lyrics found! :(')
        else{
            let lyrics_arr = [];
            while(lyrics.length > 6000){
                lyrics_arr.push(lyrics.substring(0, 4000));
                lyrics = lyrics.substring(4000);
            }
            lyrics_arr.push(lyrics);


            var i = 0;
            var embed = build_lyrics_embed(server_queue, lyrics_arr, 0);
            
            var msg = message.channel.send(embed)
            .then(async function(msg){
                if(lyrics_arr.length > 1){
                    msg.react('⏭')
                    await msg.awaitReactions(reaction => {
                    if(reaction.emoji.reaction.count > 1){
                        switch(reaction.emoji.name){
                            case '⏭':
                            i = ++i % lyrics_arr.length;
                            break;
                            case '⏮':
                            i = --i % lyrics_arr.length;
                            break;
                        }

                        msg.edit(build_lyrics_embed(server_queue, lyrics_arr, i));
                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        if(i == lyrics_arr.length){
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
}

const build_lyrics_embed = (server_queue, lyrics_arr, i) => {
    var embed = new Discord.MessageEmbed()
    .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .setTitle(`${server_queue.songs[0].title}'s Lyrics!`)
    .setColor('#FFFF00')
    .setDescription(lyrics_arr[i])

    return embed;
 }