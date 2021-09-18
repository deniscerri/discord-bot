const index = require('../../index.js');

module.exports = {
	name: 'skip',
	description: 'Skips the current playing song',
	async execute(message, args) {
        const voice_ch = message.member.voice.channel;
        const queue = index.queue;

        if(!voice_ch){ return message.channel.send('You need to be in a audio channel to execute this command!');}
        const server_queue = queue.get(message.guild.id);
        
        if(!server_queue) return message.channel.send('There are no songs to skip in the queue!');

        var cmd = '';
        if(args[0] != undefined){
            cmd = args[0].toLowerCase();
        }
        if(Number.isInteger(parseInt(cmd))){
            cmd = parseInt(cmd);
            let limit = server_queue.songs.length;
            if(cmd >= limit){
                if(limit == 1){
                    return message.channel.send('There are no songs to skip in the queue!');
                }else{
                    return message.channel.send('There are only '+(limit-1)+' songs in the queue!');
                }
            }else{
                for(var i = 0; i < cmd-1; i++){
                    server_queue.songs.shift();
                }
            }
        }
        server_queue.connection.dispatcher.end();

    }
}