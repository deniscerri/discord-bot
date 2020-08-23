const Discord = require('discord.js');
const {Client, MessageAttachment} = require('discord.js');
const client = new Client();
client.once('ready', () => {
    console.log('DenisBot is online!');
});

const token = 'NzQ2ODI3NTY5MzExMTIxNDc5.X0F_Xw.74b4nHyVa8R_n1rxXzxZQDKbFLw';
const prefix = 'W';

var fs = require('fs');
var text = fs.readFileSync("./gifs/hug.txt").toString();
var hug = text.split("\n");

var topicText = fs.readFileSync("./topic.txt").toString();
var topic = topicText.split("\n");

var roastText = fs.readFileSync("./roast.txt").toString();
var roast = roastText.split("\n");



client.on('message', msg=>{
    let args = msg.content.substring(prefix.length).split(" ");

    //msg.react('🤔');

    if(msg.content.startsWith(prefix)){
        switch(args[0]){
            case 'commands' :
                const commandEmbed = new Discord.MessageEmbed()
                    .setColor(0x333333)
                    .setAuthor("All Commands of DenisBot")
                    .addFields(
                        {name: 'Ping', value: 'If u write this, the bot answers you pong lol'},
                        {name: 'Topic', value: 'Bot gives u a topic to talk about. 1000+ topics'},
                        {name: 'Avatar', value: 'Shows your avatar or others'},
                        {name: 'Hug', value: 'Send hug gifs xD'},
                        {name: 'Roast', value: 'Roast the shit out of u or others. 200+ roasts'},
                    )
                    .setImage('https://media1.giphy.com/media/Te4NwB59ZFn68/200.gif')
                    
                    
                msg.channel.send(commandEmbed);
                break;
            case 'ping' :
                msg.channel.send('pong')
                break;
            case 'topic' :
                msg.channel.send(topic[Math.floor(Math.random() * topic.length)]);
                break;
            case 'avatar' :
                const user = msg.mentions.users.first() || msg.author;
                const avatarEmbed = new Discord.MessageEmbed()
                    .setColor(0x333333)
                    .setAuthor(user.username)
                    .setImage(user.avatarURL({dynamic: true, size: 4096}));
                    
                msg.channel.send(avatarEmbed);
                break;
            case 'roast' :
                if(!(args[1] === undefined)){
                    msg.channel.send(args[1] + ' '+ roast[Math.floor(Math.random() * roast.length)]); 
                }else{
                    msg.channel.send(roast[Math.floor(Math.random() * roast.length)]);       
                }
                
                break;
            case 'hug' :
                if(!(args[1] === undefined)){
                    msg.channel.send(msg.author.username +' hugs ' + msg.mentions.users.first().username);
                }
                msg.channel.send(hug[Math.floor(Math.random() * hug.length)]);
                
                break;
        }
    }
});




client.login(token);
