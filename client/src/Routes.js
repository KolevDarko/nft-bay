import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import NewAuction from "./NewAuction";
import AuctionList from "./AuctionList";

export const Routes = () => {
  return (
      <div>
        <Sidebar />
        <Switch>
          <Route exact path="/auctions" component={AuctionList} />
          <Route exact path="/">
            <Redirect to="/auctions" />
          </Route>
          <Route exact path="/create-auction" component={NewAuction} />
        </Switch>
      </div>
  );
};

export default Routes;
