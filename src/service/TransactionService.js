var doTemplating = require('./doTemplating')
var config = require('../../config/'+process.env.ENV_CONFIG)
var syncBlock = require('../repository/SyncBlockRepository');
var WalletRepository = require('../repository/WalletRepository.js')
var TransactionRepository = require('../repository/TransactionRepository.js')
var TronWeb = require("tronweb");
var axios = require('axios');

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE 
);

exports.processBlock = async (res, processBlockNum) => {
    for(let key in res.transactions){
        var trxns = res.transactions[key].raw_data.contract[0];
        trxns.type === 'TransferContract' ? () => {
            console.log("in transfer contract.")
            var fromAddress = await tronweb.address.fromHex(trxns.parameter.value.owner_address);
            var toAddress = await tronweb.address.fromHex(trxns.parameter.value.to_address);
            const userWallet = axios.get(config.MAIN_URL+`/walletAddress?address=${toAddress}`);
            userWallet._embedded.walletAddress.length ? () => {
                tronweb.trx.sendTransaction(config.ORG_ADDRESS, transactionBody.amount, config.PRIVATE_KEY).then(result => {
                    if(result){
                        var depositDto = {
                            fromAddress: fromAddress,
                            toAddress: toAddress,
                            amount: trxns.parameter.value.amount,
                            transactionHash : res.transactions[key].txID
                        }
                        incomingTransaction(depositDto);
                    }
                }).catch(err => {
                    console.log('Error While Transfering Amount to Organization Wallet ::: ', err);
                });
            } : console.log("User wallet is not found.");
        
        } : console.log("fine.")
    }
}

/**
* THREE WAY WE CAN CALL THE EXTERNAL API.
* @https
* @axios (to do this, use command to install- npm install axios@0.16.2)
* @request (to do this, use command to install- npm install request@2.81.0)
* 
*/
async function incomingTransaction(depositDto){
    console.log('Process Incomming Transaction ::: ', config.MAIN_URL+'/deposit/tron');
    await axios.post(config.MAIN_URL+'/deposit/tron', depositDto).then(result => {
        if(result != null){
            console.log("Amount Deposit to the user wallet ::: Success");
        }
    }).catch(err => {
        saveUserIncomingTrxInMongoDb(transactionBody);
    });
}

function saveUserIncomingTrxInMongoDb(depositDto){
    TransactionRepository.findByTxnId(depositDto.transactionHash).then(result => {
        if(result.data == null){
            console.log("Error While Deposit Amount in user wallet ::: ", result.data);
            var tranInfo = {
                fromAddress : depositDto.owner_address,
                toAddress : depositDto.toAddress,
                amount : depositDto.amount,
                transactionHash : depositDto.transactionHash,
                status : 'PENDING',
                createdAt: new Date(),
                lastModified: new Date()
            }
            return TransactionRepository.postDeposit(tranInfo);
        }else{
            console.log('Transation id already exit ::: ');
        }
    }).catch(err => {
        console.log('Error while finding exiting Transaction ::: ')
    })
}