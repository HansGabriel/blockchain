// block.ts
import crypto from "crypto";

export class Block {
  public hash: string;
  public nonce: number = 0;

  constructor(
    public index: number,
    public timestamp: number,
    public data: string,
    public previousHash: string = ""
  ) {
    this.hash = this.computeHash();
  }

  computeHash(): string {
    return crypto
      .createHash("sha256")
      .update(
        this.index + this.previousHash + this.timestamp + this.data + this.nonce
      )
      .digest("hex");
  }

  mine(difficulty: number): void {
    const target = "0".repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.computeHash();
    }
  }
}
