const axios = require('axios');
const Discord = require("discord.js");
const key = process.env['moviedb'];
const baseURL = process.env['TMDBproxy'];
const {MessageButton, MessageActionRow} = require("discord.js");


//navigation buttons
let next = new MessageButton()
    .setCustomId("next")
    .setLabel("Next")
    .setStyle("PRIMARY")
let prev = new MessageButton()
    .setCustomId("prev")
    .setLabel("Previous")
    .setStyle("PRIMARY")  
let random = new MessageButton()
    .setCustomId("random")
    .setLabel("Random Result")
    .setStyle("PRIMARY")  


module.exports = {
    name: 'movie',
    aliases: ['mov','tv'],
    description: 'Find info for movies and tv shows',
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
            query = `${baseURL}/3/search/movie?api_key=${key}&language=en-US&query=${query}&page=1&include_adult=false`;

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


            query = `${baseURL}/3/search/tv?api_key=${key}&language=en-US&query=${query}&page=1&include_adult=false`;
          }
        }else{
          if(type == 'mov' || type == 'movie'){
            query = `${baseURL}/3/discover/movie?api_key=${key}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`
          }else{
            query = `${baseURL}/3/discover/tv?api_key=${key}&language=en-US&sort_by=popularity.desc&page=1&timezone=America%2FNew_York&include_null_first_air_dates=false&with_watch_monetization_types=flatrate`
          }
        }
        var media = await fetchData(query);
        if(Object.keys(media).length == 0 || media.results.length == 0){
            message.channel.send({content: "No media was found. :("});
            return;
        }
        if(type =='mov'){type = 'movie'};
        var extra_query = `${baseURL}/3/${type}/${media.results[0].id}?api_key=${key}&language=en-US`;
        
        var currentMedia = await fetchData(extra_query);
        

        let row = new MessageActionRow();
        let msg;
        if(media.results.length > 1){
            row.addComponents(next, random);
            msg = message.channel.send({embeds: [embed(currentMedia, type, season, episode)],components: [row]})
        }else{
            msg = message.channel.send({embeds: [embed(currentMedia, type, season, episode)]})
        }

        var i = 0;
        msg.then(async function(msg){
            if(media.results.length > 1){
                const collector = msg.createMessageComponentCollector({
                    time: 600000
                });

                collector.on("collect", async (ButtonInteraction) => {
                    ButtonInteraction.deferUpdate();
                    const id = ButtonInteraction.customId;
                    switch(id){
                        case 'next':
                            i = ++i % media.results.length;
                            break;
                        case 'prev':
                            i = --i % media.results.length;
                            break;
                        case 'random':
                            i = Math.floor(Math.random() * media.results.length);
                            break;
                        }
                    row = new MessageActionRow();
                    if(i == media.results.length){
                        row.addComponents(prev);
                    }else if(i == 0){
                        row.addComponents(next);
                    }else{
                        row.addComponents(prev);
                        row.addComponents(next);
                    }
                    row.addComponents(random);

                    extra_query = `${baseURL}/3/${type}/${media.results[i].id}?api_key=${key}&language=en-US`;
                    currentMedia = await fetchData(extra_query);
                    msg.edit({embeds: [embed(currentMedia, type, season, episode)], components: [row]});
                });

                collector.on("end", async (ButtonInteraction) => {
                    extra_query = `${baseURL}/3/${type}/${media.results[i].id}?api_key=${key}&language=en-US`;
                    currentMedia = await fetchData(extra_query);
                    msg.edit({embeds: [embed(currentMedia, type, season, episode)]});
                })
            }
            
        })
    }
}

async function fetchData(url){
    let settings = { method: "Get" };
    try{
        const response = await axios.get(url)
        let json = response.data;
        return json;       
    }catch(err){
        let json = {};
        return json;
    }
}


function embed(media, type, season, episode){
    let posterPath = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${media.poster_path}`;
    let genres;
    if(media.genres.length == 0) genres = 'Unknown'
    else genres = ''
    media.genres.forEach(genre => {
        genres+= genre.name +' ';
    })
    let released = media.release_date || media.first_air_date || 'Unknown';
    let runtime = media.runtime || media.episode_run_time;
    try{
        if(runtime.length == 0){
            runtime = 'Unknown';
        }
    }catch(err){
        runtime = 'Unknown';
    }
    var embed = new Discord.MessageEmbed()
        .setTitle(media.original_title || media.name)
        .setImage(posterPath)
        .addFields(
            {name:'Rating', value: media.vote_average.toString(), inline: true},
            {name:'Released', value: released.toString(), inline: true},
            {name:'Runtime', value: runtime.toString(), inline: true},
            {name:'Genre', value: genres, inline: true},
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