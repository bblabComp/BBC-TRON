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

exports.getTransaction = () => {
    return new Promise((resolve, reject) => {
        Deposit.find({status : 'PENDING'}, (err, item) => {
            if(item != null){
                resolve({
                    result : 'OK',
                    message : 'List of Pending Transaction',
                    size : item.length,
                    data : item
                });
            }else{
                reject({
                    result : 'Fail',
                    message : 'Someting goes wrong',
                    data : null
                });
            }
        });
    });
}

exports.getPendingTransaction = (req, res) => {
    this.getTransaction().then(item => {
        res.json(item);
    }).catch(err => {
        console.log('something goes wrong :::')
    })
}