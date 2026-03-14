// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtAuctionEscrow
 * @dev Manages auctions and escrow for physical art pieces in a hybrid architecture.
 */
contract ArtAuctionEscrow is ReentrancyGuard {
    enum State { Started, Ended, Completed, Cancelled }

    struct Auction {
        address payable seller;
        address payable highestBidder;
        uint256 highestBid;
        uint256 endTime;
        State state;
    }

    mapping(string => Auction) public auctions;

    mapping(address => uint256) public pendingReturns;

    // Events
    event AuctionStarted(string orderId, address indexed seller, uint256 endTime);
    event NewBid(string orderId, address indexed bidder, uint256 amount);
    event AuctionEnded(string orderId, address indexed winner, uint256 amount);
    event Withdrawn(address indexed bidder, uint256 amount);
    event DeliveryConfirmed(string orderId, address indexed winner);

    /**
     * @dev Initializes a new auction.
     * @param orderId The unique string identifier for the order from the off-chain backend.
     * @param duration The duration of the auction in seconds from the time of creation.
     */
    function createAuction(string memory orderId, uint256 duration) external {
        require(auctions[orderId].seller == address(0), "Auction: Order ID already exists");
        
        uint256 endTime = block.timestamp + duration;
        require(endTime > block.timestamp, "Auction: End time must be in the future");

        auctions[orderId] = Auction({
            seller: payable(msg.sender),
            highestBidder: payable(address(0)),
            highestBid: 0,
            endTime: endTime,
            state: State.Started
        });

        emit AuctionStarted(orderId, msg.sender, endTime);
    }

    /**
     * @dev Places a bid on a specific auction.
     * Emits a `NewBid` event if successful.
     * @param orderId The unique identifier for the auction.
     */
    function bid(string memory orderId) external payable nonReentrant {
        Auction storage auction = auctions[orderId];

        require(auction.seller != address(0), "Auction: Order does not exist");
        require(auction.state == State.Started, "Auction: Not in Started state");
        require(block.timestamp < auction.endTime, "Auction: Already ended");
        require(msg.sender != auction.seller, "Auction: Seller cannot bid");
        require(msg.value > auction.highestBid, "Auction: Bid too low");

        if (auction.highestBid != 0) {
            // Update the pending returns for the previous highest bidder
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit NewBid(orderId, msg.sender, msg.value);
    }

    /**
     * @dev Allows users to withdraw their outbid amounts.
     * Implements Checks-Effects-Interactions pattern to prevent Reentrancy attacks.
     * Emits a `Withdrawn` event upon success.
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "Auction: No funds to withdraw");

        // Effects
        pendingReturns[msg.sender] = 0;

        // Interactions
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Auction: Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Ends the auction and locks the funds in escrow.
     * @param orderId The unique identifier for the auction.
     */
    function endAuction(string memory orderId) external {
        Auction storage auction = auctions[orderId];

        require(auction.seller != address(0), "Auction: Order does not exist");
        require(block.timestamp >= auction.endTime, "Auction: Auction time has not expired");
        require(auction.state == State.Started, "Auction: Already ended or not started");

        auction.state = State.Ended;

        emit AuctionEnded(orderId, auction.highestBidder, auction.highestBid);
    }

    /**
     * @dev Confirms the delivery of physical art and releases funds to the seller.
     * Only the highest bidder (buyer) can call this function.
     * @param orderId The unique identifier for the auction.
     */
    function confirmDelivery(string memory orderId) external nonReentrant {
        Auction storage auction = auctions[orderId];

        require(auction.seller != address(0), "Auction: Order does not exist");
        require(auction.state == State.Ended, "Auction: Not in Ended state");
        require(msg.sender == auction.highestBidder, "Auction: Only winner can confirm");

        auction.state = State.Completed;

        uint256 amount = auction.highestBid;
        if (amount > 0) {
            // Interactions
            (bool success, ) = auction.seller.call{value: amount}("");
            require(success, "Auction: Transfer to seller failed");
        }

        emit DeliveryConfirmed(orderId, msg.sender);
    }
}
