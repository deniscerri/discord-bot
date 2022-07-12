const ytdl = require('ytdl-core');
const play = require('play-dl');

play.setToken({ useragent: ['Chrome/100']})

play.setToken({
    spotify: {
        client_id: process.env.SpotifyClientID,
        client_secret: process.env.SpotifyClientSecret,
        refresh_token: process.env.SpotifyRefreshToken,
        market: 'US'
    }
})

play.getFreeClientID().then((clientID) => {
    play.setToken({
      soundcloud : {
          client_id : clientID
      }
    })
})

const ytsc = require('yt-search');
const ytpl = require('ytpl');
const Discord = require("discord.js");
const {joinVoiceChannel, AudioResource, createAudioResource, createAudioPlayer, AudioPlayerStatus} = require('@discordjs/voice');
const index = require('../../index.js');
const now_playing = require(`${__dirname}/now_playing.js`);


module.exports = {
	name: 'play',
    aliases: ['p'],
	description: 'Plays music from youtube',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        
        if(!voice_ch){ return message.channel.send({content: 'You need to be in a audio channel to execute this command!'});}
        
        if(!(message.guild.me.voice.channel == voice_ch) && message.guild.me.voice.channel){
            return message.channel.send({content: 'You need to be in the same audio channel as the bot to play a song!'});
        }
        
        const server_queue = queue.get(message.guild.id);
        if(!args.length){
            if(server_queue){
                if(server_queue.audioPlayer._state.status == 'paused'){
                    server_queue.audioPlayer.unpause();
                    message.channel.send({content: `▶ Resumed **${server_queue.songs[0].title}**`})
                }
                return;
            }else{
                return message.channel.send({content: 'You need to write a song name or link first'});
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
            audioPlayer: createAudioPlayer(),
            repeat: false,
            songs: []
        }

        queue.set(message.guild.id, queue_constructor);
        songs.forEach(song => queue_constructor.songs.push(song))

        try{
            let connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
            queue_constructor.connection = connection;
            queue_constructor.connection.subscribe(queue_constructor.audioPlayer);
            video_player(message,queue,message.guild, queue_constructor.songs[0])
        }catch(err){
            console.log(err);
            queue.delete(message.guild.id);
            message.channel.send({content: 'There was an error connecting! '});
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
    const server_queue = queue.get(guild.id);
    if(!song){
        server_queue.connection.disconnect();
        queue.delete(guild.id);
        return;
    }
    server_queue.audioPlayer.removeAllListeners('idle');

    let stream = await getStream(song);
    try{
        const track = createAudioResource(stream.stream, {inlineVolume: true, inputType: stream.type});
		track.volume.setVolume(1);
        server_queue.audioPlayer.play(track);
        await now_playing.execute(message , [server_queue, true]);

    }catch(err){
        console.log(err);
        message.channel.send({content:'Error playing stream!'});
        server_queue.songs.shift();
        server_queue.repeat = false;
        video_player(message, queue, guild, server_queue.songs[0]);
    }
    server_queue.audioPlayer.once('idle', () => nextSong(message, queue, guild, server_queue));
}

function nextSong(message, queue, guild, server_queue){
    if (!server_queue.repeat){
        server_queue.songs.shift();
    }
    video_player(message, queue, guild, server_queue.songs[0]);
}

async function getStream(song){
    let stream;
    switch(song.type){
        case "youtube":
            stream = play.stream(song.url)
            return stream;
        case "spotify":
            let searched = await play.search(song.title, {limit: 1})
            stream = play.stream(searched[0].url)
            return stream;
        case "soundcloud":
            stream = play.stream(song.url)
            return stream;
    }
}

async function search(message, queue, server_queue, voice_ch, args){
    let songs = []; 
    let song = {};
    if(args[0].startsWith("http") && args[0].includes("youtu")){
        var isPlaylist = args[0].includes("list");
        switch(isPlaylist){
            //is playlist
            case true:
                var checkPlaylist = '';
                try{
                    checkPlaylist = await ytpl.getPlaylistID(args[0]);
                }catch(err){
                    if(err.toString() === "Error: Mixes not supported"){
                        args[0] = args[0].split("&list=")[0]
                        isPlaylist = false
                        break
                    }else{
                        message.channel.send({content: `Couldn't parse this playlist link! :/`})
                        return
                    }
                }
                message.channel.send({content: '🧐 Searching for playlist: `'+args[0]+'`...'});
                const results = await ytpl(checkPlaylist, {limit: Infinity});
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
                                type: 'youtube'
                            }
                            songs.push(song);
                        }
                    }catch(err){
                        message.channel.send({content: 'Error parsing youtube playlist!'});
                        return;
                    }
                }
                return songs;
            // is single video
            case false:
                message.channel.send({content: '🧐 Searching for: `'+args[0]+'`...'});
                try{
                    const song_info = await ytdl.getInfo(args[0]);
                    song = {
                        title: song_info.videoDetails.title,
                        url: song_info.videoDetails.video_url, 
                        length_seconds: song_info.videoDetails.lengthSeconds,
                        requestedBy: message.author.username+'#'+message.author.discriminator,
                        type: 'youtube'
                    }
                    
                    songs.push(song);
                }catch(err){
                    console.log(err);
                    message.channel.send({content: 'Error parsing youtube link!'});
                    return;
                }

                return songs;
        }
    }
    if(args[0].startsWith("http") && args[0].includes("spotify")){
        
        if (play.is_expired()) {
            await play.refreshToken()
        }

        let spotify_data;
        
        if(args[0].includes("/track/")){
            spotify_data = await play.spotify(args[0]);
            
            song = {
                title: spotify_data.name, 
                url: args[0], 
                length_seconds: spotify_data.durationInSec, 
                requestedBy: message.author.username+'#'+message.author.discriminator,
                type: 'spotify'
            };
            songs.push(song);
        }else if (args[0].includes("/album/") || args[0].includes("/playlist/")){
            spotify_data = await play.spotify(args[0]);
            let song_list = spotify_data.fetched_tracks.values();
            
            for(let item of song_list){
                item.forEach(i => {
                    song = {
                        title: i.name, 
                        url: args[0], 
                        length_seconds: i.durationInSec, 
                        requestedBy: message.author.username+'#'+message.author.discriminator,
                        playlist_url: spotify_data.url,
                        playlist_title: spotify_data.name,
                        type: 'spotify'
                    };
                    songs.push(song);
                });
            }
        }
        return songs;
    }
    
    if(args[0].startsWith("http") && args[0].includes("soundcloud")){
        let soundcloud_data = await play.soundcloud(args[0]);
        
        song = {
            title: soundcloud_data.name, 
            url: soundcloud_data.permalink, 
            length_seconds: soundcloud_data.durationInSec, 
            requestedBy: message.author.username+'#'+message.author.discriminator,
            type: 'soundcloud'
        };
        songs.push(song);
        return songs;
    }else{
        //if its a query
        message.channel.send({content: '🧐 Searching for: `'+args.join(' ')+'`...'});
        const finder = async (query) => {
            const videoResult = await ytsc(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
        }   

        const video = await finder(args.join(' '));
        if(video){
            song = {
                title: video.title, 
                url: video.url, 
                length_seconds: video.seconds, 
                requestedBy: message.author.username+'#'+message.author.discriminator,
                type:'youtube'
            };
            songs.push(song);
        }else{
            message.channel.send({content: "Error finding video. "});
            return;
        }
        
    }

    return songs;
}


module.exports.video_player = video_player;
module.exports.add_to_queue = add_to_queue;
module.exports.search = search;