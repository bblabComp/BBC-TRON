var TransactionRepository = require('../repository/TransactionRepository');
var TrxTimestampRepostory = require('../repository/TrxTimestampRepostory');
var config = require('../../config/'+process.env.ENV_CONFIG)
var TronWeb = require("tronweb");
var axios = require('axios');

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE 
);

/**
 * @Important : this function is used to get the pending transaction and send to the bexchange server for saving information
 * for the user transaction.
 * @see : it is used in set interval function.
 */
exports.processPendingTransaction = async () => {
    return new Promise((resolve, rejcect) => {
        TransactionRepository.getTransaction('PENDING').then(item => {
            if(item){
                for(let k = 0; k < item.data.length; k++){
                    tronDepositApi(item.data[k]);
                }
                resolve(true);
            }
            rejcect(false);
        }).catch(err => {
            console.log('No Pending transaction.')
        });
    });
}

/**
 * @Important :: In this method we collect all the transaction which is 'ECONNREFUSED' and try to process again.
 * First validating address.
 */
exports.getEconnRefusedTransaction = async () => {
    return new Promise((resolve, rejcect) => {
        TransactionRepository.getTransaction('ECONNREFUSED').then((item) => {
            if(item){
                for(let k = 0; k < item.data.length; k++){
                    axios.get('http://localhost:8060/api/v1/coin/walletAddress/search/address', {
                        params: {
                            address: dtos.toAddress,
                            projection: "userAddressWithPrivateKey"
                        }
                    }).then(address => {
                        if(address.data){
                            tronDepositApi(dtos)
                        }
                    }).catch(err => {
                        console.log('Address is not present in coin database.')
                    });
                }
                resolve(true);
            } 
            rejcect(false);
        }).catch((err) => {
            console.log(err);
        });
    });
}

const tronDepositApi = async (depositDto) => {
    await axios.post('http://localhost:8060/api/v1/coin/deposit/tron', {
        fromAddress: depositDto.fromAddress,
        toAddress: depositDto.toAddress,
        amount: depositDto.amount,
        transactionHash : depositDto.transactionHash 
    }).then(result => {
        if(result.data.status){
            TransactionRepository.updateTransaction(item.data[k]._id, 'COMPLETED');
        }
    }).catch(err => {
        console.log('something goes worng during pending transaction.', err.code)
    });
}

// exports.processTransactionForOrganization = async () => {
//     TrxTimestampRepostory.lastProcessTimestamp().then((item) => {
//         if(item.data !== null){
//             axios.get('https://api.shasta.trongrid.io/v1/accounts/TY25dyeYC5rAaywHePuwZs97jXLqHaDoZU/transactions', {
//                 params : {
//                     only_to: true,
//                     only_confirmed: true,
//                     min_timestamp: item.data[0].lastProcessTimestamp // from a minute ago to go on
//                 }
//             }).then(result => {
//                 if(result.data.data.length){
//                     var depositDto = [];
//                     for(let m = 0; m < result.data.data.length; m++){
//                         depositDto.push({
//                             fromAddress: tronweb.address.fromHex(result.data.data[m].raw_data.contract[0].parameter.value.owner_address),
//                             toAddress: tronweb.address.fromHex(result.data.data[m].raw_data.contract[0].parameter.value.to_address),
//                             amount: result.data.data[m].raw_data.contract[0].parameter.value.amount,
//                             transactionHash : result.data.data[m].txID
//                         });
//                     }
//                     this.tronDepositApiForOrganization(depositDto);
//                 }
//             }).catch(err => {
//                 console.log(err);
//             });
//         }
//     }).catch((err) => {
//         console.log(err);
//     })
// }

// const tronDepositApiForOrganization = async (depositDto) => {
//     await axios.post('http://localhost:8060/api/v1/coin/save/organization/transactions', depositDto).then(result => {
//         console.log(result);
//     }).catch(err => {
//         console.log(err);
//     })
//     //to do api call to update organization history
// }