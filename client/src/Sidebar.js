import React from "react";
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
      <div id="sidebar" className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-light" style={{width: "280px"}}>
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              All Auctions
            </Link>
          </li>
          <li>
            <Link to="/new-auction" className="nav-link">
              New Auction
            </Link>
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
