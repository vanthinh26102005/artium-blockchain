import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ArtAuctionEscrow
  const artAuctionEscrow = await ethers.deployContract("ArtAuctionEscrow");
  await artAuctionEscrow.waitForDeployment();

  console.log("ArtAuctionEscrow deployed to:", await artAuctionEscrow.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
