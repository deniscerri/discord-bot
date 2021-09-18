const Discord = require("discord.js");
const ytsc = require('yt-search');
const player = require(`${__dirname}/play.js`);
const index = require('../../index.js');


module.exports = {
	name: 'psearch',
	description: 'Searches a song from youtube to play!',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        let server_queue = queue.get(message.guild.id);


        const finder = async (query) => {
            message.channel.send('🧐 Searching for: `'+args.join(' ')+'`...');
            const videoResult = await ytsc(query);
            return (videoResult.videos.length > 1) ? videoResult.videos : null
        }

        const videos = await finder(args.join(' '));
        if(videos){
            let embed = new Discord.MessageEmbed()
                .setTitle('🔎 Search Results:')

            let limit = (videos.length > 10) ? 10 : videos.length;
            let desc = '';
            for(var i = 0; i < limit; i++){
                desc += '`'+(i+1)+'.` '+videos[i].title +'\n';
            }

            embed.setDescription(desc);
            let filter = m => m.author.id === message.author.id
            
            message.channel.send(embed).then(()=>{
                msg();
                function msg (){
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000
                    })
                    .then(message => {
                        message = message.first();
                        
                        if(Number.isInteger(parseInt(message.content))){
                            let query = parseInt(message.content);
                            query--;
                            if(query < limit){
                                let song = {title: videos[query].title, url: videos[query].url};
                                player.add_to_queue(message, queue, server_queue, song, voice_ch);
                                server_queue = queue.get(message.guild.id);
                                msg();
                            }else{
                                message.channel.send('There are only '+(limit-1)+' search results!');
                            }
                        }
                    })
                }
            })
            
        }else{
            message.channel.send("Error finding video. ");
            return;
        }
    }
}
