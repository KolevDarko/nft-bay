const {expectRevert} = require('@openzeppelin/test-helpers');

const TokenMinter = artifacts.require('contracts/TokenMinter.sol');
const Auction = artifacts.require('contracts/AuctionManager.sol');
const moment = require('moment');

const TOKEN_URL = 'https://cryptodev.blog'

contract('Auction', (accounts) => {
  let auction, tokenMinter;
  const [owner, buyer] = [accounts[1], accounts[2]];

  beforeEach(async () => {
    auction = await Auction.new();
    tokenMinter = await TokenMinter.new();
  });

  it('should mint token', async () => {
    let results = await tokenMinter.mintItem(owner, TOKEN_URL);
    let tokenId = results.logs[0].args.tokenId.toString();
    assert(tokenId === '1', `first minted token id is not 1, it is ${tokenId}`);
  })

  it('should create auction', async () => {
    const minPrice = web3.utils.toWei('10');
    const endTimestamp = moment('2021-08-05T12:00:00');
    await tokenMinter.mintItem(owner, TOKEN_URL);
    await auction.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, 1, {from: owner});
    let firstAuction = await auction.auctionList(0);
    assert(firstAuction.seller === owner, 'owner not correct');
    assert(firstAuction.minPrice.toString() === minPrice.toString(), `min price not correct ${firstAuction.minPrice} vs ${minPrice}`);
    assert(firstAuction.tokenId.toString() === '1', `token id incorrect ${firstAuction.tokenId}`);
    assert(firstAuction.endTimestamp.toString() === endTimestamp.unix().toString(), 'timestamp incorrect');
    assert(firstAuction.token === tokenMinter.address, 'token address incorrect');
  });

  it('should not create auction with expiration in the past', async () => {
    const minPrice = web3.utils.toWei('10');
    const endTimestamp = moment('2021-01-05T12:00:00');
    await expectRevert(
        auction.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, 1),
        'auction end timestamp must be in future'
    )
  })

});
