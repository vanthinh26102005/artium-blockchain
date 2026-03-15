import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("==========================================");
  console.log("Deploying ArtAuctionEscrow to:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("==========================================");

  const contract = await ethers.deployContract("ArtAuctionEscrow");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const receipt = await deployTx!.wait();

  const chainId = (await ethers.provider.getNetwork()).chainId;
  const blockNumber = receipt!.blockNumber;
  const explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

  console.log("\n✅ Contract deployed!");
  console.log("Address:     ", contractAddress);
  console.log("Network:     ", network.name);
  console.log("Chain ID:    ", chainId.toString());
  console.log("Block:       ", blockNumber);
  console.log("Explorer:    ", explorerUrl);

  // Save deployment metadata
  const deploymentInfo = {
    contractName: "ArtAuctionEscrow",
    address: contractAddress,
    network: network.name,
    chainId: chainId.toString(),
    blockNumber,
    explorerUrl,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployments/${network.name}.json`);

  // Optional: Etherscan verification
  // Requires ETHERSCAN_API_KEY in .env
  // ArtAuctionEscrow has no constructor arguments, so args array is empty
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nWaiting 5 blocks before verification...");
    await new Promise((r) => setTimeout(r, 60_000)); // ~60s for blocks to index
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (e: any) {
      if (e.message?.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.error("Verification failed:", e.message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});