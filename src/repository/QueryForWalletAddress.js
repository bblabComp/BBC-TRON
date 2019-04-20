var WalletAddress = require('../../model/WalletAdress');

findByWalletAddress = (address) => {
    return new Promise((resolve, reject) => {
        WalletAddress.find({address : address}, (err, item) => {
            if(err){
                reject({
                    success: false,
                    msg: "Something went wrong"
                });
            }else{
                resolve({
                    data:item
                });
            }
        });
    })
}

exports.findAddress = (address) => {
    return findByWalletAddress(address).then((element) => {
        if(element != null){
            return true;
        }else{
            return false;
        }
    }).catch((err) => {
        console.log('something worng in find by wallet address', err);
    })
}

exports.postCreateAddressInfo = (reqBody) => {
    new WalletAddress({
        address : reqBody.address,
        privateKey : reqBody.privateKey,
        publicKey : reqBody.publicKey,
        createAt : reqBody.createAt,
        lastModified : reqBody.lastModified
    }).save((err, res) => {
        if(err) {
            console.log('getting some error ', res);
        }
        return res;
    })
}


