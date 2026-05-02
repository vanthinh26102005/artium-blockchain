import { ethers } from "hardhat";

async function main() {
  // Lấy danh sách các tài khoản (accounts) có sẵn trên local network (Hardhat network)
  // Hardhat cung cấp sẵn 20 accounts với 10000 ETH ảo mỗi account để test
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const user1 = signers[1];
  const user2 = signers[2];

  console.log("==========================================");
  console.log("🚀 Bắt đầu deploy contract lên LOCAL NETWORK");
  console.log("==========================================");
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Lấy và in ra số dư của người deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const arbiter = deployer.address;
  const platformWallet = signers[1]?.address ?? deployer.address;
  const feeBps = 250;

  console.log("\n⏳ Đang deploy ArtAuctionEscrow...");
  const artAuctionEscrow = await ethers.deployContract("ArtAuctionEscrow", [
    arbiter,
    platformWallet,
    feeBps,
  ]);
  await artAuctionEscrow.waitForDeployment();

  const contractAddress = await artAuctionEscrow.getAddress();
  console.log("✅ ArtAuctionEscrow đã được deploy thành công tại địa chỉ:", contractAddress);
  
  console.log("\n==========================================");
  console.log("📍 THÔNG TIN ĐỂ CHẠY LOCAL TEST:");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer (Admin):", deployer.address);
  console.log("Test User 1     :", user1.address);
  console.log("Test User 2     :", user2.address);
  console.log("==========================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
