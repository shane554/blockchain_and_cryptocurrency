// ties blockchain and transaction pool toghther

const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner{
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain ;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();

        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );

        // include a reward for the miner
         //create a block consisting of valid transactions
        const block = this.blockchain.addBlock(validTransactions);


       // synchronise chains in peer to peer serve
        this.p2pServer.syncChains();
       
        this.transactionPool.clear();

         //broadcast to everyminer to clear transaction pools
        this.p2pServer.broadcastClearTransactions();

        return block;

    }

  
}

module.exports = Miner;
