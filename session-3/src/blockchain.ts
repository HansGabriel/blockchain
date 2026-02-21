// blockchain.ts
import { Block } from "./block.js";

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor(difficulty: number = 2) {
    this.difficulty = difficulty;
    this.chain = [this.createGenesis()];
  }

  private createGenesis(): Block {
    const genesis = new Block(0, Date.now(), "Genesis Block", "0");
    genesis.mine(this.difficulty);
    return genesis;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: string): Block {
    const block = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    block.mine(this.difficulty);
    this.chain.push(block);
    return block;
  }

  // Validate our own chain
  isValid(): boolean {
    return Blockchain.isValidChain(this.chain, this.difficulty);
  }

  // 🆕 Static: validate ANY chain (used for chains received from peers)
  static isValidChain(chain: Block[], difficulty: number): boolean {
    const target = "0".repeat(difficulty);

    for (let i = 1; i < chain.length; i++) {
      const current = chain[i];
      const previous = chain[i - 1];

      // Check 1: Hash integrity
      if (current.hash !== current.computeHash()) {
        return false;
      }

      // Check 2: Chain linkage
      if (current.previousHash !== previous.hash) {
        return false;
      }

      // Check 3: Difficulty met
      if (current.hash.substring(0, difficulty) !== target) {
        return false;
      }
    }

    return true;
  }

  // 🆕 Replace chain if received one is longer AND valid
  replaceChain(newChain: Block[]): boolean {
    // Rule 1: Must be longer
    if (newChain.length <= this.chain.length) {
      return false;
    }

    // Rule 2: Must be valid
    if (!Blockchain.isValidChain(newChain, this.difficulty)) {
      return false;
    }

    // Accept the longer valid chain
    this.chain = newChain;
    return true;
  }

  // 🆕 Create a deep copy of the chain (simulate sending over network)
  copyChain(): Block[] {
    return this.chain.map((b) => {
      const copy = new Block(b.index, b.timestamp, b.data, b.previousHash);
      copy.nonce = b.nonce;
      copy.hash = b.hash;
      return copy;
    });
  }
}
