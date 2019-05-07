/**
 * @author Nitesh kumar
 */

var UnSyncBlock = require('../../model/UnSyncBlock');
const TronWeb = require("tronweb");
var config = require("../../config/"+process.env.ENV_CONFIG); 

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);

exports.updateUnSyncBlock = (item) => {
    UnSyncBlock.updateOne({
        'blockNum': item.number
    }, {
        $set : {
            'status': item.status
        }
    }, function(err, result) {
        if(err) throw err;
        if(result) console.log('Block sync successfully')
    });
}

exports.getUnSyncBlock = () => {
    return new Promise((resolve, reject) => {
        UnSyncBlock.find({'status': 'PENDING'}, (err, item) => {
            if(err) throw err;
            if(item){
                resolve({
                    success: true,
                    msg: "List of UnSync block",
                    data:item
                })
            }else{
                reject({
                    success: false,
                    msg: "No data present",
                    data:[]
                })
            }
        })
    })
}

exports.postUnSyncBlock = (item) => {
    return new UnSyncBlock({
        blockNum:item.blockNum,
        status: item.status,
        createdAt: new Date(),
        lastModified: new Date()
    }).save((err, result) => {
        return result;
    });
}