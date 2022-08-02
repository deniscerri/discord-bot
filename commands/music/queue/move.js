const index = require('../../../index.js')
const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');



module.exports = {
    data: new SlashCommandBuilder()
	.setName('move-queue')
	.setDescription('Move elements in the queue.')
    .addSubcommand(comm =>
        comm.setName('one')
            .setDescription('Move one song to the top')
            .addStringOption(option =>
                option.setName('index')
                .setDescription('Write the song index from the queue!')
                .setRequired(true)
            )
    )
    .addSubcommand(comm =>
        comm.setName('swap')
            .setDescription('Swap the positions of two songs 1->2 2->1')
            .addStringOption(option =>
                option.setName('index1')
                .setDescription('Write the song index from the queue!')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('index2')
                .setDescription('Write the song index from the queue!')
                .setRequired(true)
            )
    )
    .addSubcommand(comm =>
        comm.setName('last')
        .setDescription('Move last element to the top')
    ),
	async execute(message) {
        await message.deferReply();

        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if (!voice_ch) { return message.editReply({ content: 'You need to be in a audio channel to execute this command!' }); }
        const server_queue = queue.get(message.guild.id);

        if (!message.guild.me.voice.channel) return message.editReply({ content: 'I am not in a voice channel!' });

        if (message.guild.me.voice.channel == voice_ch) {
            if (!server_queue || server_queue.songs.length <= 1) { message.editReply({ content: 'The queue is empty!' }); return; }
            move(message, server_queue)
            return;
        } else {
            message.editReply({ content: 'You need to be in the same audio channel as the bot to activate song repeat!' });
        }


    }
}


const move = (message, server_queue) => {
    if(message.options._subcommand == 'one'){
        try{
            let index = message.options._hoistedOptions[0].value
            let song = server_queue.songs[index]
            server_queue.songs.splice(index , 1);
            server_queue.songs.splice(1, 0, song)

            return message.editReply({content: "Moved ``" + `${song.title}`+"``to the top of the queue!"})
        }catch(err){
            return message.editReply({content: "Error Moving Song!"})
        }
    }else if(message.options._subcommand == 'swap'){
        try{
            let index1 = message.options._hoistedOptions[0].value
            let index2 = message.options._hoistedOptions[1].value
            
            let song1 = server_queue.songs[index1]
            let song2 = server_queue.songs[index2]
            server_queue.songs[index1] = song2
            server_queue.songs[index2] = song1

            return message.editReply({content: "Swapped ``" + `${song1.title}`+"`` with ``" 
                                    + `${song2.title}` 
                                    +"``!"})
        }catch(err){
            return message.editReply({content: "Error Swapping Songs!"})
        }
    }else if(message.options._subcommand == 'last'){
        try{
            let index = server_queue.songs.length - 1
            let song = server_queue.songs[index]
            server_queue.songs.splice(index , 1);
            server_queue.songs.splice(1, 0, song)

            return message.editReply({content: "Moved ``" + `${song.title}`+"``to the top of the queue!"})
        }catch(err){
            return message.editReply({content: "Error Moving Song!"})
        }
    }
}