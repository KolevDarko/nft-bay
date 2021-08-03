const {expectRevert} = require('@openzeppelin/test-helpers');

const TokenMinter = artifacts.require('contracts/TokenMinter.sol');
const Auction = artifacts.require('contracts/AuctionMaker.sol');


contract('Auction', (accounts) => {
  let auction, tokenMinter;
  const [owner, buyer] = [accounts[1], accounts[2]];

  beforeEach(async () => {
    auction = await Auction.new();
    tokenMinter = await TokenMinter.new();
  });

  it('should mint token', async () => {
    let results = await tokenMinter.mintItem(owner, 'https://fitlife.com.mk');
    let tokenId = results.logs[0].args.tokenId.toString();
    assert(tokenId === 1, 'first minted token id is not 1');
  })

  it('should create auction', )

});
