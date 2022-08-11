const lyricsParse = require('lyrics-parse');
const index = require('../../index.js');
const {ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
	.setName('lyrics')
	.setDescription('Show lyrics of current playing song.')
    .addStringOption(option =>
		option.setName('query')
			.setDescription('Write a custom title for custom lyrics!')
			.setRequired(false)),
	async execute(message) {
        await message.deferReply();

        const voice_ch = message.member.voice.channel;
        const queue = index.queue;
        var title = ''
        var author = ''
        if(message.options._hoistedOptions.length == 0){
            if(!voice_ch){ return message.editReply('You need to be in a audio channel to execute this command!');}
            const server_queue = queue.get(message.guild.id);

            if(!message.guild.members.me.voice.channel) return message.editReply('I am not in a voice channel!');
            
            if(!(message.guild.members.me.voice.channel == voice_ch)){
                return message.editReply('You need to be in the same audio channel as the bot to show lyrics!');
            }

            if(!server_queue){ message.editReply('There are no songs playing!'); return;}

            title = server_queue.songs[0].title;
        }else{
            title = message.options._hoistedOptions[0].value;
        }

        // remove words inside ()
        title = title.replace(/ \([\s\S]*?\)/g, '');
        // remove words inside []
        title = title.replace(/ \[[\s\S]*?\]/g, '');
       
        var lyrics = await lyricsParse(title, author);
        if(!lyrics) message.editReply('No lyrics found! :(')
        else{
            let lyrics_arr = [];
            while(lyrics.length > 4000){
                lyrics_arr.push(lyrics.substring(0, 4000));
                lyrics = lyrics.substring(4000);
            }
            lyrics_arr.push(lyrics);

            //navigation buttons
            let next = new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
            let prev = new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary)  

            let row = new ActionRowBuilder();
            let msg;
            var embed = build_lyrics_embed(title, lyrics_arr, 0);
            if(lyrics_arr.length > 1){
                row.addComponents(next);
                msg = await message.editReply({fetchReply: true, embeds: [embed], components: [row]})
            }else{
                msg = await message.editReply({fetchReply: true, embeds: [embed]})
            }
       


            var i = 0;
            (async (msg) => {
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
                        row = new ActionRowBuilder();
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
            })(msg);

        }
    }
}

const build_lyrics_embed = (title, lyrics_arr, i) => {
    var embed = new EmbedBuilder()
    .setAuthor({name: 'DenisBOT', iconURL: 'https://cdn50.picsart.com/168503106000202.png', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})
    .setTitle(`${title}'s Lyrics!`)
    .setColor('#FFFF00')
    .setDescription(lyrics_arr[i])
    return embed;
 }