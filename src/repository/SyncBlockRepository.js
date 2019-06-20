/**
 * @author Nitesh kumar
 */

var Block = require('../../model/SyncBlock');
const TronWeb = require("tronweb");
var config = require("../../config/"+process.env.ENV_CONFIG); 

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);

/**
 * @Desc - Get The last block we had processed.
 * 
 */
exports.getDbNowBlock = () => {
    return new Promise((resolve, reject) => {
        Block.find({}, (err, item) => {
            if(err){
                reject({
                    success: false,
                    msg: "Something went wrong"
                });
            }else if(item == null || item.length == 0){
                
                tronweb.trx.getCurrentBlock().then(nowBlock => {
                    var firstBlock = {
                        id : item.id,
                        blockNum: nowBlock.block_header.raw_data.number,
                        status : 'DONE',
                    }
                    this.postNowBlock(firstBlock);
                    resolve({
                        success: true,
                        msg: "alert Status",
                        data:firstBlock
                    })
                }).catch(err => {
                    console.log(err);
                });
            }else{
                resolve({
                    success: true,
                    msg: "alert Status",
                    data:item
                });
            }
        }).sort({$natural: -1})
        .limit(1);
    });
}

exports.fetchNowBlockNum = () => {
    return this.getDbNowBlock().then((response) => { 
        return response.data[0].blockNum;
    }).catch(error => {
        console.log(error);
    });
}
/**---------------------------------------------------------------------------------------- */

/**
 * @Description - Update the Document whenever new block is added in the tron network.
 */
updateBlockNumInDb = (currentBlockNum, prevBlockNum) => {
    return new Promise((resolve, reject) => {
        Block.updateOne({
            "blockNum" : prevBlockNum
        }, { 
            $set: {
                "blockNum": currentBlockNum,
                "lastModified": new Date()
            }
        }, function(err, results){
            if(err) throw err;
            if(results!=null){
                resolve({
                    success: true,
                    msg: "Update Successfully",
                    data:results
                })
            }else{
                reject({
                    success: false,
                    msg: "Something goes Wrong"
                });
            }
        });
    });
}

exports.updateBlockNum = (currentBlockNum, preBlockNum) => {
    return updateBlockNumInDb(currentBlockNum, preBlockNum).then(item => {
        if(item != null){
            console.log('-----------------------');
            console.log('Update Current Block to ', currentBlockNum);
            return true;
        }
    }).catch(err => {
        console.error('Error while updating processing block')
        return false;
    });
}
/**---------------------------------------------------------------------------------------------------------------- */

exports.postNowBlock = (item) => {
    if(item!=null){
        new Block({
            blockNum:item.blockNum,
            status : item.status,
            createdAt: new Date(),
            lastModified: new Date()
        }).save((err, res) => {
            
            if(err){
                console.log('get some error', err);
            }
            console.log('-------------------------------------')
            console.log('Insert now block', res.blockNum); 
            return res;
        });
    } 
}