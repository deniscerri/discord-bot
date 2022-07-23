const {MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

let reddit = [
    "dankruto",
    "memes",
    "funny",
    "animememes",
    "AdviceAnimals",
    "dankmemes",
    "wholesomememes",
    "meirl",
    "2meirl4meirl",
    "comedyheaven",
    "programmerhumor",
    "cursedcomments",
    "blursedimages",
    "dashcamgifs",
    "theyknew",
    "CrappyDesign",
    "starterpacks",
    "okbuddyretard",
    "okbuddychicanery"
]


class Meme {
    constructor() {
      this.collection = {};
      reddit.forEach(r => 
        this.collection[r] = [],
      )
      this.length = Object.keys(this.collection).length
    }

    get collection() {
        return this._collection
    }

    get length(){
        return this._length
    }

    set collection(coll){
        this._collection = coll
    }

    set length(len){
        this._length = len
    }

    async update_collection(){
        let coll = {}
        for(var i = 0; i < this.length; i++){
            let subreddit = Object.keys(this.collection)[i];
            coll[subreddit] = await this.get_memes(subreddit)
        }
        this.collection = coll
    }

    async get_memes(subreddit){
        //get json
        let settings = { method: "Get" };
        var response = await fetch(`https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=100`, settings);
        let json = await response.json();
        if(json.data.dist == 0) json = []
        return json
    }
}

module.exports.Meme = Meme; 