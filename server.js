/**
 * @author Nitesh kumar
 */

var express = require("express");
var mongoose = require("mongoose");
var http = require('http');

var bodyParser = require("body-parser");
var config = require("./config/"+process.env.ENV_CONFIG);
var routes = require("./src/router/routes");
var transactionService = require('./src/service/TransactionService')
var syncBlock = require('./src/repository/SyncBlockRepository.js');
var TronWeb = require("tronweb");

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE 
);

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
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.set('url', config.baseUrl);
app.use("/api/v1/tron",routes);

//connect mongo db database
mongoose.connect(config.MONGO_URI, function(err){
    if(err) throw err;
    else console.log("connection successfully");
})

/**
 * Set Interval for saving incoming transaction
 * @First - fetch current blockNum from tron server
 * @Second - Save into our database
 * 
 * @Funtionality = fetch all the transaction and save or update our wallets 
 */
setInterval(async () => {
    await tronweb.trx.getCurrentBlock().then(item => {
            console.log("Blockchain Height on Tron Network ", item.block_header.raw_data.number)
            
            //Fetch Last processing block from database
            syncBlock.fetchNowBlockNum().then((blockNumInDb) => {
                console.log("Local Blockchain Height in Database ::: ", blockNumInDb)
                
                var behindBlock = item.block_header.raw_data.number - blockNumInDb;
                console.log('Number of Block to Process ::: ', behindBlock)
                console.log('----------------------------------------------')
                if(behindBlock > 0){
                    let processBlockNum;
                    for(let i = 1; i <= behindBlock; i++){
                        processBlockNum = blockNumInDb + i;
                        console.log('Processing Blockchain Number ::: ', processBlockNum);
                        tronweb.trx.getBlock(processBlockNum).then(response => {
                            transactionService.processBlock(response, processBlockNum);
                        }).catch(err => {
                            console.log('Error Processing Blockchain Number ::: ', processBlockNum);
                            transactionService.saveBlockNumForLeterProcessing(processBlockNum);
                        })
                    }
                    transactionService.saveNowBlock(processBlockNum, blockNumInDb);
                }
            }).catch((error) => {
                console.log('something goes wrong during fetch current block from database ::: ', error);
            });
            
        }).catch(err => {
            console.log('something goes worng to get blockchain height ::: ', err);
        });     
}, 3000);

//Port to access the api
http.createServer(app).listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
});

module.exports = app;