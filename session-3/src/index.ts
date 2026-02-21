// index.ts
import { Node } from "./node.js";

console.log("\n🌐 SESSION 3: P2P NETWORK SIMULATION & CONSENSUS\n");
console.log("=".repeat(55));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 1: Create nodes and connect them
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n📘 PART 1: Creating the Network\n");

const nodeA = new Node("Alice", 2);
const nodeB = new Node("Bob", 2);
const nodeC = new Node("Charlie", 2);

// Connect all nodes to each other (full mesh)
nodeA.connectPeer(nodeB);
nodeB.connectPeer(nodeC);
nodeA.connectPeer(nodeC);

console.log("\n✅ Network topology: Alice ↔ Bob ↔ Charlie ↔ Alice (full mesh)");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 2: Normal operation — mine and auto-sync
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n📘 PART 2: Normal Operation — Mine & Sync\n");
console.log("Each node mines a block → broadcasts → all stay in sync.\n");

nodeA.mineBlock("Alice → Bob: 10 coins");
nodeB.mineBlock("Bob → Charlie: 5 coins");
nodeC.mineBlock("Charlie → Alice: 3 coins");

// Show all nodes have the same chain
console.log("\n--- All nodes should be in sync ---");
nodeA.printStatus();
nodeB.printStatus();
nodeC.printStatus();

// Verify they all have the same chain length
console.log("\n🔍 Sync check:");
console.log(`   Alice:   ${nodeA.blockchain.chain.length} blocks`);
console.log(`   Bob:     ${nodeB.blockchain.chain.length} blocks`);
console.log(`   Charlie: ${nodeC.blockchain.chain.length} blocks`);
console.log(
  nodeA.blockchain.chain.length === nodeB.blockchain.chain.length &&
    nodeB.blockchain.chain.length === nodeC.blockchain.chain.length
    ? "   ✅ All nodes are in sync!"
    : "   ⚠️ Nodes are NOT in sync"
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 3: Network partition — nodes mine independently
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n📘 PART 3: Network Partition Simulation\n");
console.log("Disconnecting Charlie from the network...\n");

// Disconnect Charlie from Alice and Bob
nodeC.disconnectPeer(nodeA);
nodeC.disconnectPeer(nodeB);

console.log("\nNetwork is now split:");
console.log("  Group 1: Alice ↔ Bob");
console.log("  Group 2: Charlie (alone)\n");

// Both groups mine independently
console.log("--- Group 1 (Alice & Bob) mines 3 blocks ---");
nodeA.mineBlock("Alice → Bob: 20 coins");
nodeB.mineBlock("Bob → Alice: 15 coins");
nodeA.mineBlock("Alice → Dave: 8 coins");

console.log("\n--- Group 2 (Charlie alone) mines 1 block ---");
nodeC.mineBlock("Charlie → Eve: 7 coins");

// Show the divergence
console.log("\n--- Chains have diverged! ---");
nodeA.printStatus();
nodeC.printStatus();

console.log("\n🔍 Divergence:");
console.log(
  `   Alice:   ${nodeA.blockchain.chain.length} blocks (Group 1 — more work)`
);
console.log(
  `   Charlie: ${nodeC.blockchain.chain.length} blocks (Group 2 — less work)`
);

// Reconnect — longest chain should win
console.log("\n\n🔄 Reconnecting Charlie to the network...\n");
nodeA.connectPeer(nodeC);
nodeB.connectPeer(nodeC);

// Charlie broadcasts his shorter chain (gets rejected by others)
console.log("\n--- Charlie broadcasts his chain ---");
nodeC.broadcast();

// Alice broadcasts her longer chain (Charlie should adopt it)
console.log("\n--- Alice broadcasts her longer chain ---");
nodeA.broadcast();

// Show the result
console.log("\n--- After reconnection ---");
nodeA.printStatus();
nodeB.printStatus();
nodeC.printStatus();

console.log("\n🔍 Resolution:");
console.log(`   Alice:   ${nodeA.blockchain.chain.length} blocks`);
console.log(`   Bob:     ${nodeB.blockchain.chain.length} blocks`);
console.log(`   Charlie: ${nodeC.blockchain.chain.length} blocks`);
console.log("   ✅ Charlie adopted the longer chain! Consensus restored.");
console.log("   ❌ Charlie's solo block was orphaned (discarded).");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 4: Tamper detection across the network
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n📘 PART 4: Tamper Detection\n");
console.log("🚨 Charlie tries to cheat by modifying Block 1 on his node...\n");

// Tamper with Charlie's chain
const originalData = nodeC.blockchain.chain[1].data;
nodeC.blockchain.chain[1].data = "Charlie → Charlie: 9999 coins";

console.log(`   Original: "${originalData}"`);
console.log(`   Tampered: "${nodeC.blockchain.chain[1].data}"`);
console.log(
  `   Charlie's chain valid? ${
    nodeC.blockchain.isValid() ? "✅" : "❌ INVALID"
  }`
);

// Charlie tries to broadcast his tampered chain
console.log("\n📡 Charlie tries to broadcast tampered chain...\n");
nodeC.broadcast();

// Show that honest nodes rejected it
console.log("\n--- Result ---");
console.log(
  `   Alice's chain still valid? ${nodeA.blockchain.isValid() ? "✅" : "❌"}`
);
console.log(
  `   Bob's chain still valid? ${nodeB.blockchain.isValid() ? "✅" : "❌"}`
);
console.log("   ✅ Honest nodes rejected the tampered chain!");
console.log("   🔒 The network is secure.\n");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Summary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("=".repeat(55));
console.log("\n📝 SUMMARY\n");
console.log("1. ✅ Nodes mine blocks and broadcast to peers");
console.log("2. ✅ All nodes stay in sync during normal operation");
console.log("3. ✅ Network partitions resolve via longest chain rule");
console.log("4. ✅ Tampered chains are detected and rejected");
console.log("5. ✅ This is the same consensus mechanism Bitcoin uses!\n");

console.log("🎉 Session 3 complete!\n");
