
const {MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

let reddit = [
    "dankruto",
    "memes",
    "funny",
    "animememes",
    "AdviceAnimals",
    "dankmemes",
    "wholesomememes",
    "meirl",
    "2meirl4meirl",
    "comedyheaven",
    "programmerhumor",
    "cursedcomments",
    "blursedimages",
    "dashcamgifs",
    "theyknew",
    "CrappyDesign",
    "starterpacks"
]



module.exports = {
    name: 'meme',
    aliases: ['memes','meem','mem'],
    description: 'Send Memes',
    async execute(message, args) {
        let subreddit = '';
        let random = true;
        if(args.length == 0){
            subreddit = reddit[Math.floor(Math.random() * reddit.length)];
        }else{
            subreddit = args[0];
            random = false;
        }

        var json = await fetchMeme(subreddit);
        
        if(json.data.dist == 0){
            message.channel.send({content: "Couldn't find subreddit."});
        }else{
            if((json.data.children)[0].data.over_18){
                if(!message.channel.nsfw){
                    message.channel.send({content: "This subreddit is NSFW. Send the command in a NSFW Channel!"});
                    return;
                }
            }
            //navigation buttons
            let another = new MessageButton()
            .setCustomId("another")
            .setLabel("Another Meme")
            .setStyle("SUCCESS")
            let switchSub = new MessageButton()
            .setCustomId("switch")
            .setLabel("Switch Subreddit")
            .setStyle("SECONDARY")

            let row = new MessageActionRow();
            row.addComponents(another);
            row.addComponents(switchSub);
            
            var i = -1
            var msg = message.channel.send({embeds: [buildEmbed(json)], components: [row] })
            .then(async function(msg){
                const collector = msg.createMessageComponentCollector({
                    time: 600000
                });

                collector.on("collect", async (ButtonInteraction) => {
                    ButtonInteraction.deferUpdate();
                    const id = ButtonInteraction.customId;
                    if(id == 'another'){
                        row = new MessageActionRow();
                        row.addComponents(another);
                        row.addComponents(switchSub);

                        i++;
                        i = i % json.data.children.length;

                        msg.edit({embeds: [buildEmbed(json, i)], components: [row]});
                    }else if(id == 'switch'){
                        i=-1
                        subreddit = reddit[Math.floor(Math.random() * reddit.length)];
                        json = await fetchMeme(subreddit);
                        row = new MessageActionRow();
                        row.addComponents(another);
                        row.addComponents(switchSub);

                        msg.edit({embeds: [buildEmbed(json, ++i)], components: [row]});
                    }
                });

                collector.on("end", (ButtonInteraction) => {
                    msg.edit({embeds: [buildEmbed(json)]});
                })
            })
        }
      return;
  },
};

async function fetchMeme(subreddit){
    let settings = { method: "Get" };
    var response = await fetch(`https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=100`, settings);
    let json = await response.json();
    return json;
}

function buildEmbed(json, i){
    json = (json.data.children).filter(function (entry){
        return entry.data.post_hint === 'image';
    })
    var random = Math.floor(Math.random() * (json.length));
    var thememe = json[random].data;
            
    let embed = new MessageEmbed()
        .setTitle(thememe.title)
        .setURL(`https://reddit.com${thememe.permalink}`)
        .setFooter(`👍 ${thememe.ups} 💬 ${thememe.num_comments} | Subreddit: r/ ${thememe.subreddit}`)
        .setImage(thememe.url)

    return embed;
}