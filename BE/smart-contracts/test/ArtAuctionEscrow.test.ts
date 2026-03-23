import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArtAuctionEscrow", function () {
  let artAuction: any;
  let owner: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;
  let arbiter: any;
  let platformWallet: any;

  const orderId = "ORDER_12345";
  const duration = 60 * 60; // 1 hour
  const reservePrice = ethers.parseEther("0.5");
  const minBidIncrement = ethers.parseEther("0.1");
  const ipfsHash = "QmTestHash123";
  const platformFeeBps = 250n; // 2.5%

  async function createDefaultAuction(signer: any, id: string = orderId) {
    return artAuction
      .connect(signer)
      .createAuction(id, duration, reservePrice, minBidIncrement, ipfsHash);
  }

  async function fastForwardPastAuction() {
    await ethers.provider.send("evm_increaseTime", [duration + 10]);
    await ethers.provider.send("evm_mine", []);
  }

  async function endAndShip(id: string = orderId) {
    await artAuction.connect(seller).endAuction(id);
    await artAuction.connect(seller).markShipped(id, "QmTrackingHash");
  }

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, arbiter, platformWallet] =
      await ethers.getSigners();
    const ArtAuctionEscrowFactory =
      await ethers.getContractFactory("ArtAuctionEscrow");
    artAuction = await ArtAuctionEscrowFactory.deploy(
      arbiter.address,
      platformWallet.address,
      platformFeeBps,
    );
  });

  describe("createAuction", function () {
    it("should initialize auction properly", async function () {
      await expect(createDefaultAuction(seller)).to.emit(
        artAuction,
        "AuctionStarted",
      );

      const auction = await artAuction.getAuction(orderId);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.state).to.equal(0); // State.Started
    });

    it("should revert if auction already exists", async function () {
      await createDefaultAuction(seller);
      await expect(createDefaultAuction(seller))
        .to.be.revertedWithCustomError(artAuction, "AuctionAlreadyExists")
        .withArgs(orderId);
    });
  });

  describe("bid", function () {
    beforeEach(async function () {
      await createDefaultAuction(seller);
    });

    it("should accept a new higher bid and emit event", async function () {
      const bidAmount = ethers.parseEther("1.0");

      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      )
        .to.emit(artAuction, "NewBid")
        .withArgs(orderId, bidder1.address, bidAmount);

      const auction = await artAuction.getAuction(orderId);
      expect(auction.highestBidder).to.equal(bidder1.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("should fail if bid increment is too low", async function () {
      const bidAmount1 = ethers.parseEther("2.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      const bidAmount2 = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 }),
      ).to.be.revertedWithCustomError(artAuction, "BidIncrementTooLow");
    });

    it("should accurately track pending returns for outbid users", async function () {
      const bidAmount1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      const bidAmount2 = ethers.parseEther("2.0");
      await artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 });

      const pendingBalance = await artAuction.pendingReturns(bidder1.address);
      expect(pendingBalance).to.equal(bidAmount1);
    });

    it("should revert bid when auction time has expired", async function () {
      await fastForwardPastAuction();

      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotExpired");
    });

    it("should revert bid when auction not in Started state", async function () {
      await fastForwardPastAuction();
      await artAuction.connect(seller).endAuction(orderId);

      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });

    it("should extend auction via anti-snipe when bid is placed near end", async function () {
      const bidAmount1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(orderId, { value: bidAmount1 });

      await ethers.provider.send("evm_increaseTime", [duration - 5]);
      await ethers.provider.send("evm_mine", []);

      const bidAmount2 = ethers.parseEther("2.0");
      await expect(
        artAuction.connect(bidder2).bid(orderId, { value: bidAmount2 }),
      )
        .to.emit(artAuction, "AuctionExtended")
        .and.to.emit(artAuction, "NewBid");

      const auction = await artAuction.getAuction(orderId);
      expect(auction.highestBidder).to.equal(bidder2.address);
    });

    it("should revert if seller tries to self-bid", async function () {
      const bidAmount = ethers.parseEther("1.0");
      await expect(
        artAuction.connect(seller).bid(orderId, { value: bidAmount }),
      ).to.be.revertedWithCustomError(artAuction, "SellerCannotBid");
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      await createDefaultAuction(seller);

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
      const expectedBalance =
        initialBalance + ethers.parseEther("1.0") - BigInt(gasUsed);

      expect(finalBalance).to.equal(expectedBalance);
    });

    it("should revert withdraw if no funds exist", async function () {
      await expect(
        artAuction.connect(owner).withdraw(),
      ).to.be.revertedWithCustomError(artAuction, "NoFundsToWithdraw");
    });

    it("should prevent re-entrancy by zeroing balance before transfer", async function () {
      const tx = await artAuction.connect(bidder1).withdraw();
      await tx.wait();

      const pendingBalance = await artAuction.pendingReturns(bidder1.address);
      expect(pendingBalance).to.equal(0);
    });
  });

  describe("endAuction", function () {
    it("should end auction with reserve met and emit AuctionEnded", async function () {
      await createDefaultAuction(seller);
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("3.0") });

      await fastForwardPastAuction();

      await expect(artAuction.connect(seller).endAuction(orderId))
        .to.emit(artAuction, "AuctionEnded")
        .withArgs(orderId, bidder1.address, ethers.parseEther("3.0"));

      const auction = await artAuction.getAuction(orderId);
      expect(auction.state).to.equal(1); // State.Ended
    });

    it("should cancel auction when reserve price is not met", async function () {
      await createDefaultAuction(seller);
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("0.1") });

      await fastForwardPastAuction();

      await expect(artAuction.connect(seller).endAuction(orderId))
        .to.emit(artAuction, "AuctionCancelled")
        .withArgs(orderId, "Reserve price not met");

      const auction = await artAuction.getAuction(orderId);
      expect(auction.state).to.equal(5); // State.Cancelled

      const pendingBalance = await artAuction.pendingReturns(bidder1.address);
      expect(pendingBalance).to.equal(ethers.parseEther("0.1"));
    });

    it("should revert endAuction if time has not expired", async function () {
      await createDefaultAuction(seller);
      await expect(
        artAuction.connect(seller).endAuction(orderId),
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotExpired");
    });

    it("should revert endAuction for non-existent order", async function () {
      await expect(
        artAuction.connect(seller).endAuction("INVALID_ORDER"),
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotFound");
    });

    it("should revert endAuction if already ended", async function () {
      await createDefaultAuction(seller);
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("3.0") });

      await fastForwardPastAuction();
      await artAuction.connect(seller).endAuction(orderId);

      await expect(
        artAuction.connect(seller).endAuction(orderId),
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });

    it("should cancel auction with no bids since reserve is not met", async function () {
      const emptyOrderId = "EMPTY_ORDER";
      await createDefaultAuction(seller, emptyOrderId);

      await fastForwardPastAuction();

      await expect(artAuction.connect(seller).endAuction(emptyOrderId))
        .to.emit(artAuction, "AuctionCancelled")
        .withArgs(emptyOrderId, "Reserve price not met");

      const auction = await artAuction.getAuction(emptyOrderId);
      expect(auction.state).to.equal(5); // State.Cancelled
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
    });
  });

  describe("confirmDelivery", function () {
    beforeEach(async function () {
      await createDefaultAuction(seller);
      await artAuction
        .connect(bidder1)
        .bid(orderId, { value: ethers.parseEther("3.0") });

      await fastForwardPastAuction();
    });

    it("should revert confirmDelivery if auction is not in Shipped state", async function () {
      await expect(
        artAuction.connect(bidder1).confirmDelivery(orderId),
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });

    it("should confirm delivery, deduct platform fee, and transfer funds to seller", async function () {
      await endAndShip();

      const initialSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );
      const initialPlatformBalance = await ethers.provider.getBalance(
        platformWallet.address,
      );

      await expect(artAuction.connect(bidder1).confirmDelivery(orderId))
        .to.emit(artAuction, "DeliveryConfirmed")
        .withArgs(orderId, bidder1.address);

      const auction = await artAuction.getAuction(orderId);
      expect(auction.state).to.equal(4); // State.Completed

      const totalBid = ethers.parseEther("3.0");
      const expectedFee = (totalBid * platformFeeBps) / 10000n;
      const expectedSellerAmount = totalBid - expectedFee;

      const finalSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );
      expect(finalSellerBalance).to.equal(
        initialSellerBalance + expectedSellerAmount,
      );

      const finalPlatformBalance = await ethers.provider.getBalance(
        platformWallet.address,
      );
      expect(finalPlatformBalance).to.equal(
        initialPlatformBalance + expectedFee,
      );
    });

    it("should only allow highest bidder to confirm delivery", async function () {
      await endAndShip();

      await expect(
        artAuction.connect(owner).confirmDelivery(orderId),
      ).to.be.revertedWithCustomError(artAuction, "NotBuyer");
    });
  });

  describe("Full lifecycle", function () {
    it("should complete create → bid → end → ship → confirm delivery", async function () {
      await expect(createDefaultAuction(seller)).to.emit(
        artAuction,
        "AuctionStarted",
      );

      const bidAmount = ethers.parseEther("3.0");
      await expect(
        artAuction.connect(bidder1).bid(orderId, { value: bidAmount }),
      ).to.emit(artAuction, "NewBid");

      await fastForwardPastAuction();

      await expect(artAuction.connect(seller).endAuction(orderId))
        .to.emit(artAuction, "AuctionEnded")
        .withArgs(orderId, bidder1.address, bidAmount);

      await expect(
        artAuction
          .connect(seller)
          .markShipped(orderId, "QmTrackingHash"),
      ).to.emit(artAuction, "ArtShipped");

      const initialSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );

      await expect(artAuction.connect(bidder1).confirmDelivery(orderId))
        .to.emit(artAuction, "DeliveryConfirmed")
        .withArgs(orderId, bidder1.address);

      const auction = await artAuction.getAuction(orderId);
      expect(auction.state).to.equal(4); // State.Completed

      const expectedFee = (bidAmount * platformFeeBps) / 10000n;
      const expectedSellerAmount = bidAmount - expectedFee;

      const finalSellerBalance = await ethers.provider.getBalance(
        seller.address,
      );
      expect(finalSellerBalance).to.equal(
        initialSellerBalance + expectedSellerAmount,
      );
    });
  });
});
