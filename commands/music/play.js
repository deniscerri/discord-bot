const ytdl = require('ytdl-core');
const ytsc = require('yt-search');
const ytpl = require('ytpl');
const Discord = require("discord.js");
const index = require('../../index.js');
const now_playing = require(`${__dirname}/now_playing.js`);


module.exports = {
	name: 'play',
    aliases: ['p'],
	description: 'Plays music from youtube',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        
        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        
        if(!(message.guild.me.voice.channel == voice_ch) && message.guild.me.voice.channel){
            return message.channel.send('You need to be in the same audio channel as the bot to play a song!');
        }
        
        const server_queue = queue.get(message.guild.id);
        if(!args.length){
            if(server_queue){
                if(server_queue.connection.dispatcher.pausedSince != null && server_queue.connection.dispatcher.pausedSince > 0){
                    server_queue.connection.dispatcher.resume(true);
                    message.channel.send(`▶ Resumed **${server_queue.songs[0].title}**`)
                }
                return;
            }else{
                return message.channel.send('You need to write a song name or link first');
            }
        }
        let songs = await search(message, queue, server_queue, voice_ch, args);
        if(!songs){return;}
        add_to_queue(message, queue, server_queue, songs, voice_ch);
    },
}

async function add_to_queue(message, queue, server_queue, songs, voice_ch){
    if(!server_queue){
        const queue_constructor = {
            voice_channel: voice_ch,
            text_channel: message.channel,
            connection: null,
            repeat: false,
            songs: []
        }

        queue.set(message.guild.id, queue_constructor);
        songs.forEach(song => queue_constructor.songs.push(song))

        try{
            const connection  = await voice_ch.join();
            queue_constructor.connection = connection;
            video_player(message,queue,message.guild, queue_constructor.songs[0])
        }catch(err){
            queue.delete(message.guild.id);
            message.channel.send('There was an error connecting! ');
        }
    }else{
        songs.forEach(song => server_queue.songs.push(song))
        if(songs.length > 1){
            return now_playing.added_to_queue(message, server_queue, 'playlist', server_queue.songs.length-1)
        }
        return now_playing.added_to_queue(message, server_queue, 'song', server_queue.songs.length-1);
    }
}

async function video_player(message, queue, guild, song){

    if(queue == undefined) {return;}
    const song_queue = queue.get(guild.id);

    if(!song){
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly'});
    song_queue.connection.play(stream, {seek: 0, volume: 1})
    .on('error', () => {
        message.channel.send('Error playing stream!');
        song_queue.songs.shift();
        song_queue.repeat = false;
        video_player(message, queue, guild, song_queue.songs[0]);
    })
    .on('finish', () =>{
        if(!song_queue.repeat){
           song_queue.songs.shift();
        }
        video_player(message, queue, guild, song_queue.songs[0]);
    });

    await now_playing.execute(message , []);
}

async function search(message, queue, server_queue, voice_ch, args){
    let songs = []; 
        let song = {};
        //if its a playlist link
        try{
            let checkPlaylist = await ytpl.getPlaylistID(args[0]);
            message.channel.send('🧐 Searching for playlist: `'+args[0]+'`...');
            const results = await ytpl(checkPlaylist, {pages: 1});
            for(var i = 0; i < results.items.length; i++){
                try{
                    if(results.items[i].isPlayable){
                        let song = {
                            title: results.items[i].title,
                            url: results.items[i].shortUrl,
                            length_seconds: results.items[i].durationSec,
                            requestedBy: message.author.username+'#'+message.author.discriminator,
                            playlist_url: results.url,
                            playlist_title: results.title,
                        }
                        songs.push(song);
                    }
                }catch(err){
                    continue;
                }
            }
            
        }catch(err){
            //if its a single youtube url
            if(ytdl.validateURL(args[0])){
                message.channel.send('🧐 Searching for: `'+args[0]+'`...');
                const song_info = await ytdl.getInfo(args[0]);
                song = {
                    title: song_info.videoDetails.title,
                    url: song_info.videoDetails.video_url, 
                    length_seconds: song_info.videoDetails.lengthSeconds,
                    requestedBy: message.author.username+'#'+message.author.discriminator
                }
               
                songs.push(song);
            // if its a search query
            }else{
                const finder = async (query) => {
                    message.channel.send('🧐 Searching for: `'+args.join(' ')+'`...');
                    const videoResult = await ytsc(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
                }

                const video = await finder(args.join(' '));
                if(video){
                    song = {
                        title: video.title, 
                        url: video.url, 
                        length_seconds: video.seconds, 
                        requestedBy: message.author.username+'#'+message.author.discriminator
                    };
                    songs.push(song);
                }else{
                    message.channel.send("Error finding video. ");
                    return;
                }
                
            }
        }
    return songs;
}


module.exports.video_player = video_player;
module.exports.add_to_queue = add_to_queue;
module.exports.search = search;