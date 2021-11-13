const fs = require('fs');

module.exports = {
	name: 'roast',
	description: 'Roasts you!',
	execute(message, args) {

    var roastText = fs.readFileSync("./txt/roast.txt").toString();
    var roast = roastText.split("\n");
		if(!(args[0] === undefined)){
            message.channel.send({content: args + ' '+ roast[Math.floor(Math.random() * roast.length)]}); 
        }else{
            message.channel.send({content: roast[Math.floor(Math.random() * roast.length)]});       
        }
	},
};