import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

describe("SimpleStorage", () => {
  it("stores and retrieves a value", async () => {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const contract = await viem.deployContract("SimpleStorage");

    // Initial value should be 0n (BigInt)
    assert.equal(await contract.read.get(), 0n);

    // Set value to 42 (note: BigInt 42n)
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
});
