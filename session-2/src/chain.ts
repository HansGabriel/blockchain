import * as crypto from "crypto";
import { Block } from "./block";
import { Transaction } from "./transaction";

export class Chain {
  public static instance = new Chain();
  chain: Block[];
  constructor() {
    this.chain = [];
  }
  // Call after creating the founder wallet so genesis credits them with 100 coins
  init(founderPublicKey: string): void {
    if (this.chain.length === 0) {
      this.chain = [
        new Block("", new Transaction("genesis", founderPublicKey, 100)),
      ];
    }
  }
  get lastBlock(): Block {
    return this.chain[this.chain.length - 1] as Block;
  }
  mine(nonce: number) {
    let solution = 1;
    console.log("⛏️  Mining...");
    while (true) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + solution).toString()).end();
      const attempt = hash.digest("hex");
      if (attempt.substr(0, 4) === "0000") {
        console.log(`✅ Solved: ${solution}`);
        return solution;
      }
      solution += 1;
    }
  }
  // Calculate balance for a given address
  getBalance(publicKey: string): number {
    let balance = 0;
    this.chain.forEach((block) => {
      if (block.transaction.payer === publicKey) {
        balance -= block.transaction.amount;
      }
      if (block.transaction.payee === publicKey) {
        balance += block.transaction.amount;
      }
    });
    return balance;
  }
  // Verify signature
  verifySignature(
    transaction: Transaction,
    signature: Buffer,
    publicKey: string
  ): boolean {
    const verify = crypto.createVerify("SHA256");
    verify.update(transaction.toString());
    return verify.verify(publicKey, signature);
  }
  // Add block with validation
  addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ): boolean {
    // 1. Verify signature
    const isValidSignature = this.verifySignature(
      transaction,
      signature,
      senderPublicKey
    );
    if (!isValidSignature) {
      console.log("❌ Invalid signature! Transaction rejected.");
      return false;
    }
    // 2. Check balance (skip for genesis)
    if (senderPublicKey !== "genesis") {
      const balance = this.getBalance(senderPublicKey);
      if (balance < transaction.amount) {
        console.log("❌ Insufficient balance! Transaction rejected.");
        return false;
      }
    }
    // 3. Mine and add block
    const newBlock = new Block(this.lastBlock.hash, transaction);
    this.mine(newBlock.nonce);
    this.chain.push(newBlock);
    console.log("✅ Transaction added to blockchain");
    return true;
  }
  // Pretty print blockchain
  printChain() {
    console.log("\n📦 BLOCKCHAIN\n");
    this.chain.forEach((block, index) => {
      console.log(`Block #${index}`);
      console.log(`  Timestamp: ${new Date(block.ts).toLocaleString()}`);
      console.log(`  Previous Hash: ${block.prevHash.substring(0, 10)}...`);
      console.log(`  Hash: ${block.hash.substring(0, 10)}...`);
      console.log(`  Transaction:`);
      console.log(
        `    From: ${
          block.transaction.payer === "genesis"
            ? "genesis"
            : block.transaction.payer.substring(0, 20) + "..."
        }`
      );
      console.log(
        `    To: ${
          block.transaction.payer === "genesis"
            ? "genesis..."
            : block.transaction.payee.substring(0, 20) + "..."
        }`
      );
      console.log(`    Amount: ${block.transaction.amount}`);
      console.log(`  Nonce: ${block.nonce}`);
      console.log("");
    });
  }
}
