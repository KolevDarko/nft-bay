import React, {useEffect, useState} from 'react';
import ERC721 from './contracts/ERC721.json';

const moment = require('moment');

function AuctionList({auctionManager, web3, activeAccount}) {
  const [auctionDataList, setAuctionDataList] = useState([]);
  const [myBid, setMyBid] = useState(0);
  const [listener, setListener] = useState(undefined);
  const [auctionIds, setAuctionIds] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      const auctions = await auctionManager.methods.getAuctions().call();
      const auctionFullData = await getFullAuctionData(auctions);
      const auctionIds = new Set(auctions.map((auction) => (auction.id)));
      setAuctionIds(auctionIds);
      setAuctionDataList(auctionFullData);
      listenToAuctions(auctionIds);
    };
    init();
  }, [], () => {
    listener.unsubscribe();
  });

  const getFullAuctionData = async (auctions) => {
    return Promise.all(auctions.map(async (auction) => {
      let nftContract = new web3.eth.Contract(
          ERC721.abi,
          auction.token
      );
      const tokenUrl = await nftContract.methods.tokenURI(Number.parseInt(auction.tokenId)).call();
      const tokenName = await nftContract.methods.name().call();
      const metadata = {name: 'dare', description: 'asdf'}
      const minBidEth = web3.utils.fromWei(auction.minPrice, 'ether');
      const bestBidEth = web3.utils.fromWei(auction.bestBid.amount, 'ether');
      return {
        tokenUrl: tokenUrl,
        tokenName: tokenName,
        auction: auction,
        metadata: metadata,
        minBidEth: minBidEth,
        bestBidEth: bestBidEth,
        bestBidder: auction.bestBid.buyer,
        endsOn: formatTimestamp(auction.endTimestamp)
      }
    }));
  }

  const listenToAuctions = (auctionIds) => {
    const listener = auctionManager.events.AuctionCreated(
        {
          fromBlock: 0
        })
        .on('data', async (newAuction) => {
          console.log('NEW AUCTION');
          if (auctionIds.has(newAuction.returnValues.auctionId)) return;
          debugger;
          auctionIds.add(newAuction.returnValues.auctionId);
          setAuctionIds(auctionIds);
          let nftContract = new web3.eth.Contract(
              ERC721.abi,
              newAuction.returnValues.tokenAddress
          );
          let auction = await auctionManager.methods.auctionList(newAuction.returnValues.auctionId).call();
          const tokenUrl = await nftContract.methods.tokenURI(Number.parseInt(auction.tokenId.toString())).call();
          const tokenName = await nftContract.methods.name().call();
          const metadata = {name: 'dare', description: 'asdf2'}
          const minBidEth = web3.utils.fromWei(auction.minPrice, 'ether');
          const bestBidEth = web3.utils.fromWei(auction.bestBid.amount, 'ether');
          let newAuctionData = {
            tokenUrl: tokenUrl,
            tokenName: tokenName,
            auction: auction,
            metadata: metadata,
            minBidEth: minBidEth,
            bestBidder: auction.bestBid.buyer,
            bestBidEth: bestBidEth,
            endsOn: formatTimestamp(auction.endTimestamp)
          }
          setAuctionDataList(auctionDataList => ([...auctionDataList, newAuctionData]));
        });
    setListener(listener);
  }

  const formatTimestamp = (timestamp) => {
    return moment(Number.parseInt(timestamp) * 1000).toString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auctionId = Number.parseInt(e.target.dataset.auctionId);
    const bidAmount = web3.utils.toWei(myBid);
    await auctionManager.methods.placeBid(auctionId, bidAmount, activeAccount).send({
      from: activeAccount,
      value: bidAmount
    });
  }

  const handleClaimAuction = async (e) => {
    e.preventDefault();
    const auctionId = Number.parseInt(e.target.dataset.auctionId);
    await auctionManager.methods.claimAuction(auctionId).send({from: activeAccount});
  }

  const userCanClaimAuction = async (auctionId) => {
    const auction = await auctionManager.methods.auctionList(auctionId).call();
    const auctionEnd = moment(Number.parseInt(auction.endTimestamp) * 1000);
    return auctionEnd < moment() && (auction.seller === activeAccount || auction.bestBid.buyer === activeAccount)
  }

  return (
      <div>
        <h2>Auction List</h2>
        <div className="row">
          {auctionDataList.map((auctionData) => (
              <div className="card col-md-5" key={auctionData.auction.id}>
                <h2 className="card-title">
                  Auction #{auctionData.auction.id} - {auctionData.metadata.name}
                </h2>
                <img width="200px" className="card-img-top"
                     src="https://res.cloudinary.com/nifty-gateway/image/upload/v1613918640/A/TrevorJones/The_Bitcoin_Angel_Open_Edition_2_dzsp3b.jpg"
                     alt="token image"/>
                <div className="card-body">
                  <div className="info-title">
                    {auctionData.metadata.name} #{auctionData.auction.tokenId}
                  </div>
                  <div className="info-title">
                    <span>{auctionData.metadata.description}</span>
                  </div>
                  <div className="info">
                    <span>Min Bid: {auctionData.minBidEth} ETH</span>
                  </div>
                  <div className="info">
                    <span>Best Bid: {auctionData.bestBidEth} ETH. Bidder: {auctionData.bestBidder}</span>
                  </div>
                  <div className="info">
                    <span>Ends On: {auctionData.endsOn}</span>
                  </div>
                  <div className="info">
                    <span>URL: {auctionData.tokenUrl}</span>
                  </div>
                  <div className="info">
                    <span>Token address: {auctionData.auction.token}</span>
                  </div>
                  {auctionData.auction.claimed ? (<h2>Auction finished</h2>) : (
                  <form className="form-inline" onSubmit={handleSubmit} data-auction-id={auctionData.auction.id}>
                    <div className="form-group mx-sm-3 mb-2">
                      <label htmlFor="bidInput" className="sr-only">New Bid</label>
                      <input type="number" step="any" value={myBid} onChange={e => setMyBid(e.target.value)}
                             className="form-control" id="bidInput" placeholder="Bid in ETH"/>
                    </div>
                    <button type="submit" className="btn btn-primary mb-2">Place Bid</button>
                  </form>)}
                  {!auctionData.auction.claimed && userCanClaimAuction(auctionData.auction.id) ? (
                      <form className="form-inline" onSubmit={handleClaimAuction} data-auction-id={auctionData.auction.id}>
                        <div className="form-group mb-2">
                          <button type="submit" className="btn btn-success mb-2">Claim Auction</button>
                        </div>
                      </form>) : null}
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}

export default AuctionList;
