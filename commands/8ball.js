module.exports = {
	name: '8ball',
	description: 'Responds to your stupid ass questions!',
	execute(message, args) {
    
    var answers = [
  "Yes, idiot",
        "No, you baka",
        "Definetly",
        "Absolutely",
        "Not in a million years",
        "Honestly i don't care lol",
        "Fuck you",
        "Why are you asking me dumb shit",
        "Don't sass me bitch",
        "Sure, why not",
        "If u asked this to a random bot, i can tell you dont have a life",
        "yes???",
        "no lmfao",
        "PAUSE",
        "Absolutely fucking not",
        "no???",
        "That is the dumbest shit i heard all day",
        "Ow hell naaaaaawwawaaaaaah",
    	"ok, whatever yes",
	"when you grow a braincell, yes",
        "ask again when I'm less busy with your mom",
        "sure, i literally couldn't care less"
      ];





    var question = args.slice(0).join(" ");

  
    if(question === ''){
      message.channel.send("Where the question at smh!");
        return;
    }

        message.channel.send(answers[Math.floor(Math.random()* answers.length)]);
    

	},
};
