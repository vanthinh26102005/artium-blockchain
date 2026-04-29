// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IArtAuctionEscrowExternal {
    function bid(string calldata orderId) external payable;
    function withdraw() external;
    function createAuction(
        string calldata orderId,
        uint256 duration,
        uint256 reservePrice,
        uint256 minBidIncrement,
        string calldata ipfsHash
    ) external;
    function endAuction(string calldata orderId) external;
    function markShipped(string calldata orderId, string calldata trackingHash) external;
}

contract RejectEtherReceiver {
    receive() external payable {
        revert("RejectEther");
    }
}

contract RevertingBidder {
    IArtAuctionEscrowExternal public immutable escrow;

    constructor(address escrowAddress) {
        escrow = IArtAuctionEscrowExternal(escrowAddress);
    }

    function placeBid(string calldata orderId) external payable {
        escrow.bid{value: msg.value}(orderId);
    }

    function withdrawFromEscrow() external {
        escrow.withdraw();
    }

    receive() external payable {
        revert("RejectEther");
    }
}

contract RevertingSellerAgent {
    IArtAuctionEscrowExternal public immutable escrow;

    constructor(address escrowAddress) {
        escrow = IArtAuctionEscrowExternal(escrowAddress);
    }

    function createAuction(
        string calldata orderId,
        uint256 duration,
        uint256 reservePrice,
        uint256 minBidIncrement,
        string calldata ipfsHash
    ) external {
        escrow.createAuction(orderId, duration, reservePrice, minBidIncrement, ipfsHash);
    }

    function endAuction(string calldata orderId) external {
        escrow.endAuction(orderId);
    }

    function markShipped(string calldata orderId, string calldata trackingHash) external {
        escrow.markShipped(orderId, trackingHash);
    }

    receive() external payable {
        revert("RejectEther");
    }
}
