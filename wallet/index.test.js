const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const  Blockchain = require('../blockchain');
const {INITIAL_BALANCE } = require('../config');
describe('Wallet', () => {
    let wallet, tp;

    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();

    });

    describe('creating a transaction', () => {
        let transaction, sendAmount, recipient;

        beforeEach(() => {
            sendAmount = 50;
            recipient = '4and0m-4ddr355';
            transaction  = wallet.createTransaction(recipient, sendAmount, bc, tp)
        });

        describe('and doing the same transaction', () =>  {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, bc, tp)

            });
            // we want to double send amount if transaction is done twice
            it('doubles the  `sendAmount` subtracted from the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - sendAmount *2);
            });

            it('clones the `sendAmount` output for the recipient', () => {
                expect(transaction.outputs.filter(output => output.address === recipient)
                .map(output => output.amount))
                .toEqual([sendAmount, sendAmount]);
            });
        });
    });
    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;

            for (let i=0; i<repeatAdd; i++){
            senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
            }

            bc.addBlock(tp.transactions);
        });

        it('calculatesthe balance for the blockchain transaction matching the recipient', () => {
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it('calculatesthe balance for the blockchain transaction matching thre sender', () => {
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));


    });

    describe('and the recipient conducts a transaction', () =>  {
        let subtractBalance, recipientBalance;

        beforeEach(() => {
            tp.clear();
            subtractBalance = 60;
            recipientBalance = wallet.calculateBalance(bc);
            wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp )
            bc.addBlock(tp.transactions);
        });

    describe('and the sender sends another transaction to thre recipient', () => {
        beforeEach(() => {
            tp.clear();
            senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp )
            bc.addBlock(tp.transactions);

        });

        it('calculate the recipient balance only using transactions since it most recent one', () => {
            expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
        });
    });
    });
});
});