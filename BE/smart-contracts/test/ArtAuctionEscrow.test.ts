import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArtAuctionEscrow", function () {
  let artAuction: any;
  let owner: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;

  const orderId = "ORDER_12345";
  const duration = 60 * 60; // 1 hour

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();
    const ArtAuctionEscrowFactory =
      await ethers.getContractFactory("ArtAuctionEscrow");
    artAuction = await ArtAuctionEscrowFactory.deploy();
  });

  describe("createAuction", function () {
    it("should initialize auction properly", async function () {
      await expect(
        artAuction.connect(seller).createAuction(orderId, duration),
      ).to.emit(artAuction, "AuctionStarted");

      const auction = await artAuction.auctions(orderId);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.state).to.equal(0); // State.Started
    });

    it("should revert if auction already exists", async function () {
      await artAuction.connect(seller).createAuction(orderId, duration);
      await expect(
        artAuction.connect(seller).createAuction(orderId, duration),
      ).to.be.revertedWith("Auction: Order ID already exists");
    });
  });

  describe("bid", function () {
    beforeEach(async function () {
      await artAuction.connect(seller).createAuction(orderId, duration);
    });

    it("should accept a new higher bid and emit event", async function () {
      const bidAmount = ethers.parseEther("1.0");

      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      )
        .to.emit(artAuction, "NewBid")
        .withArgs(orderId, bidder1.address, bidAmount);

      const auction = await artAuction.auctions(orderId);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("should fail if bid is lower than highest bid", async function () {
      const bidAmount1 = ethers.parseEther("2.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      const bidAmount2 = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 }),
      ).to.be.revertedWith("Auction: Bid too low");
    });

    it("should accurately track pending returns for outbid users", async function () {
      const bidAmount1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      const bidAmount2 = ethers.parseEther("2.0");
      await artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 });

      const pendingBalance = await artAuction.pendingReturns(bidder1.address);
      expect(pendingBalance).to.equal(bidAmount1);
    });

    it("should revert bid when auction already ended (TC-09)", async function () {
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);

      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWith("Auction: Already ended");
    });

    it("should revert bid when auction not in Started state (TC-10)", async function () {
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);
      await artAuction.endAuction(orderId);

      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWith("Auction: Not in Started state");
    });

    it("should allow sniping at the last second (TC-11)", async function () {
      const bidAmount1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      // Fast forward to exactly 5 seconds before end
      await ethers.provider.send("evm_increaseTime", [duration - 5]); // -5 + 1 sec execution time
      await ethers.provider.send("evm_mine", []);

      const bidAmount2 = ethers.parseEther("2.0");
      await expect(
        artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 }),
      ).to.emit(artAuction, "NewBid");

      const auction = await artAuction.auctions(orderId);
      expect(auction.highestBidder).to.equal(bidder2.address);
    });

    it("should revert if seller tries to self-bid (TC-12)", async function () {
      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(seller).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWith("Auction: Seller cannot bid");
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      await artAuction.connect(seller).createAuction(orderId, duration);

      // bidder1 outbid by bidder2
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("1.0") });
      await artAuction
        .connect(bidder2)
        .bid(orderId, { value: ethers.parseEther("2.0") });
    });

    it("should allow an outbid user to withdraw their funds", async function () {
      const initialBalance = await ethers.provider.getBalance(bidder1.address);

      const tx = await artAuction.connect(bidder1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);

      // Final balance should be (Initial + 1 ETH) - Gas
      const expectedBalance =
        initialBalance + ethers.parseEther("1.0") - BigInt(gasUsed);

      expect(finalBalance).to.equal(expectedBalance);
    });

    it("should revert withdraw if no funds exist (TC-14)", async function () {
      await expect(
        artAuction.connect(owner).withdraw(), // owner never bid
      ).to.be.revertedWith("Auction: No funds to withdraw");
    });

    it("should prevent re-entrancy attack on withdraw (TC-15)", async function () {
      const tx = await artAuction.connect(bidder1).withdraw();
      await tx.wait();

      const pendingBalance = await artAuction.pendingReturns(bidder1.address);
      expect(pendingBalance).to.equal(0);   
    });
  });

  describe("endAuction & confirmDelivery", function () {
    beforeEach(async function () {
      await artAuction.connect(seller).createAuction(orderId, duration);
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("3.0") });
    });

    it("should end auction securely after time expires", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);

      await expect(artAuction.endAuction(orderId))
        .to.emit(artAuction, "AuctionEnded")
        .withArgs(orderId, bidder1.address, ethers.parseEther("3.0"));

      const auction = await artAuction.auctions(orderId);
      expect(auction.state).to.equal(1); // State.Ended
    });

    it("should revert endAuction if time has not expired (TC-17)", async function () {
      await expect(artAuction.endAuction(orderId)).to.be.revertedWith(
        "Auction: Auction time has not expired",
      );
    });

    it("should revert endAuction for non-existent order (TC-18)", async function () {
      await expect(artAuction.endAuction("INVALID_ORDER")).to.be.revertedWith(
        "Auction: Order does not exist",
      );
    });

    it("should revert endAuction if already ended (TC-19)", async function () {
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);
      
      await artAuction.endAuction(orderId);

      // Call again
      await expect(artAuction.endAuction(orderId)).to.be.revertedWith(
        "Auction: Already ended or not started",
      );
    });

    it("should end auction even with no bids (TC-20)", async function () {
      const emptyOrderId = "EMPTY_ORDER";
      await artAuction.connect(seller).createAuction(emptyOrderId, duration);

      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);

      await expect(artAuction.endAuction(emptyOrderId))
        .to.emit(artAuction, "AuctionEnded")
        .withArgs(emptyOrderId, ethers.ZeroAddress, 0);

      const auction = await artAuction.auctions(emptyOrderId);
      expect(auction.state).to.equal(1); // Ended
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
    });

    it("should revert confirmDelivery if auction not ended", async function () {
      await expect(
        artAuction.connect(bidder1).confirmDelivery(orderId),
      ).to.be.revertedWith("Auction: Not in Ended state");
    });

    it("should confirm delivery, transfer funds, and complete state", async function () {
      // Simulate ended auction
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);
      await artAuction.endAuction(orderId);

      const initialSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );

      await expect(artAuction.connect(bidder1).confirmDelivery(orderId))
        .to.emit(artAuction, "DeliveryConfirmed")
        .withArgs(orderId, bidder1.address);

      const auction = await artAuction.auctions(orderId);
      expect(auction.state).to.equal(2); // State.Completed

      const finalSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );
      expect(finalSellerBalance).to.equal(
        initialSellerBalance + ethers.parseEther("3.0"),
      );
    });

    it("should only allow highest bidder to confirm delivery", async function () {
      await ethers.provider.send("evm_increaseTime", [duration + 10]);
      await ethers.provider.send("evm_mine", []);
      await artAuction.endAuction(orderId);

      await expect(
        artAuction.connect(owner).confirmDelivery(orderId),
      ).to.be.revertedWith("Auction: Only winner can confirm");
    });
  });
});
