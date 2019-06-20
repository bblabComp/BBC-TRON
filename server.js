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
 */
let methodInExecution = 0; 
setInterval(async () => {
    if(methodInExecution == 0){
        methodInExecution = 1;
        const result = await tronweb.trx.getCurrentBlock();
        if(result!=null){
            let blockchainHeight = result.block_header.raw_data.number;
            console.log("Blockchain Height ", blockchainHeight)
            let localBlockchainHeight = await new Promise((resolve, reject) => {
                syncBlock.fetchNowBlockNum().then((item) => {
                    if(item != null){
                        resolve(item);
                    }
                }).catch((err) => {
                    reject(null)
                });
            });
            console.log('Local Blockchain Height ::: ', localBlockchainHeight)
            var blockBehind = blockchainHeight - localBlockchainHeight;
            console.log('Block Behind By ::: ', blockBehind);
            if(blockBehind > 0){
                let processBlockNum = 0;
                for(let i = 1; i <= blockBehind; i++){
                    processBlockNum = localBlockchainHeight + i;
                    let processBlockData = await tronweb.trx.getBlock(processBlockNum);
                    if(processBlockData != null){
                        console.log('Processing Blockchain Number ::: ', processBlockNum);
                        transactionService.processBlock(processBlockData, processBlockNum);
                    }else{
                        console.log('Error Processing Blockchain Number ::: ', processBlockNum);
                        transactionService.saveNowBlock(processBlockNum - 1, localBlockchainHeight);
                        break;
                    }
                }
                transactionService.saveNowBlock(processBlockNum, localBlockchainHeight);
            }
        }else{
            console.log('Something went wrong to get Blockchain Height ::: ', err);
        }
        methodInExecution = 0;
    }   
}, 3000);

//Port to access the api
http.createServer(app).listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
});

module.exports = app;