import React from "react";

function Header({auctions}) {

  return (
      <header>
        <ul>
          {auctions.map((auction) => (
              <li>ID: {auction.id}, MinPrice: {auction.minPrice}, Ending: {auction.endTimestamp}, Token: {auction.token}, TokenId: {auction.tokenId}</li>
          ))}
        </ul>
      </header>
  )
}

export default Header;
