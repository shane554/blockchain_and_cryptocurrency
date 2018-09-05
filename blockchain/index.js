const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const block = Block.mineBlock(this.chain[this.chain.length-1], data);
        this.chain.push(block);

        return block;
    }

    // we want to make sure the chain is valid
    isValidChain(chain){
        // we cannot compare 2 of the same objects so we compare a string
        if(JSON.stringify(chain[0]) != JSON.stringify(Block.genesis()))
            return false;

        // we now run validations on every other block after genesis block
        for(let i=1; i<chain.length; i++) { 
            const block = chain[i];
            const lastBlock = chain[i-1];

            if (block.lastHash !== lastBlock.hash  
                || block.hash !== Block.blockHash(block))  {
                return false;
            }
        }
            return true;
    }

    // we now want to replace chain with new chain 
    replaceChain(newChain) {
        //we need to chk the length of the chain
        if (newChain.length <= this.chain.length) {

            console.log('Recieved chain is not longer than current chain');
            return;
        }  

            else if (!this.isValidChain(newChain)) {
                console.log('The recieved chaiin is not valid.');
                return;

            }

        console.log('Replacing blockchain with new chain.')
        this.chain = newChain;
    }
}

module.exports = Blockchain;