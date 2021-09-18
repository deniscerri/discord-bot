const ytdl = require('ytdl-core');
const ytsc = require('yt-search');
const Discord = require("discord.js");
const index = require('../../index.js');


module.exports = {
	name: 'play',
    aliases: ['p'],
	description: 'Plays music from youtube',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        
        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
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
                repeat: false,
                songs: []
            }

            queue.set(message.guild.id, queue_constructor);
            queue_constructor.songs.push(song);

            try{
                const connection  = await voice_ch.join();
                queue_constructor.connection = connection;
                video_player(queue,message.guild, queue_constructor.songs[0])
            }catch(err){
                queue.delete(message.guild.id);
                message.channel.send('There was an error connecting! ');
            }
        }else{
            server_queue.songs.push(song);
            return message.channel.send('`'+song.title+'` added to the queue!')
        }
    },
}

async function video_player(queue, guild, song){
    if(queue == undefined) {return;}
    const song_queue = queue.get(guild.id);

    if(!song){
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly'});
    song_queue.connection.play(stream, {seek: 0, volume: 1})
    .on('finish', () =>{
        if(!song_queue.repeat){
           song_queue.songs.shift();
        }
        video_player(queue, guild, song_queue.songs[0]);
    });

    await song_queue.text_channel.send('🎶 Now Playing `'+song.title+'`');
}


module.exports.video_player = video_player;