const fetch = require('node-fetch');
const Discord = require("discord.js");

module.exports = {
    name: 'movie',
    aliases: ['mov'],
    description: 'Find Streaming links for movies',
    async execute(message, args){
        var query = '';
        
        for(i = 0; i < args.length; i++){
            query+=args[i]+' ';
            
        }
        var url = `https://sg.media-imdb.com/suggests/${query.substring(0,1)}/${query}.json`
        var movies = await fetchData(url,query);
        try{
            movies = (movies.d).filter(function (e){
                return e.id.startsWith('tt');
            })
        }catch(error){
            message.channel.send("No movies were found. :(");
            return;
        }

        if(movies.length == 0){
            message.channel.send("No movies were found. :(");
            return;
        }

        var i = 0;

        url = `http://www.omdbapi.com/?i=${movies[i].id}&apikey=53ff7995`
        var json = await fetchAdditionalData(url);
        if(json.Poster == 'N/A'){
            json.Poster = '';
        }

        var msg = message.channel.send(embed(json))
        .then(async function(msg){
            if(movies.length > 1){
                msg.react('⏭')
                msg.react('🔀');
                await msg.awaitReactions(async reaction => {
                    if(reaction.emoji.reaction.count > 1){
                        switch(reaction.emoji.name){
                        case '⏭':
                            i = ++i % movies.length;
                            break;
                        case '⏮':
                            i = --i % movies.length;
                            break;
                        case '🔀':
                            i = Math.floor(Math.random() * movies.length);
                            break;
                        }
                        
                        url = `http://www.omdbapi.com/?i=${movies[i].id}&apikey=53ff7995`
                        json = await fetchAdditionalData(url);
                        msg.edit(embed(json));

                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        if(i == movies.length){
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
    return json;
}

function embed(json){
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
        .addField('Watch Here:', `https://fsapi.xyz/movie/${json.imdbID}`, true)
        .setFooter('IMDB Score:  '+json.imdbRating);

    return embed;
}