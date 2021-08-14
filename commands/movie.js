const fetch = require('node-fetch');
const Discord = require("discord.js");

module.exports = {
    name: 'movie',
    aliases: ['mov'],
    description: 'Find Streaming links for movies and tv shows',
    async execute(message, args){
        var query = '';
        var season = '';
        var episode = '';
        var type = 'feature';

        query+=args[0];
        for(var i = 1; i < args.length-1; i++){
            query+=args[i]+' ';
            
        }

        var el = args[args.length-1];
        if((el.startsWith('s') || el.startsWith('S')) && el.length < 7){
            type = 'TV series';
            for(var i = 1; i < el.length; i++){
                if(el.charAt(i).startsWith('e') || el.charAt(i).startsWith('E')){
                    for(var j = i+1; j < el.length; j++){
                        episode+= el.charAt(j);
                    }
                    break;
                }else{
                    season += el.charAt(i);
                }
            }

        }
        var url = `https://sg.media-imdb.com/suggests/${query.substring(0,1)}/${query}.json`
        var media = await fetchData(url,query);
        try{
            media = (media.d).filter(function (e){
                return e.id.startsWith('tt') && e.q == type;
            })
        }catch(error){
            message.channel.send("No media was found. :(");
            return;
        }

        if(media.length == 0){
            message.channel.send("No media was found. :(");
            return;
        }

        var i = 0;

        url = `http://www.omdbapi.com/?i=${media[i].id}&apikey=53ff7995`
        var json = await fetchAdditionalData(url);

        var msg = message.channel.send(embed(json, type, season, episode))
        .then(async function(msg){
            if(media.length > 1){
                msg.react('⏭')
                msg.react('🔀');
                await msg.awaitReactions(async reaction => {
                    if(reaction.emoji.reaction.count > 1){
                        switch(reaction.emoji.name){
                        case '⏭':
                            i = ++i % media.length;
                            break;
                        case '⏮':
                            i = --i % media.length;
                            break;
                        case '🔀':
                            i = Math.floor(Math.random() * media.length);
                            break;
                        }
                        
                        url = `http://www.omdbapi.com/?i=${media[i].id}&apikey=53ff7995`
                        json = await fetchAdditionalData(url);
                        msg.edit(embed(json, type, season, episode));

                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        if(i == media.length){
                        msg.react('⏮')
                        }else if(i == 0){
                        msg.react('⏭')
                        }else{
                        msg.react('⏮')
                        msg.react('⏭')
                        }
                        msg.react('🔀')
                        
                    }
                    
                }, {time: 600000});
            }
    })
    }
}

async function fetchData(url,query){
    let settings = { method: "Get" };
    try{
        var response = await fetch(url, settings)
        let json = await response.text();
        json = json.substring(6+query.length, json.length-1);
        json = JSON.parse(json);
        return json;
    }catch(err){
        let json = {};
        return json;
    }
}

async function fetchAdditionalData(url){
    let settings = { method: "Get" };
    var response = await fetch(url, settings)
    let json = await response.json();
    if(json.Poster == 'N/A'){
      json.Poster = '';
    }
    return json;
}

function embed(json, type, season, episode){
    
    var embed = new Discord.MessageEmbed()
        .setTitle(json.Title)
        .setImage(json.Poster)
        .addFields(
            {name:'Year', value: json.Year, inline: true},
            {name:'Rated', value: json.Rated, inline: true},
            {name:'Released', value: json.Released, inline: true},
            {name:'Runtime', value: json.Runtime, inline: true},
            {name:'Genre', value: json.Genre, inline: true},
        )
        .setDescription(json.Plot)
        .setFooter('IMDB Score:  '+json.imdbRating);

    if(type == 'TV series'){
        embed.addField('Watch Here:', `https://fsapi.xyz/tv-imdb/${json.imdbID}-${season}-${episode}`, true);
    }else{
        embed.addField('Watch Here:', `https://fsapi.xyz/movie/${json.imdbID}`, true);
    }

    return embed;
}