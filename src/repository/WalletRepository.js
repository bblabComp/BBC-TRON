var WalletAddress = require('../../model/Wallet');

exports.findByWalletAddress = (address) => {
    return new Promise((resolve, reject) => {
        WalletAddress.findOne({base58address : address}, (err, item) => {
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

exports.findAddress = async (address) => {
    return await this.findByWalletAddress(address).then((element) => {
        return element;
    }).catch((err) => {
        console.log('something worng in find by wallet address', err);
    })
}

exports.postCreateAddressInfo = (reqBody) => {
    return new WalletAddress({
        base58address : reqBody.address,
        hexAddress : reqBody.hexAddress,
        privateKey : reqBody.privateKey,
        publicKey : reqBody.publicKey,
        walletType : reqBody.walletType,
        createAt : reqBody.createAt,
        lastModified : reqBody.lastModified
    }).save((err, res) => {
        if(err) {
            console.log('getting some error ', res);
        }
        return res;
    })
}


