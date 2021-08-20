pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AuctionManager is ReentrancyGuard {

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
        IERC721 token;
        uint tokenId;
        bool claimed;
    }

    Auction[] public auctionList;

    event AuctionCreated(address indexed seller, uint indexed auctionId, address indexed tokenAddress, uint tokenId);
    event AuctionClaimed(uint indexed auctionId, address indexed seller, address indexed bidder);
    event BidCreated(uint indexed auctionId, address indexed buyer, uint amount);
    event BidRefund(uint indexed auctionId, address indexed buyer, uint amount);

    constructor(){}

    function createAuction(uint minPrice, uint endTimestamp, address tokenAddress, uint tokenId) external returns(uint) {
        require(endTimestamp > block.timestamp, 'auction end timestamp must be in future');
        uint auctionId = auctionList.length;
        IERC721 tokenContract = IERC721(tokenAddress);
        auctionList.push(Auction(
            auctionId,
            payable(msg.sender),
            Bid(payable(address(0)), 0),
            minPrice,
            endTimestamp,
            tokenContract,
            tokenId,
            false
        ));
        emit AuctionCreated(msg.sender, auctionId, tokenAddress, tokenId);
        return auctionId;
    }

    function placeBid(uint auctionId, uint amount, address payable bidder) nonReentrant external payable{
        require(auctionList[auctionId].endTimestamp > block.timestamp, 'auction finished');
        require(amount == msg.value, 'you have not send equal amount of ether');
        Auction memory a = auctionList[auctionId];
        require(amount >= a.minPrice, 'your bid is smaller than minPrice set by seller');
        require(amount > a.bestBid.amount, 'your bid is not higher than previous best bid');
        Bid memory prevBestBid = a.bestBid;
        a.bestBid = Bid(bidder, amount);
        auctionList[auctionId] = a;
        if (prevBestBid.buyer != address(0)){
            refundBid(prevBestBid);
            emit BidRefund(auctionId, prevBestBid.buyer, prevBestBid.amount);
        }
        emit BidCreated(auctionId, bidder, amount);
    }

    function refundBid(Bid memory bid) private {
        bid.buyer.transfer(bid.amount);
    }

    function getAuctionWinner(uint auctionId) public returns(address, uint){
        return (auctionList[auctionId].bestBid.buyer, auctionList[auctionId].bestBid.amount);
    }

    function claimAuction(uint auctionId) external {
        require(auctionList[auctionId].endTimestamp < block.timestamp, 'auction is not finished yet');
        require(auctionList[auctionId].bestBid.buyer == msg.sender || auctionList[auctionId].seller == msg.sender,
            'you did not win this auction');
        require(auctionList[auctionId].claimed == false, 'auction already claimed');
        auctionList[auctionId].claimed = true;
        auctionList[auctionId].seller.transfer(auctionList[auctionId].bestBid.amount);
        auctionList[auctionId].token.safeTransferFrom(
            auctionList[auctionId].seller,
            auctionList[auctionId].bestBid.buyer,
            auctionList[auctionId].tokenId
        );
        emit AuctionClaimed(auctionId, auctionList[auctionId].seller, auctionList[auctionId].bestBid.buyer);
    }

    function getTime() public view returns (uint256) {
        return block.timestamp;
    }

    function getAuctions() public view returns(Auction[] memory) {
        return auctionList;
    }
}
