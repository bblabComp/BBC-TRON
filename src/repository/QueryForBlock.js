var Block = require('../../model/Block');
const TronWeb = require("tronweb");

const tronweb = new TronWeb(
    config.FULL_NODE,
    config.SOLLYDITY_NODE,
    config.EVENT_SERVER
);

exports.getDbNowBlock = () => {
    return new Promise((resolve, reject) => {
        Block.find((err, item) => {
            if(err){
                reject({
                    success: false,
                    msg: "Something went wrong"
                });
            }else if(item == null || item.length == 0){
                var firstBlock = {
                    id : item.id,
                    blockNum:tronweb.trx.getCurrentBlock(),
                    status : 'PROCESSED',
                }
                this.postNowBlock(item);
                resolve({
                    success: true,
                    msg: "alert Status",
                    data:firstBlock
                })
            }else{
                resolve({
                    success: true,
                    msg: "alert Status",
                    data:item
                });
            }
        }).sort({$natural: -1})
        .limit(1)
        .next();
    });
}

exports.fetchNowBlockNum = (req, res) => {
    return this.getDbNowBlock().then(response => { 
        return response.data.blockNum;
    }).catch(error => {
        console.log(error);
    });
}

exports.postNowBlock = (item) => {
    if(item!=null){
        new Block({
            blockNum:item.blockNum,
            status : item.status,
            createdAt: new Date(),
            lastModified: new Date()
        }).save((err, res) => {
            if(err) throw err;
            return res;
        });
    } 
}