pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract AuctionMaker is ReentrancyGuard {

    struct Bid {
        address payable buyer;
        uint amount;
    }

    struct Auction {
        uint id;
        address payable seller;
        Bid bestBid;
        uint minPrice;
        uint endTimestamp;
        bool claimed;
    }

    Auction[] public auctionList;

    constructor(){}

    function createAuction(uint minPrice, uint endTimestamp) external returns(uint) {
        uint auctionId = auctionList.length;
        auctionList.push(Auction(
            auctionId,
            msg.sender,
            Bid(address(0), 0),
            minPrice,
            endTimestamp
        ));
        return auctionId;
    }

    function placeBid(uint auctionId, uint amount) nonReentrant external payable{
        require(auctionList[auctionId].endTimestamp > block.timestamp, 'auction finished');
        require(amount == msg.value, 'you have not send equal amount of ether');
        Auction a = auctionList[auctionId];
        require(amount >= a.minPrice, 'your bid is smaller than minPrice set by seller');
        require(amount > a.bestBid.amount, 'your bid is not higher than previous best bid');
        Bid prevBestBid = a.bestBid;
        a.bestBid = Bid(msg.sender, amount);
        if (prevBestBid != address(0)){
            refundBid(a.bestBid);
        }
    }

    function refundBid(Bid bid) private {
        (bool success, ) = bid.buyer.call.value(bid.amount)("");
        require(success, "Transfer failed.");
    }

    function getAuctionWinner(uint auctionId) public returns(address, uint){
        return (auctionList[auctionId].bestBid.buyer, auctionList[auctionId].bestBid.amount);
    }

    function claimAuction(uint auctionId) external {
        require(auctionList[auctionId].endTimestamp < block.timestamp, 'auction is not finished yet');
        require(auctionList[auctionId].bestBid.buyer == msg.sender, 'you did not win this auction');
//        transfer token to buyer
        Auction a = auctionList[auctionId];
        require(a.claimed == false, 'auction already claimed');
        a.claimed = true;
        auctionList[auctionId].seller.transfer(a.bestBid.amount);
    }
}
