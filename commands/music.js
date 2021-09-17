const ytdl = require('ytdl-core');
const ytsc = require('yt-search');
const Discord = require("discord.js");
const lyricsParse = require('lyrics-parse');

//will keep guild id, and queue constructor {voice channel, text channel, connection, song list}
const queue = new Map();


module.exports = {
	name: 'play',
    aliases: ['p','skip','pause','resume','disconnect','np','queue', 'lyrics'],
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
        else if(cmd === 'lyrics') print_lyrics(message, server_queue);


        
	},
};

const play = async (message, args, server_queue, voice_ch) =>{
    if(!args.length) return message.channel.send('You need to write a song name or link first');
            let song = {};
            //if its a single youtube url
            if(ytdl.validateURL(args[0])){
                message.channel.send('🧐 Searching for: `'+args[0]+'`...');
                const song_info = await ytdl.getInfo(args[0]);
                song = {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
            
            
            // if its a search query
            }else{
                const finder = async (query) => {
                    message.channel.send('🧐 Searching for: `'+args.join(' ')+'`...');
                    const videoResult = await ytsc(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
                }

                const video = await finder(args.join(' '));
                if(video){
                    song = {title: video.title, url: video.url};
                }else{
                    message.channel.send("Error finding video. ");
                    return;
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
                return message.channel.send('`'+song.title+'` added to the queue!')
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

     await song_queue.text_channel.send('🎶 Now Playing `'+song.title+'`');
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

const build_queue = (server_queue, message, index, limit) =>{
    var embed = new Discord.MessageEmbed()
        .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setTitle(`${message.guild.name}'s Music Queue!`)
        .setColor('#FFFF00')
    index++;

    let description = `**NOW PLAYING**\n${server_queue.songs[0].title}\n\n`;
    
    tmp_limit = (index + limit) - server_queue.songs.length;
    if(tmp_limit >= 0) {
        limit = server_queue.songs.length
    }else{
        limit = index+limit;
    }
    

    if(limit > 1){
        description += ':arrow_down: Up Next: :arrow_down: \n\n';
    }
   
    for(var i = index; i < limit;i++){
        description += '`'+i+'.`' + ` ${server_queue.songs[i].title}\n`;
    }
    embed.setDescription(description);

    return embed;
}

 const print_lyrics = async (message, server_queue) => {
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


 const build_lyrics_embed = (server_queue, lyrics_arr, i) => {
    var embed = new Discord.MessageEmbed()
    .setAuthor('DenisBOT', 'https://cdn50.picsart.com/168503106000202.png', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .setTitle(`${server_queue.songs[0].title}'s Lyrics!`)
    .setColor('#FFFF00')
    .setDescription(lyrics_arr[i])

    return embed;
 }