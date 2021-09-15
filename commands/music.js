const ytdl = require('ytdl-core');
const ytsc = require('yt-search');
const Discord = require("discord.js");

//will keep guild id, and queue constructor {voice channel, text channel, connection, song list}
const queue = new Map();


module.exports = {
	name: 'play',
    aliases: ['p','skip','pause','resume','disconnect','np','queue'],
	description: 'Plays music from youtube',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}

        const server_queue = queue.get(message.guild.id);
        var cmd = (message.content).split(' ')[0].substring(1);

        if(cmd === 'play' || cmd === 'p') play(message, args, server_queue, voice_ch)
        else if(cmd === 'pause') pause_song(message, server_queue);
        else if(cmd === 'resume') resume_song(message, server_queue);
        else if(cmd === 'skip') skip_song(message, server_queue)
        else if(cmd === 'disconnect') disconnect(message, server_queue)
        else if(cmd === 'np'){
            if(server_queue){
                message.channel.send(`🎶 Now playing **${server_queue.songs[0].title}**`);
            }else{
                message.channel.send('The queue is empty!');
            }
        }
        else if(cmd === 'queue') list_queue(message, server_queue);


        
	},
};

const play = async (message, args, server_queue, voice_ch) =>{
    if(!args.length) return message.channel.send('You need to write a song name or link first');
            let song = {};

            //if its a single youtube url
            if(ytdl.validateURL(args[0])){
                const song_info = await ytdl.getInfo(args[0]);
                song = {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
            
            
            // if its a search query
            }else{
                const finder = async (query) => {
                    const videoResult = await ytsc(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
                }

                const video = await finder(args.join(' '));
                if(video){
                    song = {title: video.title, url: video.url};
                }else{
                    message.channel.send("Error finding video. ");
                }
            }

            if(!server_queue){

                const queue_constructor = {
                    voice_channel: voice_ch,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
    
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);

                try{
                    const connection  = await voice_ch.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0])
                }catch(err){
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting! ');
                }
            }else{
                server_queue.songs.push(song);
                return message.channel.send(`**${song.title}** added to the queue!`)
            }
    
}

const video_player = async (guild, song) => {
     const song_queue = queue.get(guild.id);

     if(!song){ 
         song_queue.voice_channel.leave();
         queue.delete(guild.id);
         return;
     }

     const stream = ytdl(song.url, { filter: 'audioonly'});
     song_queue.connection.play(stream, {seek: 0, volume: 1})
     .on('finish', () =>{
         song_queue.songs.shift();
         video_player(guild, song_queue.songs[0]);
     });

     await song_queue.text_channel.send(`🎶 Now Playing **${song.title}**`);
}

const pause_song = async(message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in an audio channel to execute this command!');
    if(!server_queue) return message.channel.send('There are no songs to pause in the queue!');

    server_queue.connection.dispatcher.pause(true);
    message.channel.send(`⏸ Paused **${server_queue.songs[0].title}**`)
}

const resume_song = async(message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in an audio channel to execute this command!');
    if(!server_queue) return message.channel.send('There are no songs to resume in the queue!');

    server_queue.connection.dispatcher.resume(true);
    message.channel.send(`▶ Resumed **${server_queue.songs[0].title}**`)
}


const skip_song = async (message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in an audio channel to execute this command!');
    if(!server_queue) return message.channel.send('There are no songs to skip in the queue!');
    server_queue.connection.dispatcher.end();
}

const disconnect = async (message, server_queue) => {
    if(!message.member.voice.channel) return message.channel.send('You need to be in an audio channel to execute this command!');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}


const list_queue = async (message, server_queue) =>{
    var embeds = [];
    if(!server_queue) return message.channel.send('There are no songs in the queue!')
    embeds = build_queue(server_queue, embeds, message , 0);

    let plural = (server_queue.songs.length == 1) ? 'song' : 'songs';
    if(embeds.length > 1){
        embeds.forEach((e, i) => {
            e.setFooter(`\n\n **${server_queue.songs.length} ${plural} in queue**\nPage ${i} out of ${embeds.length}`);
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
                        i = ++i % results.length;
                        break;
                        case '⏮':
                        i = --i % results.length;
                        break;
                    }
                    msg.edit(embeds[i]);
                    msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                    if(i == results.length){
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

const build_queue = (print_queue, embeds, message, index) =>{
    var embed = new Discord.MessageEmbed()
        .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setTitle(`${message.guild.name}'s Music Queue!`)
        .setColor('#FFFF00')
    index++;

    let description = `**NOW PLAYING**\n${print_queue.songs[0].title}\n\n`;

    var limit = (print_queue.songs.length > 25) ? 25 : print_queue.songs.length;
    if(limit > 1){
        description += ':arrow_down: Up Next: :arrow_down: \n\n';
    }

    for(var i = 1; i < limit;i++){
        description += '`'+`${i}.`+'`' + ` ${print_queue.songs[i].title}\n`;
        index++;
    }
    embed.setDescription(description);

    embeds.push(embed);
    if(index < print_queue.songs.length){
        build_queue(print_queue, embeds, message, index);
    }else{
        return embeds;
    }
}