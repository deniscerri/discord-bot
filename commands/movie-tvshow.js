const fetch = require('node-fetch');
const Discord = require("discord.js");
const key = process.env['moviedb'];


module.exports = {
    name: 'movie',
    aliases: ['mov','tv'],
    description: 'Find Streaming links for movies and tv shows',
    async execute(message, args){
        var query = '';
        var season = '';
        var episode = '';
        let type = (message.content).split(' ')[0].substring(1);
        
        if(args.length > 0){
          if(type == 'mov' || type == 'movie'){
            query+=args[0];
            for(var i = 1; i <= args.length-1; i++){
              query+=' '+args[i]+' ';
            }
            query = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${query}&page=1&include_adult=false`;

          }else{
            var el = args[args.length-1];
            if((el.startsWith('s') || el.startsWith('S')) && el.length < 7){
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

                query+=args[0];
                  for(var i = 1; i <= args.length-2; i++){
                    query+=' '+args[i]+' ';
                  }

            }else{
              query+=args[0];
              for(var i = 1; i <= args.length-1; i++){
                query+=' '+args[i]+' ';
              }
              
            }


            query = `https://api.themoviedb.org/3/search/tv?api_key=${key}&language=en-US&query=${query}&page=1&include_adult=false`;
          }
        }else{
          if(type == 'mov' || type == 'movie'){
            query = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`
          }else{
            query = `https://api.themoviedb.org/3/discover/tv?api_key=${key}&language=en-US&sort_by=popularity.desc&page=1&timezone=America%2FNew_York&include_null_first_air_dates=false&with_watch_monetization_types=flatrate`
          }
        }
        
        var media = await fetchData(query);

        if(media.length == 0 || media.results == 0){
            message.channel.send("No media was found. :(");
            return;
        }
        if(type =='mov'){type = 'movie'};
        var extra_query = `https://api.themoviedb.org/3/${type}/${media.results[0].id}?api_key=${key}&language=en-US`;
        
        var currentMedia = await fetchData(extra_query);

        
        var i = 0;

        var msg = message.channel.send(embed(currentMedia, type, season, episode))
        .then(async function(msg){
            if(media.results.length > 1){
                msg.react('⏭')
                msg.react('🔀');
                await msg.awaitReactions(async reaction => {
                    if(reaction.emoji.reaction.count > 1){
                        switch(reaction.emoji.name){
                        case '⏭':
                            i = ++i % media.results.length;
                            break;
                        case '⏮':
                            i = --i % media.results.length;
                            break;
                        case '🔀':
                            i = Math.floor(Math.random() * media.results.length);
                            break;
                        }
                        
                        extra_query = `https://api.themoviedb.org/3/${type}/${media.results[i].id}?api_key=${key}&language=en-US`;
                        currentMedia = await fetchData(extra_query);
                        msg.edit(embed(currentMedia, type, season, episode));

                        msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        if(i == media.results.length){
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

async function fetchData(url){
    let settings = { method: "Get" };
    try{
        var response = await fetch(url, settings)
        let json = await response.json();
        return json;       
    }catch(err){
        let json = {};
        return json;
    }
}


function embed(media, type, season, episode){
    let posterPath = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${media.poster_path}`;

    var embed = new Discord.MessageEmbed()
        .setTitle(media.original_title || media.name)
        .setImage(posterPath)
        .addFields(
            {name:'Rating', value: media.vote_average, inline: true},
            {name:'Released', value: media.release_date || media.first_air_date, inline: true},
            {name:'Runtime', value: media.runtime || media.episode_run_time, inline: true},
            {name:'Genre', value: media.genres[0].name, inline: true},
        )
        .setDescription(media.overview)

    if(type == 'tv'){
        if(season == ''){season = 1};
        if(episode == ''){episode = 1};
        embed.addField('Watch Here:', `https://fsapi.xyz/tv-tmdb/${media.id}-${season}-${episode}`, true);
    }else{
        embed.addField('Watch Here:', `https://fsapi.xyz/tmdb-movie/${media.id}`, true);
    }

    return embed;
}