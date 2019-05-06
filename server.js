/**
 * @author Nitesh kumar
 */

var express = require("express");
var mongoose = require("mongoose");
var axios = require('axios');
var http = require('http');

var bodyParser = require("body-parser");
var config = require("./config/config");
var routes = require("./src/router/routes");
var doTemplating = require('./src/service/doTemplating')
var syncBlock = require('./src/repository/SyncBlockRepository.js');
var WalletRepository = require('./src/repository/WalletRepository.js')
var TransactionRepository = require('./src/repository/TransactionRepository.js')
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
setInterval(function(){
    tronweb.trx.getCurrentBlock().then(item => {
        console.log("Block Number on Tron Network ", item.block_header.raw_data.number)
        //Fetch Last processing block from database
        syncBlock.fetchNowBlockNum().then((blockNumInDb) => {

            console.log("Block Number in Database ", blockNumInDb)
            var blockDiff = item.block_header.raw_data.number - blockNumInDb;
            console.log('Number of Block to Sync ', blockDiff)
            
            if(blockDiff > 0){
                let processBlockNum;
                for(let i = 1; i <= blockDiff; i++){
                    processBlockNum = blockNumInDb + i; 

                    //Fetching Block Information to check the block is for our address or not
                    tronweb.trx.getBlock(processBlockNum).then(res => {
                        for(let key in res.transactions){
                            var trxns = res.transactions[key].raw_data.contract[0];
                            if(trxns.type === 'TransferContract'){
                                console.log(':::: TransferContract :::')
                                var transactionBody = {
                                    toAddress: tronweb.address.fromHex(trxns.parameter.value.to_address),
                                    amount: trxns.parameter.value.amount,
                                    owner_address: tronweb.address.fromHex(trxns.parameter.value.owner_address),
                                    processBlockNum : processBlockNum,
                                    txID : res.transactions[key].txID
                                }
                                //Check the address is present in database or not
                                console.log('::: To Address ::: ',transactionBody.toAddress);
                                WalletRepository.findAddress(transactionBody.toAddress).then(result => {
                                    if(result.data!=null){
                                        tronweb.trx.sendTransaction(config.ORG_ADDRESS, transactionBody.amount, result.data.privateKey).then(result => {
                                            if(result){
                                                incomingTransaction(transactionBody);
                                            }
                                        }).catch(err => {
                                            console.log('something goes worng during transfer to organization wallet ::: ', err);
                                        });
                                    }
                                }).catch(err => {
                                    console.log('Something goes Wrong to find adddres in database ::: ', err);
                                })
                            }
                        }
                    }).catch(err => {
                        console.log("something goes worng to find block information ::: ", err);
                        break;
                    });
                }
                //save block number
                saveNowBlock(processBlockNum, blockNumInDb);
            }
        }).catch((error) => {
            console.log('something goes wrong during fetch current block from database ::: ', error);
        });
        
    }).catch(err => {
        console.log('something goes worng to get blockchain height ::: ', err);
    });   
}, 3000);

/**
* THREE WAY WE CAN CALL THE EXTERNAL API.
* @https
* @axios (to do this, use command to install- npm install axios@0.16.2)
* @request (to do this, use command to install- npm install request@2.81.0)
* 
*/
function incomingTransaction(transactionBody){
    console.log('incomming transaction ::: ', config.MAIN_URL+'/deposit/tron');
    axios.post(config.MAIN_URL+'/deposit/tron', {
        toAddress : transactionBody.toAddress,
        fromAddress : transactionBody.owner_address,
        trxId: transactionBody.txID,
        amount: transactionBody.amount
    }).then((res) => {
        if(res){
            console.log('deposit tron amount to the user wallet ::::');
        }
    }).catch((err) => {

        console.log("in error :::", err);
        var tranInfo = {
            fromAddress : transactionBody.owner_address,
            toAddress : transactionBody.toAddress,
            amount : transactionBody.amount,
            blockNum : transactionBody.processBlockNum,
            tranId : transactionBody.txID,
            status : 'PENDING',
            createdAt: new Date(),
            lastModified: new Date()
        }
        TransactionRepository.postDeposit(tranInfo);
        doTemplating.loadTemplate();
    });
}

/**
 * @Update The currenct block of tron in database
 */
function saveNowBlock(nowBlockNum, prevBlockNum){
    //save now block in db ;
    syncBlock.updateBlockNum(nowBlockNum, prevBlockNum).then(result => {
        console.log('-----------------------');
    }).catch(error => {
        console.log('Error while saving current block ::: ')
    });
}
// doTemplating.loadTemplate();
//Port to access the api
http.createServer(app).listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
});

module.exports = app;