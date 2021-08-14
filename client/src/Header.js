import React from "react";

function Header({auctions}) {

  return (
      <header id="header" className="card">
        <div className="row">
          <ul>
            {auctions.map((auction) => (
                <li>ID: {auction.id}, MinPrice: {auction.minPrice}, Ending: {auction.endTimestamp}, Token: {auction.token}, TokenId: {auction.tokenId}</li>
            ))}
          </ul>
        </div>
      </header>
  )
}

export default Header;
