import React, {useEffect, useState} from "react";
import {getWeb3, getAuction} from "./utils.js";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [auction, setAuction] = useState(undefined);
  const [auctionList, setAuctionList] = useState([])

  useEffect(() => {
    const init = async () => {
      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const auction = await getAuction(web3);
      const auctions = await auction.methods.getAuctions().call();
      setWeb3(web3);
      setAccounts(accounts);
      setAuction(auction);
      setAuctionList(auctions);
    };
    init();
  }, []);

  if(
      typeof web3 === 'undefined'
      || typeof accounts === 'undefined'
      || typeof auction === 'undefined'
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      NftBay
    </div>
  );
}

export default App;
