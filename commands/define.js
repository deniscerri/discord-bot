const fetch = require('node-fetch');
const {MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');

let isRandom = false;
let url;

module.exports = {
	name: 'define',
  aliases: ['def'],
	description: 'Gives definition of said word!',
	async execute(message, args) {
    var question = args.slice(0).join(" ");
    url = `http://api.urbandictionary.com/v0/define?term=${question}`;
    if(question === ''){
      url = `http://api.urbandictionary.com/v0/random`;
      isRandom = true;
    }
    
    var json = await fetchDefinitions();

    //navigation buttons
    let another = new MessageButton()
      .setCustomId("another")
      .setLabel("Another Definition")
      .setStyle("PRIMARY")
    let one_result = new MessageButton()
      .setCustomId('one')
      .setLabel('1 Result Found')
      .setStyle('SECONDARY')
      .setDisabled(true)

    let row = new MessageActionRow();
    if(json.list.length > 1){
        row.addComponents(another);
    }else{
        row.addComponents(one_result);
    }


    //index to use
    var i = 0;
    try{
      var msg = message.channel.send({embeds: [embed(json, i)], components: [row] })
      .then(async function(msg){
          if(json.list.length > 1){
            const collector = msg.createMessageComponentCollector({
              time: 600000
            });

            collector.on("collect", async (ButtonInteraction) => {
              ButtonInteraction.deferUpdate();
              const id = ButtonInteraction.customId;
              if(id == 'another'){
                if(isRandom && i == json.list.length-1){
                  json = await fetchDefinitions();
                }
                i++;
                i = i % json.list.length;

                row = new MessageActionRow();
                row.addComponents(another);

                msg.edit({embeds: [embed(json, i)], components: [row]});
              }
          });

          collector.on("end", (ButtonInteraction) => {
              msg.edit({embeds: [embed(json, i)]});
          })
          
        }
          
      })
      
   }catch(err){
      message.channel.send('No definition found. :(');
   }
    return;
	},
  
};


 async function fetchDefinitions(){
  let settings = { method: "Get" };
    let res;
    var response = await fetch(url, settings)
    let json = await response.json();
    return json;
}

function embed(json, i){
  var embed = new MessageEmbed()
          .setTitle((json.list[i].word).charAt(0).toUpperCase() + json.list[i].word.substring(1))
          .setURL(json.list[i].permalink)
          .setDescription(json.list[i].definition)
          .addField('Example:', json.list[i].example, true)
          .setFooter('👍 '+json.list[i].thumbs_up+' 👎 '+json.list[i].thumbs_down);

  return embed;
}
