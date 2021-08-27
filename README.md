This is a Smart contract and decentralized Application(dApp) that allows anyone to create an auction for their NFT tokens in
a completely decentralized manner.

The Smart contracts live in the /contracts directory.
There is one main smart contract, AuctionManager and then there is also a sample TokenMinter for creating Nfts for testing.


The source code for the client dApp is contained in the /client directory.
It is a ReactJS application bootstrapped with create-react-app.

You need to run npm install separately, once in the root folder and second time in the client folder.

Deploy with: truffle migrate.

Run tests with: truffle test.

The default truffle config expects a blockchain node to be running on port 8545.
