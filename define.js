const urban = module.require("urban");


module.exports = {
	name: 'define',
	description: 'Gives definition of said word!',
	execute(message, args) {
      var question = args.slice(0).join(" ");
      console.log(question);
    
      if(question === ''){
        message.channel.send("Where the word at smh!");
          return;
      }

      urban(question).first(json =>{
        if(!json){
          message.channel.send("No results found");
        }
        message.channel.send(json.definition);
      });
	},
};