import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("SimpleStorage", () => {
  it("stores and retrieves a value", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const contract = await viem.deployContract("SimpleStorage");

    assert.equal(await contract.read.get(), 0n);

    const txHash = await contract.write.set([42n]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    assert.equal(await contract.read.get(), 42n);
  });

  it("emits ValueChanged event", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const contract = await viem.deployContract("SimpleStorage");

    const txHash = await contract.write.set([99n]);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    assert.equal(receipt.status, "success");
    assert.ok(
      receipt.logs.length > 0,
      "Expected ValueChanged event to be emitted"
    );
  });

  it("getHistory returns all values ever set", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const contract = await viem.deployContract("SimpleStorage");
    const read = contract.read as unknown as { getHistory: () => Promise<readonly bigint[]> };

    assert.deepEqual(await read.getHistory(), []);

    let txHash = await contract.write.set([10n]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    txHash = await contract.write.set([20n]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    txHash = await contract.write.set([30n]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const history = await read.getHistory();
    assert.equal(history.length, 3);
    assert.equal(history[0], 10n);
    assert.equal(history[1], 20n);
    assert.equal(history[2], 30n);
  });
});

describe("SimpleStorage - Access Control", () => {
  it("owner can set a value", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const contract = await viem.deployContract("SimpleStorage");

    const txHash = await contract.write.set([42n]);
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    assert.equal(await contract.read.get(), 42n);
  });

  it("non-owner cannot set a value", async () => {
    const { viem } = await network.connect();
    const walletClients = await viem.getWalletClients();
    const nonOwner = walletClients[1];
    const contract = await viem.deployContract("SimpleStorage");

    await assert.rejects(
      async () => contract.write.set([99n], { account: nonOwner.account }),
      /Not the owner/
    );
  });

  it("getOwner returns the deployer", async () => {
    const { viem } = await network.connect();
    const walletClients = await viem.getWalletClients();
    const owner = walletClients[0];
    const contract = await viem.deployContract("SimpleStorage");
    const read = contract.read as unknown as { getOwner: () => Promise<`0x${string}`> };

    const ownerAddress = await read.getOwner();
    assert.equal(
      ownerAddress.toLowerCase(),
      owner.account.address.toLowerCase()
    );
  });
});
