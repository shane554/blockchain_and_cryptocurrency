const express = require ('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
// we want new instance of transaction pool
const TransactionPool = require('../wallet/transaction-pool');

const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;


//this creates express functionality
const app = express();
//new blockchain instance
const bc = new Blockchain();

const wallet = new Wallet();

const tp = new TransactionPool();

const p2pServer = new P2pServer(bc, tp);

const miner =  new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.json())


// we want to return blocks  of current blockchainto app with get functon  res = response
app.get('/blocks', (req, res) => {
    res.json(bc.chain);

});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    // we want to update blockchain when new block mined
    p2pServer.syncChains();

    // we want to respond of updated chain, block endpoint i string which we have already
    res.redirect('/blocks');


});

// we want to get transactions
app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

// we want to be able to create transaction with users wallet
app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    // this will vreate transaction with following parameters
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);

    // transactions will be broadcast and added to pools
    p2pServer.broadcastTransaction(transaction);
    // we want to redirect to transaction endpoint so they can see it
    res.redirect('/transactions');
});

app.get('/mine-transactions', (req, res) => {
    const block =  miner.mine();
    console.log(`New Block Added: ${block.toString()}`);
    res.redirect('/blocks');
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });

});

// we need to make sure the server is running
app.listen(HTTP_PORT, () => 
console.log(`Listening on port ${HTTP_PORT}`));

// this will start the server
p2pServer.listen();

