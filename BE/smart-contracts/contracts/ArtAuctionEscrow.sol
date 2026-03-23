// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtAuctionEscrow
 * @dev Manages auctions and escrow for physical art pieces in a hybrid architecture.
 *      Supports bidding, shipping verification, dispute resolution, and platform fees.
 */
contract ArtAuctionEscrow is ReentrancyGuard {
    enum State { Started, Ended, Shipped, Disputed, Completed, Cancelled }

    struct Auction {
        address payable seller;
        address payable highestBidder;
        uint256 highestBid;
        uint256 startTime;
        uint256 endTime;
        uint256 reservePrice;
        uint256 minBidIncrement;
        string ipfsHash;
        string trackingHash;
        uint256 shippingDeadline;
        uint256 deliveryDeadline;
        uint256 disputeDeadline;
        State state;
    }

    address public arbiter;
    uint256 public platformFeeBps;
    address payable public platformWallet;

    mapping(string => Auction) internal _auctions;
    mapping(address => uint256) public pendingReturns;

    uint256 public constant ANTI_SNIPE_WINDOW = 10 minutes;
    uint256 public constant ANTI_SNIPE_EXTENSION = 10 minutes;
    uint256 public constant SHIPPING_WINDOW = 3 days;
    uint256 public constant DELIVERY_WINDOW = 14 days;
    uint256 public constant DISPUTE_WINDOW = 30 days;
    uint256 public constant MAX_FEE_BPS = 1000;

    event AuctionStarted(string orderId, address indexed seller, uint256 endTime);
    event NewBid(string orderId, address indexed bidder, uint256 amount);
    event AuctionEnded(string orderId, address indexed winner, uint256 amount);
    event Withdrawn(address indexed bidder, uint256 amount);
    event DeliveryConfirmed(string orderId, address indexed winner);
    event AuctionCancelled(string orderId, string reason);
    event AuctionExtended(string orderId, uint256 newEndTime);
    event ArtShipped(string orderId, address indexed seller, string trackingHash);
    event DisputeOpened(string orderId, address indexed buyer, string reason);
    event DisputeResolved(string orderId, address indexed arbiter, bool favorBuyer);
    event ShippingTimeout(string orderId, address indexed buyer);
    event DeliveryTimeout(string orderId, address indexed seller);

    constructor(address _arbiter, address payable _platformWallet, uint256 _platformFeeBps) {
        require(_arbiter != address(0), "Auction: Invalid arbiter address");
        require(_platformWallet != address(0), "Auction: Invalid platform wallet");
        require(_platformFeeBps <= MAX_FEE_BPS, "Auction: Fee exceeds maximum");

        arbiter = _arbiter;
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
    }

    /// @notice Creates a new auction for a physical art piece.
    /// @param orderId Unique identifier from the off-chain backend.
    /// @param duration Auction duration in seconds.
    /// @param reservePrice Minimum acceptable final bid price.
    /// @param minBidIncrement Minimum increment between bids.
    /// @param ipfsHash IPFS hash for art metadata and provenance.
    function createAuction(
        string memory orderId,
        uint256 duration,
        uint256 reservePrice,
        uint256 minBidIncrement,
        string memory ipfsHash
    ) external {
        require(_auctions[orderId].seller == address(0), "Auction: Order ID already exists");
        require(duration > 0, "Auction: Duration must be greater than zero");
        require(minBidIncrement > 0, "Auction: Min bid increment must be greater than zero");

        uint256 endTime = block.timestamp + duration;

        _auctions[orderId] = Auction({
            seller: payable(msg.sender),
            highestBidder: payable(address(0)),
            highestBid: 0,
            startTime: block.timestamp,
            endTime: endTime,
            reservePrice: reservePrice,
            minBidIncrement: minBidIncrement,
            ipfsHash: ipfsHash,
            trackingHash: "",
            shippingDeadline: 0,
            deliveryDeadline: 0,
            disputeDeadline: 0,
            state: State.Started
        });

        emit AuctionStarted(orderId, msg.sender, endTime);
    }

    /// @notice Places a bid on an active auction. Implements anti-snipe extension.
    /// @param orderId The auction to bid on.
    function bid(string memory orderId) external payable nonReentrant {
        Auction storage auction = _auctions[orderId];

        require(auction.seller != address(0), "Auction: Order does not exist");
        require(auction.state == State.Started, "Auction: Not in Started state");
        require(block.timestamp < auction.endTime, "Auction: Already ended");
        require(msg.sender != auction.seller, "Auction: Seller cannot bid");

        if (auction.highestBidder == address(0)) {
            require(msg.value >= auction.minBidIncrement, "Auction: Bid below minimum");
        } else {
            require(
                msg.value >= auction.highestBid + auction.minBidIncrement,
                "Auction: Bid increment too low"
            );
        }

        if (auction.highestBid != 0) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        if (auction.endTime - block.timestamp < ANTI_SNIPE_WINDOW) {
            auction.endTime += ANTI_SNIPE_EXTENSION;
            emit AuctionExtended(orderId, auction.endTime);
        }

        emit NewBid(orderId, msg.sender, msg.value);
    }

    /// @notice Ends the auction. Moves to Ended if reserve met, Cancelled otherwise.
    /// @param orderId The auction to end.
    function endAuction(string memory orderId) external {
        Auction storage auction = _auctions[orderId];

        require(auction.seller != address(0), "Auction: Order does not exist");
        require(msg.sender == auction.seller, "Auction: Only seller can end");
        require(auction.state == State.Started, "Auction: Not in Started state");
        require(block.timestamp >= auction.endTime, "Auction: Auction time has not expired");

        if (auction.highestBid >= auction.reservePrice && auction.highestBidder != address(0)) {
            auction.state = State.Ended;
            auction.shippingDeadline = block.timestamp + SHIPPING_WINDOW;
            emit AuctionEnded(orderId, auction.highestBidder, auction.highestBid);
        } else {
            if (auction.highestBid > 0) {
                pendingReturns[auction.highestBidder] += auction.highestBid;
            }
            auction.state = State.Cancelled;
            emit AuctionCancelled(orderId, "Reserve price not met");
        }
    }

    /// @notice Cancels an auction that has received no bids.
    /// @param orderId The auction to cancel.
    function cancelAuction(string memory orderId) external {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.seller, "Auction: Only seller can cancel");
        require(auction.state == State.Started, "Auction: Not in Started state");
        require(auction.highestBidder == address(0), "Auction: Cannot cancel with bids");

        auction.state = State.Cancelled;
        emit AuctionCancelled(orderId, "Cancelled by seller");
    }

    /// @notice Seller marks the art as shipped with tracking proof.
    /// @param orderId The auction order.
    /// @param _trackingHash Proof of shipment (e.g., IPFS hash of tracking info).
    function markShipped(string memory orderId, string memory _trackingHash) external {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.seller, "Auction: Only seller can ship");
        require(auction.state == State.Ended, "Auction: Not in Ended state");
        require(block.timestamp <= auction.shippingDeadline, "Auction: Shipping deadline passed");

        auction.trackingHash = _trackingHash;
        auction.deliveryDeadline = block.timestamp + DELIVERY_WINDOW;
        auction.state = State.Shipped;

        emit ArtShipped(orderId, msg.sender, _trackingHash);
    }

    /// @notice Buyer confirms delivery, releasing funds to the seller.
    /// @param orderId The auction order.
    function confirmDelivery(string memory orderId) external nonReentrant {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.highestBidder, "Auction: Only winner can confirm");
        require(auction.state == State.Shipped, "Auction: Not in Shipped state");

        _paySellerWithFee(auction);
        auction.state = State.Completed;

        emit DeliveryConfirmed(orderId, msg.sender);
    }

    /// @notice Claims refund when seller fails to ship within the deadline.
    /// @param orderId The auction order.
    function claimShippingTimeout(string memory orderId) external {
        Auction storage auction = _auctions[orderId];

        require(auction.state == State.Ended, "Auction: Not in Ended state");
        require(block.timestamp > auction.shippingDeadline, "Auction: Shipping deadline not passed");

        pendingReturns[auction.highestBidder] += auction.highestBid;
        auction.state = State.Cancelled;

        emit ShippingTimeout(orderId, auction.highestBidder);
    }

    /// @notice Buyer opens a dispute during the delivery window.
    /// @param orderId The auction order.
    /// @param reason Description of the dispute.
    function openDispute(string memory orderId, string memory reason) external {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.highestBidder, "Auction: Only buyer can dispute");
        require(auction.state == State.Shipped, "Auction: Not in Shipped state");
        require(block.timestamp <= auction.deliveryDeadline, "Auction: Delivery deadline passed");

        auction.disputeDeadline = block.timestamp + DISPUTE_WINDOW;
        auction.state = State.Disputed;

        emit DisputeOpened(orderId, msg.sender, reason);
    }

    /// @notice Arbiter resolves a dispute in favor of buyer or seller.
    /// @param orderId The auction order.
    /// @param favorBuyer True to refund buyer, false to pay seller.
    function resolveDispute(string memory orderId, bool favorBuyer) external nonReentrant {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == arbiter, "Auction: Only arbiter can resolve");
        require(auction.state == State.Disputed, "Auction: Not in Disputed state");

        if (favorBuyer) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
            auction.state = State.Cancelled;
        } else {
            _paySellerWithFee(auction);
            auction.state = State.Completed;
        }

        emit DisputeResolved(orderId, msg.sender, favorBuyer);
    }

    /// @notice Seller claims funds when buyer does not confirm or dispute within the delivery window.
    /// @param orderId The auction order.
    function claimDeliveryTimeout(string memory orderId) external nonReentrant {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.seller, "Auction: Only seller can claim");
        require(auction.state == State.Shipped, "Auction: Not in Shipped state");
        require(block.timestamp > auction.deliveryDeadline, "Auction: Delivery deadline not passed");

        _paySellerWithFee(auction);
        auction.state = State.Completed;

        emit DeliveryTimeout(orderId, auction.seller);
    }

    /// @notice Buyer claims refund when arbiter does not resolve a dispute in time.
    /// @param orderId The auction order.
    function claimDisputeTimeout(string memory orderId) external {
        Auction storage auction = _auctions[orderId];

        require(msg.sender == auction.highestBidder, "Auction: Only buyer can claim");
        require(auction.state == State.Disputed, "Auction: Not in Disputed state");
        require(block.timestamp > auction.disputeDeadline, "Auction: Dispute deadline not passed");

        pendingReturns[auction.highestBidder] += auction.highestBid;
        auction.state = State.Cancelled;

        emit AuctionCancelled(orderId, "Dispute timeout");
    }

    /// @notice Returns core auction data (participants and bid info).
    function getAuction(string memory orderId)
        external
        view
        returns (
            address seller,
            address highestBidder,
            uint256 highestBid,
            uint256 startTime,
            uint256 endTime,
            uint256 minBidIncrement,
            string memory ipfsHash,
            State state
        )
    {
        Auction storage a = _auctions[orderId];
        return (
            a.seller,
            a.highestBidder,
            a.highestBid,
            a.startTime,
            a.endTime,
            a.minBidIncrement,
            a.ipfsHash,
            a.state
        );
    }

    /// @notice Returns timeline and shipping details for an auction.
    function getAuctionTimeline(string memory orderId)
        external
        view
        returns (
            string memory trackingHash,
            uint256 shippingDeadline,
            uint256 deliveryDeadline,
            uint256 disputeDeadline,
            uint256 reservePrice
        )
    {
        Auction storage a = _auctions[orderId];
        return (
            a.trackingHash,
            a.shippingDeadline,
            a.deliveryDeadline,
            a.disputeDeadline,
            a.reservePrice
        );
    }

    /// @notice Withdraw accumulated pending returns from outbid or refunded amounts.
    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "Auction: No funds to withdraw");

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Auction: Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @dev Splits payment between platform (fee) and seller (remainder).
    function _paySellerWithFee(Auction storage auction) internal {
        uint256 totalAmount = auction.highestBid;
        uint256 fee = (totalAmount * platformFeeBps) / 10000;
        uint256 sellerAmount = totalAmount - fee;

        if (fee > 0) {
            (bool feeSuccess, ) = platformWallet.call{value: fee}("");
            require(feeSuccess, "Auction: Platform fee transfer failed");
        }

        (bool sellerSuccess, ) = auction.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Auction: Seller transfer failed");
    }
}
