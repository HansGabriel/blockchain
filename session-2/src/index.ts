import { Wallet } from "./wallet";
import { Chain } from "./chain";
import { Transaction } from "./transaction";

// Create wallets
const satoshi = new Wallet();
const alice = new Wallet();
const bob = new Wallet();
// Genesis: give 100 coins to Satoshi (must run before any transactions)
Chain.instance.init(satoshi.publicKey);

console.log("\n🔐 SECURE BLOCKCHAIN WITH DIGITAL SIGNATURES\n");
// Initial distribution
console.log("💸 Initial Distribution");
satoshi.sendMoney(50, alice.publicKey);
satoshi.sendMoney(30, bob.publicKey);
// Check balances
console.log("\n👛 Balances After Distribution:");
console.log(`  Satoshi: ${Chain.instance.getBalance(satoshi.publicKey)} coins`);
console.log(`  Alice: ${Chain.instance.getBalance(alice.publicKey)} coins`);
console.log(`  Bob: ${Chain.instance.getBalance(bob.publicKey)} coins`);
// Alice sends to Bob (legitimate transaction)
console.log("\n💸 Alice sends 20 to Bob (signed by Alice)");
alice.sendMoney(20, bob.publicKey);
// Try to forge a transaction (will fail!)
console.log("\n🚨 Bob tries to forge a transaction from Alice");
const fakeTransaction = new Transaction(
  alice.publicKey, // Claims to be from Alice
  bob.publicKey, // To Bob
  1000 // Huge amount
);
// Bob signs with HIS key (not Alice's)
const bobSignature = bob.sign(fakeTransaction);
// Try to add forged transaction
console.log("Attempting to add forged transaction...");
Chain.instance.addBlock(fakeTransaction, alice.publicKey, bobSignature);
// ❌ This will fail! Bob's signature doesn't match Alice's public key
// Try insufficient balance
console.log("\n🚨 Alice tries to spend more than she has");
alice.sendMoney(500, bob.publicKey); // Alice only has 30 coins
// ❌ This will fail! Insufficient balance
// Final balances
console.log("\n👛 Final Balances:");
console.log(`  Satoshi: ${Chain.instance.getBalance(satoshi.publicKey)} coins`);
console.log(`  Alice: ${Chain.instance.getBalance(alice.publicKey)} coins`);
console.log(`  Bob: ${Chain.instance.getBalance(bob.publicKey)} coins`);
// Print blockchain
Chain.instance.printChain();
console.log("\n✅ BLOCKCHAIN IS NOW SECURE!");
console.log(
  "  - Only wallet owners can spend their coins (signature validation)"
);
console.log("  - Cannot spend more than you have (balance validation)");
console.log("  - Every transaction is cryptographically verified\n");
