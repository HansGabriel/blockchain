import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  // Deploy so we always have a contract on this run’s network
  const contract = await viem.deployContract("SimpleStorage");
  console.log("Deployed SimpleStorage at:", contract.address);

  // Read — free, instant
  const initial = await contract.read.get();
  console.log("Initial value:", initial.toString());

  // Write — transaction, costs gas
  const txHash = await contract.write.set([42n]);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log("Tx hash:", txHash);

  // Read again
  const updated = await contract.read.get();
  console.log("Updated value:", updated.toString());
}

main().catch(console.error);
