import React from "react";
import NewAuction from "./NewAuction";
import AuctionList from "./AuctionList";
import Sidebar from "./Sidebar";
import {BrowserRouter, Route, Switch} from "react-router-dom";

function App({web3, accounts, auctionManager}) {
  const activeAccount = accounts[0];
  console.log('Total accounts are', accounts.length);
  return (
      <BrowserRouter>
        <div id="app">
          <h1>Nft(e)Bay</h1>
          <main className="container-fluid">
            <div className="row">
              <div className="col-sm-4">
                <Sidebar/>
              </div>
              <div className="col-sm-8">
                <Switch>
                  <Route path="/new-auction">
                    <NewAuction auctionManager={auctionManager} web3={web3} activeAccount={activeAccount}/>
                  </Route>
                  <Route path="/">
                    <AuctionList auctionManager={auctionManager} web3={web3} activeAccount={activeAccount}/>
                  </Route>
                </Switch>
              </div>
            </div>
          </main>
        </div>
      </BrowserRouter>
  );
}

export default App;
