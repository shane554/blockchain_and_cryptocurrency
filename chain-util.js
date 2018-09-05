const EC = require('elliptic').ec;

const SHA256 = require('crypto-js/sha256');

const uuidV1 = require('uuid/v1');

// for generating new wallets
const ec = new EC('secp256k1');


class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair()
    }

    // we can now generate unique id's
    static id() {
        return uuidV1();
    }

    //we want to take string data and turn into a result
    static hash(data) {
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash) {
        //we use public key change  to hex and chain to verify 
        //vefify method takes 2 parameters
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
    }


}

module.exports = ChainUtil;