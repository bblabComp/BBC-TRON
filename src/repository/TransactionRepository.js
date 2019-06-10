var Deposit = require('../../model/Transaction');

exports.findByTxnId = (trxId) => {
    return new Promise((resolve, reject) => {
        Deposit.findOne({tranId : trxId}, (err, result) => {
            if(err){
                reject({
                    data : null
                })
            }else{
                resolve({
                    data : result
                })
            }
        });
    });
}

exports.postDeposit = (item) => {
    return new Deposit({
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

exports.updateTransaction = (req, res) => {
    Deposit.updateOne({
        '_id': req.body._id
    }, {
        $set :{
            'status':'CONFIRMED'
        }
    }, function(err, result){
        var resBody = {
            result: true,
            message: 'update successfully'
        }
        res.json(resBody);
    })
}

exports.getTransaction = () => {
    return new Promise((resolve, reject) => {
        Deposit.find({status : 'PENDING'}, {_id:1, fromAddress:1, toAddress:1, amount:1, tranId:1, createdAt:1, lastModified:1}, (err, item) => { 
            if(err) throw err;
            if(item != null){
                resolve({
                    result : true,
                    message : 'List of Pending Transaction',
                    size : item.length,
                    data : item
                });
            }else{
                reject({
                    result : false,
                    message : 'No data present',
                    data : []
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