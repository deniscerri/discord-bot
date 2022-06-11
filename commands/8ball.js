const fs = require('fs');

module.exports = {
	name: '8ball',
	description: 'Responds to your stupid questions!',
	execute(message, args) {
    var question = args.slice(0).join(" ");
  
    if(question === ''){
      message.channel.send({content: "Where the question at smh!"});
        return;
    }

    let answerText = fs.readFileSync("./txt/8ball.txt").toString();
    let answers = answerText.split("\n");
    let answer = answers[Math.floor(Math.random() * answers.length)]
    message.channel.send({content: answer});
  
	},
};
