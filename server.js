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
 * @INFO ::: variable methodInExecution is just a flag to identify the function is already occupied.
 *      if occupied then wail until its complete his execution. 
 * @Status tells that the setInterval function is already in execution state or not.
 * @CurrentBlock defines the number of block currently have on tron blockchain server.
 * @currentBlockNumber accept block number of tron block chain server.
 * @currentSyncBlockNumber block number which is in syncBlock database table.
 * @blockBehind number of block behind by the current block of the tron server.
 * @blockInfo getting block information from the tron server.
 */
let status = false; 
setInterval(async () => {
    if(!status){
        status = true;
        const currentBlock = await tronweb.trx.getCurrentBlock();
        currentBlock ? () => {
            let currentBlockNumber = currentBlock.block_header.raw_data.number;
            let currentSyncBlockNumber = await new Promise((resolve, reject) => {
                syncBlock.getCurrentSyncBlockNumber().then((item) => {
                    item ? resolve(item) : reject(null);
                }).catch((err) => {
                    reject(null);
                })
            });
            let blockBehind = currentBlockNumber - currentSyncBlockNumber;
            console.log("Number of block on tron server - ", currentBlockNumber);
            console.log("Number of syncing block on our server - ", currentSyncBlockNumber);
            console.log("Number of block behind from the tron server - ", blockBehind);

            blockBehind > 0 ? () => {
                console.log("in block behind condition.")
                for(let block = 1; block <= blockBehind; block++){
                    console.log("in if -", block)
                    let blockInfo = await tronweb.trx.getBlock(currentSyncBlockNumber + block);
                    blockInfo ? transactionService.processBlock(processBlockData, processBlockNum) : console.log("Block information null.")
                }
                syncBlock.updateBlockNumInDb(currentSyncBlockNumber + blockBehind,  currentSyncBlockNumber);
            } : console.log("No transaction available for our user.");
        } : console.log("Something goes worng with the tron server.");
        status = false;
    }   
}, 3000);

//Port to access the api
http.createServer(app).listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
});

module.exports = app;