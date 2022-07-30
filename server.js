const express = require('express');
const server = express();
require('dotenv').config();

server.all('/', (req, res)=>{
    res.send('Your bot is alive!')
})

function keepAlive(){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
}

module.exports = keepAlive;