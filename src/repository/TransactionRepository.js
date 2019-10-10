var Deposit = require('../../model/Transaction');

exports.findByTxnHash = (transactionHash) => {
    return new Promise((resolve, reject) => {
        Deposit.findOne({transactionHash : transactionHash}, (err, result) => {
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
        transactionHash : item.transactionHash,
        status : 'PENDING',
        createdAt: new Date(),
        lastModified: new Date()
    }).save((err, res) => {
        if(err) throw err;
        return res;
    });
    
}

exports.updateTransaction = async (_id, status) => {
    return await Deposit.updateOne({
        '_id': _id
    }, {
        $set :{
            'status': status
        }
    }, function(err, result){
        var resBody = {
            result: true,
            message: 'update successfully'
        }
       return resBody;
    })
}

exports.getTransaction = (transactionStatus) => {
    return new Promise((resolve, reject) => {
        Deposit.find({status : transactionStatus}, {_id:1, fromAddress:1, toAddress:1, amount:1, transactionHash:1, createdAt:1, lastModified:1}, (err, item) => { 
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