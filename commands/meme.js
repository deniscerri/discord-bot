
const {MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const index = require('../index.js');


module.exports = {
    name: 'meme',
    aliases: ['memes','meem','mem'],
    description: 'Send Memes',
    async execute(message, args) {
        let meme_storage = index.meme_storage;
        var subreddit = '', json;

        if(args.length == 0){
            subreddit = Object.keys(meme_storage.collection)[Math.floor(Math.random() * meme_storage.length)]
            json = await meme_storage.collection[subreddit]
        }else{
            subreddit = args[0];
            json = await meme_storage.collection[subreddit]
            if(json === undefined){
                json = await meme_storage.get_memes(subreddit);
            }
        }

        
        if(json == []){
            message.channel.send({content: "Couldn't find subreddit."});
        }else{
            if((json.data.children)[0].data.over_18){
                if(!message.channel.nsfw){
                    message.channel.send({content: "This subreddit is NSFW. Send the command in a NSFW Channel!"});
                    return;
                }
            }


            // if the subreddit is not nsfw but can have nsfw posts
            // remove if the channel is not nsfw
            // also get only posts with images
            json = filterJSON(message, json)

            //navigation buttons
            let previous = new MessageButton()
            .setCustomId("previous")
            .setLabel("Previous Meme")
            .setStyle("PRIMARY")
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
            
            var i = 0
            let embed;
            var msg = message.channel.send({embeds: [buildEmbed(json, i)], components: [row] })
            .then(async function(msg){
                const collector = msg.createMessageComponentCollector({
                    time: 600000
                });

                collector.on("collect", async (ButtonInteraction) => {
                    ButtonInteraction.deferUpdate();
                    const id = ButtonInteraction.customId;
                    if(id == "previous"){
                        i--;
                        i = i % json.data.children.length;
                        embed = buildEmbed(json, i)
                    }else if(id == 'another'){
                        i++;
                        i = i % json.data.children.length;
                        embed = buildEmbed(json, i)
                    }else if(id == 'switch'){
                        i=-1
                        subreddit = Object.keys(meme_storage.collection)[Math.floor(Math.random() * meme_storage.length)]
                        json = await meme_storage.collection[subreddit]
                        json = filterJSON(message, json)
                        embed = buildEmbed(json, ++i)
                    }

                    row = new MessageActionRow();
                    if(i > 0){
                        row.addComponents(previous)
                    }
                    if(i < json.data.children.length){
                        row.addComponents(another)
                    }
                    row.addComponents(switchSub)
                    msg.edit({embeds: [embed], components: [row]});

                });

                collector.on("end", (ButtonInteraction) => {
                    msg.edit({embeds: [buildEmbed(json)], components: []});
                })
            })
        }
      return;
  },
};

function filterJSON(message, json){
    json.data.children = randomizeMemes(json.data.children)
    if(message.channel.nsfw){
        json.data.children = json.data.children.filter(c => {
            return c.data.post_hint === 'image'
        })
        return json
    }

    json.data.children = json.data.children.filter(c => {
        return c.data.over_18 == false && c.data.post_hint === 'image'
    })
    return json
}

function randomizeMemes(array){
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


function buildEmbed(json, i){
    var thememe = json.data.children[i].data;
    let embed = new MessageEmbed()
        .setTitle(thememe.title)
        .setURL(`https://reddit.com${thememe.permalink}`)
        .setFooter(`👍 ${thememe.ups} 💬 ${thememe.num_comments} | Subreddit: r/ ${thememe.subreddit}`)
        .setImage(thememe.url)

    return embed;
}