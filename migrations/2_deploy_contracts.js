const AuctionManager = artifacts.require("AuctionManager");
const TokenMinter = artifacts.require("TokenMinter");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(AuctionManager);
  const tokenMinter = await deployer.deploy(TokenMinter, 0);
  const tokenId = await tokenMinter.mintItem(accounts[0], 'https://api.niftygateway.com/palettetocanvasopen/11400010001');
  console.log(`New NFt minted with id ${tokenId}`);
};
