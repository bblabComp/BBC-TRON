const express = require('express');
var query = require("../repository/QueryForAlert");
var QueryForDeposit = require('../repository/QueryForDeposit');
var QueryForWalletAddress = require('../repository/QueryForWalletAddress')
const router = express.Router();
const config = require("../../config/config");

const TronWeb = require("tronweb");

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);

router.get('/email-alert', function(req, res){
    query.fetchDataHandler(req, res);
});

router.post('/alert', function(req, res){
    console.log("in post call")
    query.postItem(req, res);
})

/**
 * @returns current block of tron main server
 * @param : non
 * 
 */
router.get('/nowBlock', function(req, res){
    tronweb.trx.getCurrentBlock((err, response) => {
        
        if(err){
            console.log("getting error", err)
        }else{
            // console.log('getting response', response);
            res.json(response.block_header);
        }     
    });
});

/**
*
* This API is used for creating Address
* createAccount() function return promise.......
* @return = json object with 
            Private key, Public key, address
*/
router.get('/create/address', (req, res) => {
    tronweb.createAccount().then(response => {
        var item = {
            address : response.address.base58,
            privateKey : response.privateKey,
            publicKey : response.publicKey,
            createAt : new Date(),
            lastModified : new Date()
        }
        QueryForWalletAddress.postCreateAddressInfo(item);
        res.send(response)
    }).catch(error => {
        var returnObject = {
            message:'Something goes worng'
        }
        res.json(returnObject);  
    });
});

/**
 * @returns account information 
 * @requires tron address 
 */
router.get('/account', (req, res) => {
    tronweb.trx.getAccount(""+req.body.address).then(response => {
        res.json(response);
    }).catch(error => {
        console.log(error);
    });
});

/**
 * @Balance : To check the balance in wallet
 * @Param : need Address
 */
router.get('/wallet/balance', (req, res) =>{
    tronweb.trx.getBalance(req.body.address).then(response => {
        var resObject = {
            result:'OK',
            data : {
                balance:response,
                address:req.body.address,
            },
            timestamp:new Date()
        }
        res.json(resObject);
    }).catch(error => {
        console.log(error);
    })
});

/**
 * @Return : withdrawal information like transaction hash, raw_data
 * @Param : need -To (address - where to send the tron)
 *               -Amount (money)
 *               -Private key (need private key of the user account)
 * @Important : - Without Private key of wallet we can't able to send the TRX
 */
router.post('/withdrawalTrx', (req, res) => {
    tronweb.trx.sendTransaction(req.body.to, req.body.amount, req.body.privateKey).then(response => {
        console.log('---', req.body.privateKey);
        res.json(response);
    }).catch(error => {
        console.log(error);
    })
})


router.get('/testing', (req, res) => {
    let taxHash = [];
    tronweb.trx.getBlockByNumber('3224144').then(item => {
        
        for(let key in item.transactions){
            if(item.transactions[key].raw_data.contract[0].type==='TransferContract'){
                console.log('hello');
            }
        }
        res.json(item);
    }).catch(err => {
        console.log("------", err);
    })
});

/**
 * @Monitoring - Check the server is up or not;
 */
router.get('/health', (req, res) => {
    var responseObject = {
        status : "UP"
    }
    res.json(responseObject);
})


module.exports = router;




