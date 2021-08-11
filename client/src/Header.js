import React from "react";

function Header({auctions}) {
  return (
      <header>
        <ul>
          <li>Auctions: {auctions.length} </li>
        </ul>
      </header>
  )
}

export default Header;
