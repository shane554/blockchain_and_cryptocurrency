const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];

    }
    // will handle multiples payments at once
    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if (amount > senderOutput.amount) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recipient });
        Transaction.signTransaction(this, senderWallet);

        return this;

    }


    
    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;

    }

    static newTransaction(senderWallet, recipient, amount) {
        //we need an instance of the transaction

        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }
        
        //transaction outputs
         return Transaction.transactionWithOutputs(senderWallet, [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
          
         ] );

         // we want to generate input when new transaction is created
    }

    static rewardTransaction(minerwallet, blockchainwallet) {
        //blockchaiin needs to approve awards
        return Transaction.transactionWithOutputs(blockchainwallet, [{
            amount: MINING_REWARD, address: minerwallet.publicKey
        }]);
    }

    //new function to sign transaction
    static signTransaction(transaction, senderWallet) {
        //we now assign the input to an object
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))

        }

    }
    //takes 3 inputs
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }

}

module.exports = Transaction;