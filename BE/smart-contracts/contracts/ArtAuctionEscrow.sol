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

    // --- Errors ---

    error ZeroAddress();
    error FeeExceedsMaximum(uint256 fee, uint256 max);
    error AuctionAlreadyExists(string orderId);
    error AuctionNotFound(string orderId);
    error InvalidDuration();
    error InvalidMinBidIncrement();
    error NotSeller();
    error NotBuyer();
    error NotArbiter();
    error InvalidState(State current, State expected);
    error AuctionNotExpired();
    error SellerCannotBid();
    error BidBelowMinimum(uint256 sent, uint256 required);
    error BidIncrementTooLow(uint256 sent, uint256 required);
    error ShippingDeadlinePassed();
    error ShippingDeadlineNotPassed();
    error DeliveryDeadlinePassed();
    error DeliveryDeadlineNotPassed();
    error DisputeDeadlineNotPassed();
    error HasExistingBids();
    error NoFundsToWithdraw();
    error TransferFailed();

    // --- Events ---

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

    // --- State variables ---

    address public immutable arbiter;
    uint256 public immutable platformFeeBps;
    address payable public immutable platformWallet;

    mapping(string => Auction) internal _auctions;
    mapping(address => uint256) public pendingReturns;

    // --- Constants ---

    uint256 public constant ANTI_SNIPE_WINDOW = 10 minutes;
    uint256 public constant ANTI_SNIPE_EXTENSION = 10 minutes;
    uint256 public constant SHIPPING_WINDOW = 5 days;
    uint256 public constant DELIVERY_WINDOW = 14 days;
    uint256 public constant DISPUTE_WINDOW = 30 days;
    uint256 public constant MAX_FEE_BPS = 1000;

    // --- Modifiers ---

    modifier auctionExists(string calldata orderId) {
        if (_auctions[orderId].seller == address(0)) revert AuctionNotFound(orderId);
        _;
    }

    modifier onlySeller(string calldata orderId) {
        if (msg.sender != _auctions[orderId].seller) revert NotSeller();
        _;
    }

    modifier onlyBuyer(string calldata orderId) {
        if (msg.sender != _auctions[orderId].highestBidder) revert NotBuyer();
        _;
    }

    modifier onlyArbiter() {
        if (msg.sender != arbiter) revert NotArbiter();
        _;
    }

    modifier inState(string calldata orderId, State expected) {
        State current = _auctions[orderId].state;
        if (current != expected) revert InvalidState(current, expected);
        _;
    }

    // --- Constructor ---

    constructor(address _arbiter, address payable _platformWallet, uint256 _platformFeeBps) {
        if (_arbiter == address(0)) revert ZeroAddress();
        if (_platformWallet == address(0)) revert ZeroAddress();
        if (_platformFeeBps > MAX_FEE_BPS) revert FeeExceedsMaximum(_platformFeeBps, MAX_FEE_BPS);

        arbiter = _arbiter;
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
    }

    // --- External functions ---

    /// @notice Creates a new auction for a physical art piece.
    /// @param orderId Unique identifier from the off-chain backend.
    /// @param duration Auction duration in seconds.
    /// @param reservePrice Minimum acceptable final bid price.
    /// @param minBidIncrement Minimum increment between bids.
    /// @param ipfsHash IPFS hash for art metadata and provenance.
    function createAuction(
        string calldata orderId,
        uint256 duration,
        uint256 reservePrice,
        uint256 minBidIncrement,
        string calldata ipfsHash
    ) external {
        if (_auctions[orderId].seller != address(0)) revert AuctionAlreadyExists(orderId);
        if (duration == 0) revert InvalidDuration();
        if (minBidIncrement == 0) revert InvalidMinBidIncrement();

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
    function bid(string calldata orderId)
        external
        payable
        nonReentrant
        auctionExists(orderId)
        inState(orderId, State.Started)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp >= auction.endTime) revert AuctionNotExpired();
        if (msg.sender == auction.seller) revert SellerCannotBid();

        if (auction.highestBidder == address(0)) {
            if (msg.value < auction.minBidIncrement) {
                revert BidBelowMinimum(msg.value, auction.minBidIncrement);
            }
        } else {
            uint256 required = auction.highestBid + auction.minBidIncrement;
            if (msg.value < required) {
                revert BidIncrementTooLow(msg.value, required);
            }
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
    function endAuction(string calldata orderId)
        external
        auctionExists(orderId)
        onlySeller(orderId)
        inState(orderId, State.Started)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp < auction.endTime) revert AuctionNotExpired();

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
    function cancelAuction(string calldata orderId)
        external
        onlySeller(orderId)
        inState(orderId, State.Started)
    {
        Auction storage auction = _auctions[orderId];

        if (auction.highestBidder != address(0)) revert HasExistingBids();

        auction.state = State.Cancelled;
        emit AuctionCancelled(orderId, "Cancelled by seller");
    }

    /// @notice Seller marks the art as shipped with tracking proof.
    /// @param orderId The auction order.
    /// @param _trackingHash Proof of shipment (e.g., IPFS hash of tracking info).
    function markShipped(string calldata orderId, string calldata _trackingHash)
        external
        onlySeller(orderId)
        inState(orderId, State.Ended)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp > auction.shippingDeadline) revert ShippingDeadlinePassed();

        auction.trackingHash = _trackingHash;
        auction.deliveryDeadline = block.timestamp + DELIVERY_WINDOW;
        auction.state = State.Shipped;

        emit ArtShipped(orderId, msg.sender, _trackingHash);
    }

    /// @notice Buyer confirms delivery, releasing funds to the seller.
    /// @param orderId The auction order.
    function confirmDelivery(string calldata orderId)
        external
        nonReentrant
        onlyBuyer(orderId)
        inState(orderId, State.Shipped)
    {
        Auction storage auction = _auctions[orderId];

        _paySellerWithFee(auction);
        auction.state = State.Completed;

        emit DeliveryConfirmed(orderId, msg.sender);
    }

    /// @notice Claims refund when seller fails to ship within the deadline.
    /// @param orderId The auction order.
    function claimShippingTimeout(string calldata orderId)
        external
        inState(orderId, State.Ended)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp <= auction.shippingDeadline) revert ShippingDeadlineNotPassed();

        pendingReturns[auction.highestBidder] += auction.highestBid;
        auction.state = State.Cancelled;

        emit ShippingTimeout(orderId, auction.highestBidder);
    }

    /// @notice Buyer opens a dispute during the delivery window.
    /// @param orderId The auction order.
    /// @param reason Description of the dispute.
    function openDispute(string calldata orderId, string calldata reason)
        external
        onlyBuyer(orderId)
        inState(orderId, State.Shipped)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp > auction.deliveryDeadline) revert DeliveryDeadlinePassed();

        auction.disputeDeadline = block.timestamp + DISPUTE_WINDOW;
        auction.state = State.Disputed;

        emit DisputeOpened(orderId, msg.sender, reason);
    }

    /// @notice Arbiter resolves a dispute in favor of buyer or seller.
    /// @param orderId The auction order.
    /// @param favorBuyer True to refund buyer, false to pay seller.
    function resolveDispute(string calldata orderId, bool favorBuyer)
        external
        nonReentrant
        onlyArbiter
        inState(orderId, State.Disputed)
    {
        Auction storage auction = _auctions[orderId];

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
    function claimDeliveryTimeout(string calldata orderId)
        external
        nonReentrant
        onlySeller(orderId)
        inState(orderId, State.Shipped)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp <= auction.deliveryDeadline) revert DeliveryDeadlineNotPassed();

        _paySellerWithFee(auction);
        auction.state = State.Completed;

        emit DeliveryTimeout(orderId, auction.seller);
    }

    /// @notice Buyer claims refund when arbiter does not resolve a dispute in time.
    /// @param orderId The auction order.
    function claimDisputeTimeout(string calldata orderId)
        external
        onlyBuyer(orderId)
        inState(orderId, State.Disputed)
    {
        Auction storage auction = _auctions[orderId];

        if (block.timestamp <= auction.disputeDeadline) revert DisputeDeadlineNotPassed();

        pendingReturns[auction.highestBidder] += auction.highestBid;
        auction.state = State.Cancelled;

        emit AuctionCancelled(orderId, "Dispute timeout");
    }

    /// @notice Returns core auction data (participants and bid info).
    function getAuction(string calldata orderId)
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
    function getAuctionTimeline(string calldata orderId)
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
        if (amount == 0) revert NoFundsToWithdraw();

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    // --- Internal functions ---

    /// @dev Splits payment between platform (fee) and seller (remainder).
    function _paySellerWithFee(Auction storage auction) internal {
        uint256 totalAmount = auction.highestBid;
        uint256 fee = (totalAmount * platformFeeBps) / 10000;
        uint256 sellerAmount = totalAmount - fee;

        if (fee > 0) {
            (bool feeSuccess, ) = platformWallet.call{value: fee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        (bool sellerSuccess, ) = auction.seller.call{value: sellerAmount}("");
        if (!sellerSuccess) revert TransferFailed();
    }
}
