import React from "react";

function Sidebar() {

  return (
      <div id="sidebar" className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-light" style={{width: "280px"}}>
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <a href="#" className="nav-link active" aria-current="page">
              Active Auctions
            </a>
          </li>
          <li>
            <a href="#" className="nav-link link-dark">
              New Auction
            </a>
          </li>
          <li>
            <a href="#" className="nav-link link-dark">
              My Auctions
            </a>
          </li>
          <li>
            <a href="#" className="nav-link link-dark">
              My Bids
            </a>
          </li>
        </ul>
      </div>
  )
}

export default Sidebar;
