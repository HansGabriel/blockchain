import * as crypto from "crypto";
import { Transaction } from "./transaction";
import { Chain } from "./chain";

export class Wallet {
  public publicKey: string;
  public privateKey: string;
  constructor() {
    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }
  // Sign a transaction
  sign(transaction: Transaction): Buffer {
    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString());
    return sign.sign(this.privateKey);
  }
  // Send money with signature
  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(this.publicKey, payeePublicKey, amount);
    // Sign the transaction
    const signature = this.sign(transaction);
    // Add to blockchain with signature
    const success = Chain.instance.addBlock(
      transaction,
      this.publicKey,
      signature
    );
    if (!success) {
      console.log("⚠️  Transaction failed!");
    }
  }
}
