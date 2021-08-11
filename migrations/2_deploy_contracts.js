const AuctionManager = artifacts.require("AuctionManager");
const TokenMinter = artifacts.require("TokenMinter");

module.exports = function (deployer) {
  deployer.deploy(AuctionManager);
  deployer.deploy(TokenMinter);
};
