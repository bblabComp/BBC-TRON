var Deposit = require('../../model/Deposit');

exports.postDeposit = (item) => {
    new Deposit({
        fromAddress : item.fromAddress,
        toAddress : item.toAddress,
        amount : item.amount,
        blockNum : item.blockNum,
        tranId : item.tranId,
        status : 'PENDING',
        createdAt: new Date(),
        lastModified: new Date()
    }).save((err, res) => {
        if(err) throw err;
        return res;
    });
    
}