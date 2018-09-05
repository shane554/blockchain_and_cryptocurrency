const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction');

// we first set up a wallet class with he followinng variables
class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        //generates keys
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`

    }

    // we now want an input function for the user
    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    // we want to generate new transactions
    // and we want to know if the transaction already exists
    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);

        // we want to see if balance exceeds amount in wallet, if so we exit transaction
        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }
        // we now want to see if a transaction exists in pool by giving publickey address
        let transaction = transactionPool.existingTransaction(this.publicKey);

        if (transaction){
            transaction.update(this, recipient, amount);

        } else {
            //create transaction and add to pool
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);

        }
        return transaction;
    }
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
          transactions.push(transaction);
        }));
    
        const walletInputTs = transactions
          .filter(transaction => transaction.input.address === this.publicKey);
    
        let startTime = 0;
    
        if (walletInputTs.length > 0) {
          const recentInputT = walletInputTs.reduce(
            (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
          );
    
          balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
          startTime = recentInputT.input.timestamp;
        }
    
        transactions.forEach(transaction => {
          if (transaction.input.timestamp > startTime) {
            transaction.outputs.find(output => {
              if (output.address === this.publicKey) {
                balance += output.amount;
              }
            });
          }
        });
    
        return balance;
      }
    
      static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
      }
    }
    
    module.exports = Wallet;
    