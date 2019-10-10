const TrxTimestamp = require('./../../model/TrxTimestamp');

exports.postTimestamp = async (timestamp) => {
    return new TrxTimestamp({
        lastProcessTimestamp : timestamp,
        createAt : new Date(),
        lastModified : new Date()
    }).save((err, result) => {
        console.log('-------------', result);
        err ? console.log(err) : console.log(result);
    });
}

exports.updateTimestamp = (previousTimestamp, updatedtimestamp) => {
    return new Promise((resolve, reject) => {

        trxTimestamp.updateOne({
            'lastProcessTimestamp' : previousTimestamp
        }, {
            $set :{
                'lastProcessTimestamp': updatedtimestamp
            }
        }, (err, result) => {
            err ? reject(false) : resolve(resolve);
        });
    });
}

exports.lastProcessTimestamp = () => {
    return new Promise((resolve, reject) => {
        TrxTimestamp.find({}, (err, item) => {
            if(err) console.log(err);
            if(item.length) {
                resolve({
                    data : item
                });     
            }else {
                this.postTimestamp(new Date().getTime());
                reject({
                    data : null
                });
            }
        });
    });
}