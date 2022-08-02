const index = require('../../../index.js');
const Discord = require("discord.js");
const {MessageButton, MessageActionRow} = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
        
//navigation buttons
let next = new MessageButton()
.setCustomId("next")
.setLabel("Next")
.setStyle("PRIMARY")

let prev = new MessageButton()
.setCustomId("prev")
.setLabel("Previous")
.setStyle("PRIMARY") 

let first = new MessageButton()
.setCustomId("first")
.setLabel("First Page")
.setStyle("SECONDARY") 

let last = new MessageButton()
.setCustomId("last")
.setLabel("Last Page")
.setStyle("SECONDARY") 


module.exports = {
    data: new SlashCommandBuilder()
	.setName('clear-queue')
	.setDescription('Show the Music Queue.')
    .addSubcommand(comm =>
        comm.setName('all')
            .setDescription('Clear all elements from the queue')
    )
    .addSubcommand(comm =>
        comm.setName('one')
            .setDescription('Clear one from the queue')
            .addStringOption(option =>
                option.setName('index')
                .setDescription('Write the song index from the queue!')
                .setRequired(true)
            )
    )
    .addSubcommand(comm =>
        comm.setName('multiple')
            .setDescription('Clear a range of songs from the queue')
            .addStringOption(option =>
                option.setName('first-index')
                .setDescription('Write the first song index from where the deletion starts!')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('last-index')
                .setDescription('Write the last song index you want to delete!')
                .setRequired(true)
            )
        )
    .addSubcommand(comm =>
        comm.setName('user')
            .setDescription('Clear all songs from a user')
            .addUserOption(option =>
                option.setName('target')
                .setDescription('Select a user')
                .setRequired(true)),
    )
    .addSubcommand(comm =>
        comm.setName('users-left')
            .setDescription('Clear all songs from users who have left')
    ),
	async execute(message) {
        await message.deferReply();

        const queue = index.queue;
        const voice_ch = message.member.voice.channel;

        if (!voice_ch) { return message.reply({ content: 'You need to be in a audio channel to execute this command!' }); }
        const server_queue = queue.get(message.guild.id);

        if(!server_queue) return message.editReply({content: 'There are no songs in the queue!'});
        clear_queue(message, queue, server_queue)
        return
        
    }
}

const clear_queue = (message,queue, server_queue) => {
    const voice_ch = message.member.voice.channel;
    if(!(message.guild.me.voice.channel == voice_ch)){
        return message.editReply({content: 'You need to be in the same audio channel as the bot to clear the queue!'});
    }
    if(message.options._subcommand == 'all'){
        server_queue.songs = [server_queue.songs[0]]
        return message.editReply({content: 'Queue cleared completely!'})
    }

    if(message.options._subcommand == 'user'){
        let author = message.options._hoistedOptions[0].user
        try{
            server_queue.songs = server_queue.songs.filter(function(song, i){
                return (song.requestedBy !== author.username+'#'+author.discriminator) || i == 0;
            });
            server_queue.length_seconds = recalculate_queue_length(server_queue);
            return message.editReply({content: `Cleared all songs from user ${author}!`});
        }catch(err){
            console.log(err);
            message.editReply({content: 'Error clearing queue!'});
        }
    }

    if(message.options._subcommand == 'users-left'){
        //delete any song that is added by users who have left the audio channel
        var curr_users = message.member.voice.channel.members.map(user => {
            return user.user.username + "#" + user.user.discriminator
        })

        try{
            server_queue.songs = server_queue.songs.filter(function(song, i){
                return (curr_users.includes(song.requestedBy)) || i == 0;
            });
            server_queue.length_seconds = recalculate_queue_length(server_queue);
            return message.editReply({content: `Cleared all songs from users that left!`});
            
        }catch(err){
            console.log(err);
            return message.editReply({content: 'Error clearing queue!'});
        }
    }

    let start = null
    let end = null

    if(message.options._subcommand == 'one'){
        start = message.options._hoistedOptions[0].value
        end = message.options._hoistedOptions[0].value
    }
    if(message.options._subcommand == 'multiple'){
        start = message.options._hoistedOptions[0].value
        end = message.options._hoistedOptions[1].value
    }

    start = parseInt(start);
    end = parseInt(end);
    if(!(Number.isInteger(start) && Number.isInteger(end))){
        return message.editReply({content: 'Add only numbers as indexes!'});
    }
    let limit = server_queue.songs.length;
    if((start < 0 || start == 0 || start > limit) || (end < 0 || end == 0 || end > limit) || end < start){
        return message.editReply({content: 'Indexes are out of reach.'});
    }
    try{
        let deleted = server_queue.songs[start].title;
        server_queue.songs.splice(start, end-start+1);
        server_queue.length_seconds = recalculate_queue_length(server_queue);
        if(start == end){
            return message.editReply({content: "Removed ``" + `${deleted}`+"`` from the queue!"});
        }else{
            return message.editReply({content: `Removed all songs from range ${start}-${end}`})
        }
    }catch(err){
        console.log(err);
        return message.editReply({content: 'Error clearing queue!'});
    }
}

const recalculate_queue_length = (server_queue) => {
    var length = 0;
    for(var i = 0; i < server_queue.songs.length; i++){
        length += parseInt(server_queue.songs[i].length_seconds);
    }

    return length;
};

module.exports.recalculate_queue_length = recalculate_queue_length;