import * as crypto from "crypto";

class Block {
  constructor(
    public readonly blockNumber: number,
    public readonly timestamp: number,
    public readonly data: string,
    public readonly previousHash: string,
    public nonce: number,
    public readonly hash: string
  ) {}

  static computeHash(
    blockNumber: number,
    timestamp: number,
    data: string,
    previousHash: string,
    nonce: number
  ): string {
    const input = `${blockNumber}${timestamp}${data}${previousHash}${nonce}`;
    return crypto.createHash("sha256").update(input).digest("hex");
  }

  static create(
    blockNumber: number,
    data: string,
    previousHash: string,
    nonce: number
  ): Block {
    const timestamp = Date.now();
    const hash = this.computeHash(
      blockNumber,
      timestamp,
      data,
      previousHash,
      nonce
    );
    return new Block(blockNumber, timestamp, data, previousHash, nonce, hash);
  }

  static mine(
    blockNumber: number,
    data: string,
    previousHash: string,
    difficulty: number
  ): Block {
    const prefix = "0".repeat(difficulty);
    let nonce = 0;

    while (true) {
      const block = Block.create(blockNumber, data, previousHash, nonce);
      if (block.hash.startsWith(prefix)) {
        return block;
      }
      nonce++;
    }
  }
}

class Blockchain {
  public readonly chain: Block[] = [];
  public readonly difficulty: number;

  constructor(difficulty: number = 2) {
    this.difficulty = difficulty;
    this.chain.push(this.createGenesisBlock());
  }

  private createGenesisBlock(): Block {
    return Block.create(0, "Genesis Block", "0", 0);
  }

  getLatestBlock(): Block {
    const last = this.chain[this.chain.length - 1];
    if (!last) throw new Error("Chain is empty");
    return last;
  }

  addBlock(data: string): Block {
    const latest = this.getLatestBlock();
    const newBlock = Block.mine(
      latest.blockNumber + 1,
      data,
      latest.hash,
      this.difficulty
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  isValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (!current || !previous) continue;

      const expectedHash = Block.computeHash(
        current.blockNumber,
        current.timestamp,
        current.data,
        current.previousHash,
        current.nonce
      );

      if (current.hash !== expectedHash) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

const chain = new Blockchain(2);

console.log("Genesis block:", chain.chain[0]);
chain.addBlock("Alice sends 10 to Bob");
chain.addBlock("Bob sends 5 to Carol");

console.log("\nBlockchain length:", chain.chain.length);
console.log("Chain valid?", chain.isValid());
console.log("\nFull chain:");
chain.chain.forEach((block) => {
  console.log({
    blockNumber: block.blockNumber,
    data: block.data,
    nonce: block.nonce,
    hash: block.hash,
    previousHash: block.previousHash,
  });
});
