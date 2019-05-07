const express = require('express');
var query = require("../repository/AppStatusRepository");
var QueryForDeposit = require('../repository/TransactionRepository');
var QueryForWalletAddress = require('../repository/WalletRepository')
const router = express.Router();
const config = require("../../config/"+process.env.ENV_CONFIG);
const axios = require('axios');

const TronWeb = require("tronweb");

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);

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
* This API is used for creating Address for user
* createAccount() function return promise.......
* @return = json object with 
            Private key, Public key, address
*/
router.get('/create/user/address', (req, res) => {
    tronweb.createAccount().then(response => {
        var item = {
            address : response.address.base58,
            hexAddress : response.address.hex,
            privateKey : response.privateKey,
            publicKey : response.publicKey,
            walletType : 'USER',
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
*
* This API is used for creating Address for organization
* createAccount() function return promise.......
* @return = json object with 
            Private key, Public key, address
*/
router.get('/create/organization/address', (req, res) => {
    tronweb.createAccount().then(response => {
        var item = {
            address : response.address.base58,
            hexAddress : response.address.hex,
            privateKey : response.privateKey,
            publicKey : response.publicKey,
            walletType : 'MAIN',
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
router.get('/balance', (req, res) =>{
    tronweb.trx.getBalance(req.body.address).then(response => {
        var resObject = {
            result:'success',
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

/**
 * @Pending :::: Get all pending transaction 
 */
router.get('/pending/transaction', (req, res) => {
    QueryForDeposit.getPendingTransaction(req, res);
});

/**
 * @Update ::: update all the pending transaction to confirmed if it calls
 */
router.post('/update/transaction', (req, res) => {
    console.log('in update method', req.body._id);
    QueryForDeposit.updateTransaction(req, res);
})

/**
 * @Validate :::: To check address is correct or not.
 */
router.post('/validate/address', (req, res) => {
    console.log(req.body.address);
    axios.post(config.FULL_NODE+'/wallet/validateaddress', {
        address : req.body.address
    }).then(item => {
        // console.log("result", item);
        res.send(item.data);
    }).catch((err) => {
        console.log(err);
    })
})

/**
 * @Wallet :::: Information
 */
router.get('/wallet/info', (req, res) => {
    QueryForWalletAddress.findAddress(req.body.address).then(result => {
        res.json(result);
    });
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


router.get('/testing', (req, res) => {
    let taxHash = [];
    tronweb.trx.getTransactionInfo('29bace57f58cfa3325c0be29733114de57cf6fc428e18e6f7447994e2a16cb1e').then(item => {
        
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

module.exports = router;




