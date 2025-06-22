"use strict";
let http = require('http');
let express = require('express');

let server=express();
server.listen(8888);
console.log('Server is running on port 8888');


server.use(express.static(__dirname));

server.get('/', function(req, res){
    console.log("Під'єднання від дорогоцінного клієнта!");
    res.sendFile(__dirname+"/index.html");
});
