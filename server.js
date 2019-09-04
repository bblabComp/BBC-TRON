/**
 * @author Nitesh kumar
 */
var express = require("express");
var mongoose = require("mongoose");
var http = require('http');

var bodyParser = require("body-parser");
var config = require("./config/" + process.env.ENV_CONFIG);
var routes = require("./src/router/routes");
var transactionService = require('./src/service/TransactionService')
var tronService = require('./src/service/TronService')
var syncBlock = require('./src/repository/SyncBlockRepository.js');
var TronWeb = require("tronweb");

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);
mongoose.Promise = global.Promise;
var app = express();
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
app.use("/api/v1/tron", routes);

//connect mongo db database
mongoose.connect(config.MONGO_URI, function (err) {
    if (err) throw err;
    else console.log("connection successfully");
});

//Port to access the api
http.createServer(app).listen(config.PORT, function () {
    console.log('Application listing on port', config.PORT);
});

module.exports = app;

/** ------------------------------------------------------------------------------------------------------------------------------------------------ */
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
    if (!status) {
        status = true;
        const currentBlock = await tronweb.trx.getCurrentBlock();
        await currentBlock ? filterTransaction(currentBlock) : console.log("Something goes worng with the tron server.");
        status = false;
    }
}, 3000);

const filterTransaction = async (currentBlock) => {
    let currentBlockNumber = currentBlock.block_header.raw_data.number;
    let currentSyncBlockNumber = await new Promise((resolve, reject) => {
        syncBlock.getCurrentSyncBlockNumber(currentBlockNumber).then((item) => {
            item ? resolve(item) : reject(null);
        }).catch((err) => {
            reject(null);
        });
    });
    let blockBehind = currentBlockNumber - currentSyncBlockNumber;
    console.log("Number of block on tron server - ", currentBlockNumber);
    console.log("Number of syncing block on our server - ", currentSyncBlockNumber);
    console.log("Number of block behind from the tron server - ", blockBehind);

    blockBehind > 0 ? processingBlockNumber(currentSyncBlockNumber, blockBehind) : console.log("No transaction available for our user.");
};

const processingBlockNumber = async (currentSyncBlockNumber, blockBehind) => {
    const flag = new Promise((resolve, reject) => {
        for (let block = 1; block <= blockBehind; block++) {
            const blockInfo = tronweb.trx.getBlock(currentSyncBlockNumber + block);
            blockInfo ? transactionService.processBlock(blockInfo) : console.log("Block information null.")
        }
        return resolve(true);
    });
    flag ? syncBlock.updateBlockNumInDb(currentSyncBlockNumber + blockBehind, currentSyncBlockNumber) : console.log('Something goes wrong.');
}
/** ---------------------------------------------------------------------------------------------------------------------------------------------- */



/**
 * @Important :: this setInterval function is used to process the pending transaction.
 * when transaction status is 'PENDING'
 */
let transactionStatus = false;
setInterval(async () => {
    if(!transactionStatus){
        transactionStatus = true;
        await tronService.processPendingTransaction();
        transactionStatus = false;
    }
}, 2000);

/**
 * @Important :: this setInterval function is used to process the pending transaction.
 * when transaction status is 'ECONNREFUSED'
 */
let trxnStatus = false;
setInterval(async () => {
    if(!trxnStatus){
        trxnStatus = true;
        await tronService.getEconnRefusedTransaction();
        trxnStatus = false;
    }
}, 2000);

// /**
//  * @important :: This interval is used to check, there is any transaction for organization wallet
//  * and there is any transaction then it will call the SERVER to insert incoming transaction history.
//  */
// let timestampStatus = false;
// setInterval(async () => {
//     if(!timestampStatus){
//         timestampStatus = true;
//         tronService.processTransactionForOrganization();
//         timestampStatus = false;   
//     }
// }, 3000)