const Transaction = require('../wallet/transaction');

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);

    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;

      //if transaction does not exist in pool yet we an push
    } else {
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address) {
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions() {
      // this prevents people sending more currrency than is allowed
      // we want to look at certain parts of transaction
    return this.transactions.filter(transaction => {

      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      // if the transaction is not equal
      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.input.address}.`);
        return;
      }

      return transaction;
    });
  }

  // clear all objects from the pool
  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
