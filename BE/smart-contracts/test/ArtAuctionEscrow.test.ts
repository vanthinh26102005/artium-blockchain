import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ArtAuctionEscrow } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ArtAuctionEscrow", function () {
  // --- Constants matching contract ---
  const ORDER_ID = "order-001";
  const ORDER_ID_2 = "order-002";
  const DURATION = 3600; // 1 hour
  const RESERVE_PRICE = ethers.parseEther("1.0");
  const MIN_BID_INCREMENT = ethers.parseEther("0.1");
  const IPFS_HASH = "QmTestHash123456789";
  const TRACKING_HASH = "QmTrackingHash987654321";
  const PLATFORM_FEE_BPS = 250; // 2.5%

  const ANTI_SNIPE_WINDOW = 10 * 60; // 10 minutes
  const ANTI_SNIPE_EXTENSION = 10 * 60;
  const SHIPPING_WINDOW = 5 * 24 * 60 * 60; // 5 days
  const DELIVERY_WINDOW = 14 * 24 * 60 * 60; // 14 days
  const DISPUTE_WINDOW = 30 * 24 * 60 * 60; // 30 days

  // Enum State
  const State = { Started: 0, Ended: 1, Shipped: 2, Disputed: 3, Completed: 4, Cancelled: 5 };

  // --- Fixture ---
  async function deployFixture() {
    const [owner, seller, bidder1, bidder2, arbiter, platformWallet] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
    const artAuction = await Factory.deploy(arbiter.address, platformWallet.address, PLATFORM_FEE_BPS);
    return { artAuction, owner, seller, bidder1, bidder2, arbiter, platformWallet };
  }

  /** Fixture: Auction đã tạo xong, sẵn sàng để bid */
  async function auctionCreatedFixture() {
    const base = await deployFixture();
    await base.artAuction.connect(base.seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);
    return base;
  }

  /** Fixture: Auction đã có bid, đã hết giờ, đã gọi endAuction -> State Ended */
  async function auctionEndedFixture() {
    const base = await auctionCreatedFixture();
    await base.artAuction.connect(base.bidder1).bid(ORDER_ID, { value: ethers.parseEther("2.0") });
    await time.increase(DURATION + 1);
    await base.artAuction.connect(base.seller).endAuction(ORDER_ID);
    return base;
  }

  /** Fixture: Seller đã ship hàng -> State Shipped */
  async function auctionShippedFixture() {
    const base = await auctionEndedFixture();
    await base.artAuction.connect(base.seller).markShipped(ORDER_ID, TRACKING_HASH);
    return base;
  }

  // ============================================================
  // 1. Constructor
  // ============================================================
  describe("Constructor", function () {
    it("Deploy thành công với các tham số hợp lệ", async function () {
      const { artAuction, arbiter, platformWallet } = await loadFixture(deployFixture);
      expect(await artAuction.arbiter()).to.equal(arbiter.address);
      expect(await artAuction.platformWallet()).to.equal(platformWallet.address);
      expect(await artAuction.platformFeeBps()).to.equal(PLATFORM_FEE_BPS);
    });

    it("Revert nếu arbiter là address(0)", async function () {
      const [, , , , , platformWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
      await expect(
        Factory.deploy(ethers.ZeroAddress, platformWallet.address, PLATFORM_FEE_BPS)
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });

    it("Revert nếu platformWallet là address(0)", async function () {
      const [, , , , arbiter] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
      await expect(
        Factory.deploy(arbiter.address, ethers.ZeroAddress, PLATFORM_FEE_BPS)
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });

    it("Revert nếu phí vượt quá MAX_FEE_BPS (10%)", async function () {
      const [, , , , arbiter, platformWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
      await expect(
        Factory.deploy(arbiter.address, platformWallet.address, 1001)
      ).to.be.revertedWithCustomError(Factory, "FeeExceedsMaximum");
    });

    it("Deploy thành công với phí = 0 (miễn phí nền tảng)", async function () {
      const [, , , , arbiter, platformWallet] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("ArtAuctionEscrow");
      const contract = await Factory.deploy(arbiter.address, platformWallet.address, 0);
      expect(await contract.platformFeeBps()).to.equal(0);
    });
  });

  // ============================================================
  // 2. createAuction
  // ============================================================
  describe("createAuction", function () {
    it("Tạo phiên đấu giá thành công", async function () {
      const { artAuction, seller } = await loadFixture(deployFixture);

      await expect(artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH))
        .to.emit(artAuction, "AuctionStarted");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.highestBidder).to.equal(ethers.ZeroAddress);
      expect(auction.minBidIncrement).to.equal(MIN_BID_INCREMENT);
      expect(auction.ipfsHash).to.equal(IPFS_HASH);
      expect(auction.state).to.equal(State.Started);
    });

    it("Revert nếu orderId đã tồn tại", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH)
      ).to.be.revertedWithCustomError(artAuction, "AuctionAlreadyExists");
    });

    it("Revert nếu duration = 0", async function () {
      const { artAuction, seller } = await loadFixture(deployFixture);
      await expect(
        artAuction.connect(seller).createAuction(ORDER_ID, 0, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH)
      ).to.be.revertedWithCustomError(artAuction, "InvalidDuration");
    });

    it("Revert nếu minBidIncrement = 0", async function () {
      const { artAuction, seller } = await loadFixture(deployFixture);
      await expect(
        artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, 0, IPFS_HASH)
      ).to.be.revertedWithCustomError(artAuction, "InvalidMinBidIncrement");
    });

    it("Cho phép tạo với reservePrice = 0 (không giới hạn giá sàn)", async function () {
      const { artAuction, seller } = await loadFixture(deployFixture);
      await expect(
        artAuction.connect(seller).createAuction(ORDER_ID, DURATION, 0, MIN_BID_INCREMENT, IPFS_HASH)
      ).to.emit(artAuction, "AuctionStarted");
    });
  });

  // ============================================================
  // 3. bid
  // ============================================================
  describe("bid", function () {
    it("Bid thành công lần đầu tiên (>= minBidIncrement)", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      const bidAmount = ethers.parseEther("0.5");

      await expect(artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount }))
        .to.emit(artAuction, "NewBid")
        .withArgs(ORDER_ID, bidder1.address, bidAmount);
    });

    it("Revert nếu bid đầu tiên < minBidIncrement", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWithCustomError(artAuction, "BidBelowMinimum");
    });

    it("Bid thứ 2 phải >= highestBid + minBidIncrement", async function () {
      const { artAuction, bidder1, bidder2 } = await loadFixture(auctionCreatedFixture);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("1.0") });

      // Bid chỉ cao hơn 0.05 ETH (< minBidIncrement = 0.1 ETH) -> revert
      await expect(
        artAuction.connect(bidder2).bid(ORDER_ID, { value: ethers.parseEther("1.05") })
      ).to.be.revertedWithCustomError(artAuction, "BidIncrementTooLow");

      // Bid đúng >= highestBid + minBidIncrement -> pass
      await expect(
        artAuction.connect(bidder2).bid(ORDER_ID, { value: ethers.parseEther("1.1") })
      ).to.emit(artAuction, "NewBid");
    });

    it("Revert nếu seller tự bid", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(seller).bid(ORDER_ID, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(artAuction, "SellerCannotBid");
    });

    it("Revert nếu bid sau khi hết thời gian", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      await time.increase(DURATION + 1);
      await expect(
        artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotExpired");
    });

    it("Revert nếu orderId không tồn tại", async function () {
      const { artAuction, bidder1 } = await loadFixture(deployFixture);
      await expect(
        artAuction.connect(bidder1).bid("fake-id", { value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotFound");
    });

    it("Cập nhật pendingReturns cho người bị outbid", async function () {
      const { artAuction, bidder1, bidder2 } = await loadFixture(auctionCreatedFixture);
      const bid1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bid1 });
      await artAuction.connect(bidder2).bid(ORDER_ID, { value: ethers.parseEther("2.0") });
      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(bid1);
    });

    it("Anti-snipe: gia hạn thời gian nếu bid trong 10 phút cuối", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      const auctionBefore = await artAuction.getAuction(ORDER_ID);
      const originalEndTime = auctionBefore.endTime;

      // Tua đến 5 phút trước khi kết thúc (nằm trong ANTI_SNIPE_WINDOW)
      await time.increase(DURATION - 5 * 60);

      await expect(artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("1.0") }))
        .to.emit(artAuction, "AuctionExtended");

      const auctionAfter = await artAuction.getAuction(ORDER_ID);
      expect(auctionAfter.endTime).to.be.greaterThan(originalEndTime);
    });

    it("Không gia hạn nếu bid không nằm trong cửa sổ anti-snipe", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      const auctionBefore = await artAuction.getAuction(ORDER_ID);

      // Bid ngay khi mới tạo (còn xa mới đến cửa sổ 10 phút cuối)
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("1.0") });

      const auctionAfter = await artAuction.getAuction(ORDER_ID);
      expect(auctionAfter.endTime).to.equal(auctionBefore.endTime);
    });
  });

  // ============================================================
  // 4. endAuction
  // ============================================================
  describe("endAuction", function () {
    it("Kết thúc thành công khi highestBid >= reservePrice → state Ended", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(auctionCreatedFixture);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("2.0") });
      await time.increase(DURATION + 1);

      await expect(artAuction.connect(seller).endAuction(ORDER_ID))
        .to.emit(artAuction, "AuctionEnded")
        .withArgs(ORDER_ID, bidder1.address, ethers.parseEther("2.0"));

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Ended);
    });

    it("Tự hủy phiên khi highestBid < reservePrice → state Cancelled, hoàn tiền bidder", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(auctionCreatedFixture);
      // Bid thấp hơn reservePrice (1 ETH)
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("0.5") });
      await time.increase(DURATION + 1);

      await expect(artAuction.connect(seller).endAuction(ORDER_ID))
        .to.emit(artAuction, "AuctionCancelled")
        .withArgs(ORDER_ID, "Reserve price not met");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
      // Bidder nhận lại tiền qua pendingReturns
      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("Tự hủy khi không có ai bid", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await time.increase(DURATION + 1);

      await expect(artAuction.connect(seller).endAuction(ORDER_ID))
        .to.emit(artAuction, "AuctionCancelled");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
    });

    it("Revert nếu chưa hết thời gian", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(seller).endAuction(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "AuctionNotExpired");
    });

    it("Revert nếu người gọi không phải seller", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      await time.increase(DURATION + 1);
      await expect(
        artAuction.connect(bidder1).endAuction(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "NotSeller");
    });
  });

  // ============================================================
  // 5. cancelAuction
  // ============================================================
  describe("cancelAuction", function () {
    it("Seller hủy phiên đấu giá khi chưa có ai bid", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);

      await expect(artAuction.connect(seller).cancelAuction(ORDER_ID))
        .to.emit(artAuction, "AuctionCancelled")
        .withArgs(ORDER_ID, "Cancelled by seller");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
    });

    it("Revert nếu đã có người bid", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(auctionCreatedFixture);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("1.0") });

      await expect(
        artAuction.connect(seller).cancelAuction(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "HasExistingBids");
    });

    it("Revert nếu không phải seller", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(bidder1).cancelAuction(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "NotSeller");
    });
  });

  // ============================================================
  // 6. markShipped
  // ============================================================
  describe("markShipped", function () {
    it("Seller đánh dấu đã gửi hàng thành công", async function () {
      const { artAuction, seller } = await loadFixture(auctionEndedFixture);

      await expect(artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH))
        .to.emit(artAuction, "ArtShipped")
        .withArgs(ORDER_ID, seller.address, TRACKING_HASH);

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Shipped);

      const timeline = await artAuction.getAuctionTimeline(ORDER_ID);
      expect(timeline.trackingHash).to.equal(TRACKING_HASH);
    });

    it("Revert nếu không phải seller", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionEndedFixture);
      await expect(
        artAuction.connect(bidder1).markShipped(ORDER_ID, TRACKING_HASH)
      ).to.be.revertedWithCustomError(artAuction, "NotSeller");
    });

    it("Revert nếu quá hạn shipping (5 ngày)", async function () {
      const { artAuction, seller } = await loadFixture(auctionEndedFixture);
      await time.increase(SHIPPING_WINDOW + 1);
      await expect(
        artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH)
      ).to.be.revertedWithCustomError(artAuction, "ShippingDeadlinePassed");
    });

    it("Revert nếu auction không ở state Ended", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      await expect(
        artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH)
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });
  });

  // ============================================================
  // 7. confirmDelivery
  // ============================================================
  describe("confirmDelivery", function () {
    it("Buyer xác nhận nhận hàng → chuyển tiền cho seller (trừ phí nền tảng)", async function () {
      const { artAuction, seller, bidder1, platformWallet } = await loadFixture(auctionShippedFixture);

      const highestBid = ethers.parseEther("2.0");
      const fee = (highestBid * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = highestBid - fee;

      const tx = artAuction.connect(bidder1).confirmDelivery(ORDER_ID);

      await expect(tx).to.emit(artAuction, "DeliveryConfirmed").withArgs(ORDER_ID, bidder1.address);
      await expect(tx).to.changeEtherBalances(
        [artAuction, seller, platformWallet],
        [-highestBid, sellerAmount, fee]
      );

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Completed);
    });

    it("Revert nếu không phải buyer", async function () {
      const { artAuction, bidder2 } = await loadFixture(auctionShippedFixture);
      await expect(
        artAuction.connect(bidder2).confirmDelivery(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "NotBuyer");
    });

    it("Revert nếu state không phải Shipped", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionEndedFixture);
      await expect(
        artAuction.connect(bidder1).confirmDelivery(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });
  });

  // ============================================================
  // 8. claimShippingTimeout
  // ============================================================
  describe("claimShippingTimeout", function () {
    it("Buyer nhận hoàn tiền khi seller không ship trong 5 ngày", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionEndedFixture);
      await time.increase(SHIPPING_WINDOW + 1);

      await expect(artAuction.connect(bidder1).claimShippingTimeout(ORDER_ID))
        .to.emit(artAuction, "ShippingTimeout");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(ethers.parseEther("2.0"));
    });

    it("Revert nếu chưa hết hạn shipping", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionEndedFixture);
      await expect(
        artAuction.connect(bidder1).claimShippingTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "ShippingDeadlineNotPassed");
    });

    it("Revert nếu state không phải Ended", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionShippedFixture);
      await time.increase(SHIPPING_WINDOW + 1);
      await expect(
        artAuction.connect(bidder1).claimShippingTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });
  });

  // ============================================================
  // 9. openDispute
  // ============================================================
  describe("openDispute", function () {
    it("Buyer mở tranh chấp thành công khi state = Shipped", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionShippedFixture);

      await expect(artAuction.connect(bidder1).openDispute(ORDER_ID, "Tranh bị rách"))
        .to.emit(artAuction, "DisputeOpened")
        .withArgs(ORDER_ID, bidder1.address, "Tranh bị rách");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Disputed);
    });

    it("Revert nếu không phải buyer", async function () {
      const { artAuction, seller } = await loadFixture(auctionShippedFixture);
      await expect(
        artAuction.connect(seller).openDispute(ORDER_ID, "lý do")
      ).to.be.revertedWithCustomError(artAuction, "NotBuyer");
    });

    it("Revert nếu quá hạn delivery (14 ngày)", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionShippedFixture);
      await time.increase(DELIVERY_WINDOW + 1);
      await expect(
        artAuction.connect(bidder1).openDispute(ORDER_ID, "lý do")
      ).to.be.revertedWithCustomError(artAuction, "DeliveryDeadlinePassed");
    });
  });

  // ============================================================
  // 10. resolveDispute
  // ============================================================
  describe("resolveDispute", function () {
    /** Fixture: Dispute đã mở */
    async function auctionDisputedFixture() {
      const base = await auctionShippedFixture();
      await base.artAuction.connect(base.bidder1).openDispute(ORDER_ID, "Tranh bị rách");
      return base;
    }

    it("Arbiter phân xử cho Buyer (hoàn tiền)", async function () {
      const { artAuction, bidder1, arbiter } = await loadFixture(auctionDisputedFixture);

      await expect(artAuction.connect(arbiter).resolveDispute(ORDER_ID, true))
        .to.emit(artAuction, "DisputeResolved")
        .withArgs(ORDER_ID, arbiter.address, true);

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(ethers.parseEther("2.0"));
    });

    it("Arbiter phân xử cho Seller (chuyển tiền kèm phí nền tảng)", async function () {
      const { artAuction, seller, arbiter, platformWallet } = await loadFixture(auctionDisputedFixture);

      const highestBid = ethers.parseEther("2.0");
      const fee = (highestBid * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = highestBid - fee;

      const tx = artAuction.connect(arbiter).resolveDispute(ORDER_ID, false);

      await expect(tx).to.emit(artAuction, "DisputeResolved").withArgs(ORDER_ID, arbiter.address, false);
      await expect(tx).to.changeEtherBalances(
        [artAuction, seller, platformWallet],
        [-highestBid, sellerAmount, fee]
      );

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Completed);
    });

    it("Revert nếu không phải arbiter", async function () {
      const { artAuction, seller } = await loadFixture(auctionDisputedFixture);
      await expect(
        artAuction.connect(seller).resolveDispute(ORDER_ID, true)
      ).to.be.revertedWithCustomError(artAuction, "NotArbiter");
    });

    it("Revert nếu state không phải Disputed", async function () {
      const { artAuction, arbiter } = await loadFixture(auctionShippedFixture);
      await expect(
        artAuction.connect(arbiter).resolveDispute(ORDER_ID, true)
      ).to.be.revertedWithCustomError(artAuction, "InvalidState");
    });
  });

  // ============================================================
  // 11. claimDeliveryTimeout
  // ============================================================
  describe("claimDeliveryTimeout", function () {
    it("Seller nhận tiền khi buyer không confirm/dispute trong 14 ngày", async function () {
      const { artAuction, seller, platformWallet } = await loadFixture(auctionShippedFixture);
      await time.increase(DELIVERY_WINDOW + 1);

      const highestBid = ethers.parseEther("2.0");
      const fee = (highestBid * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = highestBid - fee;

      const tx = artAuction.connect(seller).claimDeliveryTimeout(ORDER_ID);

      await expect(tx).to.emit(artAuction, "DeliveryTimeout");
      await expect(tx).to.changeEtherBalances(
        [artAuction, seller, platformWallet],
        [-highestBid, sellerAmount, fee]
      );

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Completed);
    });

    it("Revert nếu chưa hết hạn delivery", async function () {
      const { artAuction, seller } = await loadFixture(auctionShippedFixture);
      await expect(
        artAuction.connect(seller).claimDeliveryTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "DeliveryDeadlineNotPassed");
    });

    it("Revert nếu không phải seller", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionShippedFixture);
      await time.increase(DELIVERY_WINDOW + 1);
      await expect(
        artAuction.connect(bidder1).claimDeliveryTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "NotSeller");
    });
  });

  // ============================================================
  // 12. claimDisputeTimeout
  // ============================================================
  describe("claimDisputeTimeout", function () {
    async function auctionDisputedFixture() {
      const base = await auctionShippedFixture();
      await base.artAuction.connect(base.bidder1).openDispute(ORDER_ID, "Tranh bị rách");
      return base;
    }

    it("Buyer nhận lại tiền nếu arbiter không quyết định trong 30 ngày", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionDisputedFixture);
      await time.increase(DISPUTE_WINDOW + 1);

      await expect(artAuction.connect(bidder1).claimDisputeTimeout(ORDER_ID))
        .to.emit(artAuction, "AuctionCancelled")
        .withArgs(ORDER_ID, "Dispute timeout");

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);
      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(ethers.parseEther("2.0"));
    });

    it("Revert nếu chưa hết hạn dispute (30 ngày)", async function () {
      const { artAuction, bidder1 } = await loadFixture(auctionDisputedFixture);
      await expect(
        artAuction.connect(bidder1).claimDisputeTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "DisputeDeadlineNotPassed");
    });

    it("Revert nếu không phải buyer", async function () {
      const { artAuction, seller } = await loadFixture(auctionDisputedFixture);
      await time.increase(DISPUTE_WINDOW + 1);
      await expect(
        artAuction.connect(seller).claimDisputeTimeout(ORDER_ID)
      ).to.be.revertedWithCustomError(artAuction, "NotBuyer");
    });
  });

  // ============================================================
  // 13. withdraw
  // ============================================================
  describe("withdraw", function () {
    it("Rút tiền thành công", async function () {
      const { artAuction, seller, bidder1, bidder2 } = await loadFixture(auctionCreatedFixture);
      const bid1 = ethers.parseEther("1.0");
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bid1 });
      await artAuction.connect(bidder2).bid(ORDER_ID, { value: ethers.parseEther("2.0") });

      const tx = artAuction.connect(bidder1).withdraw();

      await expect(tx)
        .to.emit(artAuction, "Withdrawn")
        .withArgs(bidder1.address, bid1);

      await expect(tx)
        .to.changeEtherBalances([bidder1, artAuction], [bid1, -bid1]);

      expect(await artAuction.pendingReturns(bidder1.address)).to.equal(0);
    });

    it("Revert nếu pendingReturns = 0", async function () {
      const { artAuction, bidder1 } = await loadFixture(deployFixture);
      await expect(
        artAuction.connect(bidder1).withdraw()
      ).to.be.revertedWithCustomError(artAuction, "NoFundsToWithdraw");
    });
  });

  // ============================================================
  // 14. View functions (getAuction, getAuctionTimeline)
  // ============================================================
  describe("View functions", function () {
    it("getAuction trả về dữ liệu chính xác", async function () {
      const { artAuction, seller } = await loadFixture(auctionCreatedFixture);
      const a = await artAuction.getAuction(ORDER_ID);
      expect(a.seller).to.equal(seller.address);
      expect(a.ipfsHash).to.equal(IPFS_HASH);
      expect(a.minBidIncrement).to.equal(MIN_BID_INCREMENT);
    });

    it("getAuctionTimeline trả về tracking và deadline chính xác sau khi ship", async function () {
      const { artAuction } = await loadFixture(auctionShippedFixture);
      const t = await artAuction.getAuctionTimeline(ORDER_ID);
      expect(t.trackingHash).to.equal(TRACKING_HASH);
      expect(t.shippingDeadline).to.be.greaterThan(0);
      expect(t.deliveryDeadline).to.be.greaterThan(0);
      expect(t.reservePrice).to.equal(RESERVE_PRICE);
    });
  });

  // ============================================================
  // 15. Full Flow — Integration Tests
  // ============================================================
  describe("Full Flow (Integration)", function () {
    it("Happy path: tạo → bid → end → ship → confirm → tiền chia đúng", async function () {
      const { artAuction, seller, bidder1, platformWallet } = await loadFixture(deployFixture);
      const bidAmount = ethers.parseEther("5.0");
      const fee = (bidAmount * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = bidAmount - fee;

      // 1. Tạo phiên
      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);

      // 2. Bid
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount });

      // 3. Hết giờ → end
      await time.increase(DURATION + 1);
      await artAuction.connect(seller).endAuction(ORDER_ID);

      // 4. Ship
      await artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH);

      // 5. Confirm → tiền chia
      const tx = artAuction.connect(bidder1).confirmDelivery(ORDER_ID);
      await expect(tx).to.changeEtherBalances(
        [seller, platformWallet],
        [sellerAmount, fee]
      );

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Completed);
    });

    it("Dispute flow: tạo → bid → end → ship → dispute → arbiter xử buyer thắng → buyer rút tiền", async function () {
      const { artAuction, seller, bidder1, arbiter } = await loadFixture(deployFixture);
      const bidAmount = ethers.parseEther("3.0");

      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount });
      await time.increase(DURATION + 1);
      await artAuction.connect(seller).endAuction(ORDER_ID);
      await artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH);

      // Buyer mở dispute
      await artAuction.connect(bidder1).openDispute(ORDER_ID, "Tranh giả");

      // Arbiter phân xử cho buyer
      await artAuction.connect(arbiter).resolveDispute(ORDER_ID, true);

      // Buyer rút tiền
      await expect(artAuction.connect(bidder1).withdraw())
        .to.changeEtherBalances([bidder1, artAuction], [bidAmount, -bidAmount]);
    });

    it("Shipping timeout: seller không ship → buyer lấy lại tiền", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(deployFixture);
      const bidAmount = ethers.parseEther("2.0");

      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount });
      await time.increase(DURATION + 1);
      await artAuction.connect(seller).endAuction(ORDER_ID);

      // Qua 5 ngày seller không ship
      await time.increase(SHIPPING_WINDOW + 1);
      await artAuction.connect(bidder1).claimShippingTimeout(ORDER_ID);

      // Buyer rút tiền
      await expect(artAuction.connect(bidder1).withdraw())
        .to.changeEtherBalance(bidder1, bidAmount);
    });

    it("Delivery timeout: buyer không confirm → seller ép giải ngân", async function () {
      const { artAuction, seller, bidder1, platformWallet } = await loadFixture(deployFixture);
      const bidAmount = ethers.parseEther("4.0");
      const fee = (bidAmount * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = bidAmount - fee;

      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount });
      await time.increase(DURATION + 1);
      await artAuction.connect(seller).endAuction(ORDER_ID);
      await artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH);

      // Qua 14 ngày buyer im lặng
      await time.increase(DELIVERY_WINDOW + 1);
      const tx = artAuction.connect(seller).claimDeliveryTimeout(ORDER_ID);
      await expect(tx).to.changeEtherBalances(
        [seller, platformWallet],
        [sellerAmount, fee]
      );
    });

    it("Dispute timeout: arbiter mất tích → buyer nhận lại tiền sau 30 ngày", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(deployFixture);
      const bidAmount = ethers.parseEther("2.5");

      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, RESERVE_PRICE, MIN_BID_INCREMENT, IPFS_HASH);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: bidAmount });
      await time.increase(DURATION + 1);
      await artAuction.connect(seller).endAuction(ORDER_ID);
      await artAuction.connect(seller).markShipped(ORDER_ID, TRACKING_HASH);
      await artAuction.connect(bidder1).openDispute(ORDER_ID, "Hàng sai mẫu");

      // Qua 30 ngày arbiter không giải quyết
      await time.increase(DISPUTE_WINDOW + 1);
      await artAuction.connect(bidder1).claimDisputeTimeout(ORDER_ID);

      await expect(artAuction.connect(bidder1).withdraw())
        .to.changeEtherBalance(bidder1, bidAmount);
    });

    it("Reserve price không đạt: bid → end → cancel → bidder rút tiền", async function () {
      const { artAuction, seller, bidder1 } = await loadFixture(deployFixture);

      await artAuction.connect(seller).createAuction(ORDER_ID, DURATION, ethers.parseEther("10.0"), MIN_BID_INCREMENT, IPFS_HASH);
      await artAuction.connect(bidder1).bid(ORDER_ID, { value: ethers.parseEther("5.0") });
      await time.increase(DURATION + 1);

      await artAuction.connect(seller).endAuction(ORDER_ID);

      const auction = await artAuction.getAuction(ORDER_ID);
      expect(auction.state).to.equal(State.Cancelled);

      await expect(artAuction.connect(bidder1).withdraw())
        .to.changeEtherBalance(bidder1, ethers.parseEther("5.0"));
    });
  });
});
