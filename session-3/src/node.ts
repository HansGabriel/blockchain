// node.ts
import { Blockchain } from "./blockchain.js";
import { Block } from "./block.js";

export class Node {
  public blockchain: Blockchain;
  public peers: Node[] = [];

  constructor(public name: string, difficulty: number = 2) {
    this.blockchain = new Blockchain(difficulty);
    console.log(`🖥️  [${this.name}] Node created (difficulty: ${difficulty})`);
  }

  // Connect two nodes as peers (bidirectional)
  connectPeer(peer: Node): void {
    if (!this.peers.includes(peer)) {
      this.peers.push(peer);
      peer.peers.push(this);
      console.log(`🔗 [${this.name}] ↔ [${peer.name}] Connected`);
    }
  }

  // Disconnect from a specific peer
  disconnectPeer(peer: Node): void {
    this.peers = this.peers.filter((p) => p !== peer);
    peer.peers = peer.peers.filter((p) => p !== this);
    console.log(`✂️  [${this.name}] ✂ [${peer.name}] Disconnected`);
  }

  // Mine a new block and broadcast to peers
  mineBlock(data: string): void {
    console.log(`\n⛏️  [${this.name}] Mining: "${data}"`);
    const block = this.blockchain.addBlock(data);
    console.log(
      `✅ [${this.name}] Block #${block.index} mined! ` +
        `Hash: ${block.hash.substring(0, 12)}... Nonce: ${block.nonce}`
    );

    // Broadcast to all connected peers
    this.broadcast();
  }

  // Send our chain to all peers
  broadcast(): void {
    if (this.peers.length === 0) {
      console.log(`📡 [${this.name}] No peers to broadcast to`);
      return;
    }

    console.log(
      `📡 [${this.name}] Broadcasting chain ` +
        `(${this.blockchain.chain.length} blocks) to ${this.peers.length} peer(s)`
    );

    for (const peer of this.peers) {
      // Send a COPY of the chain (simulates network serialization)
      const chainCopy = this.blockchain.copyChain();
      const accepted = peer.receiveChain(chainCopy, this.name);

      if (accepted) {
        console.log(`   🔄 [${peer.name}] Accepted chain from [${this.name}]`);
      } else {
        console.log(
          `   ⏭️  [${peer.name}] Kept own chain (${peer.blockchain.chain.length} blocks)`
        );
      }
    }
  }

  // Receive a chain from a peer and decide whether to adopt it
  receiveChain(chain: Block[], fromName: string): boolean {
    console.log(
      `   📥 [${this.name}] Received chain from [${fromName}] ` +
        `(${chain.length} blocks vs my ${this.blockchain.chain.length})`
    );

    return this.blockchain.replaceChain(chain);
  }

  // Print this node's current blockchain status
  printStatus(): void {
    const valid = this.blockchain.isValid();
    console.log(
      `\n📊 [${this.name}] ` +
        `Chain: ${this.blockchain.chain.length} blocks | ` +
        `Valid: ${valid ? "✅" : "❌"} | ` +
        `Peers: ${this.peers.map((p) => p.name).join(", ") || "none"}`
    );
    for (const block of this.blockchain.chain) {
      console.log(
        `   #${block.index} | ${block.data.padEnd(30)} | ` +
          `Hash: ${block.hash.substring(0, 10)}... | ` +
          `Prev: ${block.previousHash.substring(0, 10)}...`
      );
    }
  }
}
