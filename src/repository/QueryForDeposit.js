var Deposit = require('../../model/Deposit');

exports.postDeposit = (item) => {
    if(item!=null){
        new Deposit({
            id : item.id,
            fromAddress : item.fromAddress,
            toAddress : item.toAddress,
            privateKey : item.privateKey,
            hexAddress : item.hexAddress,
            status : 'PENDING',
            createdAt: new Date(),
            lastModified: new Date()
        }).save((err, res) => {
            if(err) throw err;
            return res;
        });
    } 
}