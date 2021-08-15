import React from 'react';


function AuctionList({auctionList}) {

  return (
      <div>
        <h2>Auction List</h2>
        <div className="row">
          {auctionList.map((auction) => (
              <div className="card">
                <h2 className="card-title">
                  Auction #{auction.id} - {auction.token.name}
                </h2>
                <div className="card-body">
                  <div className="info-title">
                    {auction.token.name} #{auction.tokenId}
                  </div>
                  <div className="info">
                    <span>Min Bid:</span>
                    <span>{auction.minPrice}</span>
                  </div>
                  <div className="info">
                    <span>Ending</span>
                    <span>{auction.endTimestamp}</span>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}

export default AuctionList;
