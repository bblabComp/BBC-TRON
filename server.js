var express = require("express");
var mongoose = require("mongoose");
var https = require('https');
var ws = require('ws');

var bodyParser = require("body-parser");
var config = require("./config/config");
var routes = require("./src/router/routes");

mongoose.Promise = global.Promise;

var app  = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, x-access-token')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('url', config.baseUrl);
app.use("/api/v1/tron",routes);

//connect mongo db database
mongoose.connect(config.MONGO_URI, function(err){
    if(err) 
        throw err;
    else 
        console.log("connection successfully");
})

app.listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
})

/*
* @Connection with the tron server for incoming transaction;
* @Use web socket to continue listen the web socket..........................
*/
https.get('http://staging.b-cryptoexchange.com/api/v1/',(response) => {

    response.on('data', (item) => {
        
    });

}).on('error', function(err){
    console.log('something goes wrong', err);
})


module.exports = app;