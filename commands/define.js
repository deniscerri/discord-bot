const urban = module.require("urban");


module.exports = {
	name: 'define',
  aliases: ['def'],
	description: 'Gives definition of said word!',
	execute(message, args) {
      var question = args.slice(0).join(" ");
    
      if(question === ''){
          message.channel.send("Give me a word retard!");
          return;
      }

      if(question === '.'){
          urban.random().first(function(json) {
            message.channel.send(`**${json.word}**\n`+ json.definition);
            return;
          });

      }

      urban(question).first(json =>{
        
        try{
          message.channel.send(json.definition);
        }catch(err){
          message.channel.send("No results found");
        }
        
        return;
      });
	},
};