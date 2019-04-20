var express = require("express");
var mongoose = require("mongoose");
var axios = require('axios');

var bodyParser = require("body-parser");
var config = require("./config/config");
var routes = require("./src/router/routes");
var queryForBlockNum = require('./src/repository/QueryForBlock.js');
var queryForAddress = require('./src/repository/QueryForWalletAddress.js')
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

        //Fetch Last processing block from database
        queryForBlockNum.fetchNowBlockNum().then((blockNumInDb) => {
            var blockDiff = item.block_header.raw_data.number - blockNumInDb;
            if(blockDiff > 0){
                for(let i = 1; i <= blockDiff; i++){
                    let processBlockNum = blockNumInDb + i; 

                    //Fetching Block Information to check the block is for our address or not
                    tronweb.trx.getBlock(processBlockNum).then(res => {
                        for(let key in res.transactions){
                            if(res.transactions[key].raw_data.contract[0].type === 'TransferContract'){

                                //Check the address is present in database or not
                                queryForAddress.findAddress(res.transactions[key].raw_data.contract[0]).then(result => {
                                    if(result == true){
                                        incomingTransaction(res.transactions[key].txID, res.transactions[key].raw_data);
                                    }
                                }).catch(err => {
                                    console.log('Something goes Wrong', err)
                                })
                            }
                        }
                    }).catch(err => {
                        console.log(err)
                    });
                }
                //save block number
                saveNowBlock(item.block_header.raw_data.number);
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
function incomingTransaction(txID, raw_data){
    axios.post(config.MAIN_URL+'/incomingTransaction', {
        transactionId : txID,
        raw_data : raw_data
    }).then((res) => {
        //doing mailing process when response === success
    }).catch((err) => {
        //mail when app server not in sync
        //save incoming transaction in mongo db for leter process.
        //
        console.log('something goes worng', err);
    })
}

/**
 * @Save The currenct block of tron in database
 */
function saveNowBlock(nowBlockNum){
    //save now block in db ;
    var blockModel = {
        blockNum:nowBlockNum,
        status:'PROCESSED',
        createdAt: new Date(),
        lastModified: new Date()
    }
    queryForBlockNum.postNowBlock(blockModel);
}


//Port to access the api
app.listen(config.PORT, function(){
    console.log('Application listing on port', config.PORT);
})

module.exports = app;