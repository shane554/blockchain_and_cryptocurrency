// imported functions
const ChainUtil = require('../chain-util');

const { DIFFICULTY, MINE_RATE } = require('../config');



// wecreate a new class
class Block{
    // constructor arguements ts, lh...
    constructor(timestamp, lastHash, hash, data, nonce, difficulty,) {
        // we want to bind to constructor
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
        
    }

    // we now add a tostring for debugging returns instance of class
    // substring returnes only first 10 characters of string
    toString() {
        return `Block -
        Timestamp:  ${this.timestamp}
        Last Hash:  ${this.lastHash.substring(0, 10)}  
        Hash:       ${this.hash.substring(0, 10)}
        nonce:      ${this.nonce}
        Difficulty: ${this.difficulty}
        Data:       ${this.data}
         `;
    }

    // we now want to add the genises block, static can be calles without creating new block instance
    static genesis() {
        return new this('Genesis time', '------', 'f1r57-h45h', [], 0, DIFFICULTY);
    }


    // new mine block  function
    static mineBlock(lastBlock, data) {
    
        let hash, timestamp;
        //we now want varaibles   
        const lastHash = lastBlock.hash;
        // we want to access the difficulty
        let { difficulty } = lastBlock;
        let nonce = 0;

        // we want a while loop to make sure genisis block has correct number of 0's
        do {
            nonce++;
            timestamp = Date.now();
            //we want to calculate difficulty after each mined block
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        }
        // makes sure do wile runs unless has correct leading zeros and access previous difficulty defined locally
           while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);

    }
    
    // we now add new static hash function
    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    // we want to manke a block hash function wit parameter block
    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);

    }

    static adjustDifficulty(lastBlock, currentTime) {
        // as we want difficulty raised or lowered dependinng on users
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;
    }

}

// we want this file shared so it can be included with other files
module.exports = Block;