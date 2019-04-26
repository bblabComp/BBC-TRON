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
var queryForBlockNum = require('./src/repository/QueryForBlock.js');
var queryForAddress = require('./src/repository/QueryForWalletAddress.js')
var queryForDeposit = require('./src/repository/QueryForDeposit.js')
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
        queryForBlockNum.fetchNowBlockNum().then((blockNumInDb) => {

            console.log("Block Number in Database ", blockNumInDb)
            var blockDiff = item.block_header.raw_data.number - blockNumInDb;

            console.log('Number of Block to Sync ', blockDiff)
            if(blockDiff > 0){
                for(let i = 1; i <= blockDiff; i++){
                    let processBlockNum = blockNumInDb + i; 

                    //Fetching Block Information to check the block is for our address or not
                    tronweb.trx.getBlock(processBlockNum).then(res => {
                        for(let key in res.transactions){
                            if(res.transactions[key].raw_data.contract[0].type === 'TransferContract'){

                                let address = tronweb.address.fromHex(res.transactions[key].raw_data.contract[0].parameter.value.owner_address);
                                //Check the address is present in database or not
                                queryForAddress.findAddress(address).then(result => {
                                    if(result == true){
                                        incomingTransaction(processBlockNum, res.transactions[key].txID, res.transactions[key].raw_data);
                                    }
                                }).catch(err => {
                                    console.log('Something goes Wrong', err)
                                })
                            }
                        }
                    }).catch(err => {
                        console.log("error caught in get block infor ", err)
                    });
                }
                //save block number
                saveNowBlock(item.block_header.raw_data.number, blockNumInDb);
            }
        }).catch((error) => {
            console.log('error list', error);
        });
        
    }).catch(err => {
        console.log('something goes worng', err);
    });   
}, 3000);

/**
* THREE WAY WE CAN CALL THE EXTERNAL API.
* @https
* @axios (to do this, use command to install- npm install axios@0.16.2)
* @request (to do this, use command to install- npm install request@2.81.0)
* 
*/
function incomingTransaction(blockNum, txID, raw_data){
    axios.post(config.MAIN_URL+'/incomingTransaction', {
        transactionId : txID,
        raw_data : raw_data
    }).then((res) => {
        if(res != null){
            emailService.onSuccessTransaction(res.data);
        }
    }).catch((err) => {
        doTemplating.loadTemplate();
        var tranInfo = {
            fromAddress : tronweb.address.fromHex(raw_data.contract[0].parameter.value.owner_address),
            toAddress : tronweb.address.fromHex(raw_data.contract[0].parameter.value.to_address),
            amount : raw_data.contract[0].parameter.value.amount,
            blockNum : blockNum,
            tranId : txID,
            status : 'PENDING',
            createdAt: new Date(),
            lastModified: new Date()
        }
        queryForDeposit.postDeposit(tranInfo);
    })
}

/**
 * @Update The currenct block of tron in database
 */
function saveNowBlock(nowBlockNum, prevBlockNum){
    //save now block in db ;
    queryForBlockNum.updateBlockNum(nowBlockNum, prevBlockNum).then(result => {
        console.log('-----------------------');
    }).catch(error => {

    });
}

//Port to access the api
http.createServer(app).listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
});

module.exports = app;