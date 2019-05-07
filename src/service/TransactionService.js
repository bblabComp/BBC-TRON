var doTemplating = require('./doTemplating')
var config = require('../../config/'+process.env.ENV_CONFIG)
var syncBlock = require('../repository/SyncBlockRepository');
var WalletRepository = require('../repository/WalletRepository.js')
var TransactionRepository = require('../repository/TransactionRepository.js')
var UnSyncBlock = require('../repository/UnSyncBlockRepository');
var TronWeb = require("tronweb");
var axios = require('axios');

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE 
);

exports.processBlock = async (res, processBlockNum) => {
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
}

/**
* THREE WAY WE CAN CALL THE EXTERNAL API.
* @https
* @axios (to do this, use command to install- npm install axios@0.16.2)
* @request (to do this, use command to install- npm install request@2.81.0)
* 
*/
async function incomingTransaction(transactionBody){
    console.log('incomming transaction ::: ', config.MAIN_URL+'/deposit/tron');
    return await axios.post(config.MAIN_URL+'/deposit/tron', {
        toAddress : transactionBody.toAddress,
        fromAddress : transactionBody.owner_address,
        tranId: transactionBody.txID,
        amount: transactionBody.amount
    }).then((res) => {
        if(res){
            console.log('deposit tron amount to the user wallet ::::');
        }
        return res;
    }).catch((err) => {
        console.log('getting error during axios call', err)
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
        const item = TransactionRepository.postDeposit(tranInfo);
        doTemplating.loadTemplate();
        return item;
    });
}

/**
 * @Update The currenct block of tron in database
 */
exports.saveNowBlock = async (nowBlockNum, prevBlockNum) => {
    //save now block in db ;
    await syncBlock.updateBlockNum(nowBlockNum, prevBlockNum).then(result => {
        console.log('-----------------------');
    }).catch(error => {
        console.log('Error while saving current block ::: ')
    });
}

/**
 * @Update The currenct block of tron in database
 */
exports.saveBlockNumForLeterProcessing = async (height) => {
    //save now block in db ;
    var item = {
        blockNum: height,
        status:'PENDING'
    }
    const result = await UnSyncBlock.postUnSyncBlock(item);
    if(result != null){
        console.log('Save Block number for letter processing ');
        return result;
    }else{
        console.log('Error while saving current block ::: ')
    }
}