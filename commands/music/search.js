const Discord = require("discord.js");
const ytsc = require('yt-search');
const player = require(`${__dirname}/play.js`);
const index = require('../../index.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('playsearch')
	.setDescription('Searches for a song from youtube to play.')
    .addStringOption(option =>
		option.setName('query')
			.setDescription('Write a query or link')
			.setRequired(true)),
	async execute(message) {

        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.reply({content: 'You need to be in a audio channel to execute this command!'});}
        var server_queue = queue.get(message.guild.id);

        if(!server_queue){
            server_queue = player.init_queue(message);
        }

        let args = message.options._hoistedOptions[0].value

        const finder = async (query) => {
            const videoResult = await ytsc(query);
            return (videoResult.videos.length > 1) ? videoResult.videos : null
        }
        var authorId = message.user.id
        var messg = await message.reply({fetchReply: true, content: '🧐 Searching for: `'+args+'`...'});
        const videos = await finder(args);

        if(videos){
            let embed = new Discord.MessageEmbed()
                .setTitle('🔎 Search Results: [Write one of the numbers shown]')

            let limit = (videos.length > 10) ? 10 : videos.length;
            let desc = '';
            var length = '';

            for(var i = 0; i < limit; i++){
                if(videos[i].seconds < 3600){
                    length = new Date(videos[i].seconds * 1000).toISOString().substr(14, 5)
                }else{
                    length = new Date(videos[i].seconds * 1000).toISOString().substr(11, 8)
                }

                desc += '`'+(i+1)+'.` ['+videos[i].title +']('+videos[i].url+') `['+length+']` \n';
            }

            embed.setDescription(desc);
            let filter = m => m.author.id === authorId
            
            messg.channel.send({embeds: [embed]}).then(()=>{
                msg();
                function msg (){
                    const collector = messg.channel.createMessageCollector({filter, max: 1, time: 30000});
                    collector.on('collect', message => {
                        if(message == undefined){
                            return;
                        }
                        if(Number.isInteger(parseInt(message.content))){
                            let query = parseInt(message.content);
                            query--;
                            if(query < limit){
                                let song = {
                                    title: videos[query].title,
                                    url: videos[query].url, 
                                    length_seconds: videos[query].seconds,
                                    length: player.convert_length(videos[query].seconds), 
                                    requestedBy: message.author.username+'#'+message.author.discriminator,
                                    type: 'youtube',
                                };
                                songs = [song];
                                server_queue.length_seconds += parseInt(song.length_seconds)
                                player.add_to_queue(message, queue, server_queue, songs, voice_ch);
                                server_queue = queue.get(message.guild.id);
                                msg();
                            }else{
                                messg.channel.send({content: 'There are only '+(limit)+' search results!'});
                                msg();
                            }
                        }
                    })
                    
                }
            })
            
        }else{
            messg.channel.send({content: "Error finding video. "});
            return;
        }
    }
}
