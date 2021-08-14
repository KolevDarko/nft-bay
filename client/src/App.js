import React, {useEffect, useState} from "react";
import {getWeb3, getAuction} from "./utils.js";
import Header from './Header';
import NewAuction from './NewAuction';
import Sidebar from "./Sidebar";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [auctionManager, setAuctionManager] = useState(undefined);
  const [auctionList, setAuctionList] = useState([])

  useEffect(() => {
    const init = async () => {
      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const auction = await getAuction(web3);
      const auctions = await auction.methods.getAuctions().call();
      setWeb3(web3);
      setAccounts(accounts);
      setAuctionManager(auction);
      setAuctionList(auctions);
    };
    init();
  }, []);

  const createAuction = auction => {
    auctionManager.methods.createAuction(
        web3.utils.toWei(auction.minPrice),
        auction.endTimestamp,
        auction.tokenAddress,
        auction.tokenId
    ).send({from: accounts[0], gas: 3000000});
  }

  if (
      typeof web3 === 'undefined'
      || typeof accounts === 'undefined'
      || typeof auctionManager === 'undefined'
  ) {
    return <div>Loading...</div>;
  }

  return (
      <div id='App'>
        <h1>Nft(e)Bay</h1>
        <Header
            auctions={auctionList}
        />
        <main className="container-fluid">
          <div className="row">
            <div className="col-sm-4 first-col">
              <Sidebar />
            </div>
            <div className="col-sm-8">
              <h3>Main Section</h3>
              <NewAuction createAuction={createAuction}/>
            </div>
          </div>
        </main>
      </div>
);
}

export default App;
