const {expectRevert} = require('@openzeppelin/test-helpers');

const TokenMinter = artifacts.require('contracts/TokenMinter.sol');
const Auction = artifacts.require('contracts/AuctionManager.sol');
const moment = require('moment');

const TOKEN_URL = 'https://cryptodev.blog'

contract('Auction', (accounts) => {
  let auctionManager, tokenMinter;
  const [owner, buyer] = [accounts[1], accounts[2]];

  beforeEach(async () => {
    auctionManager = await Auction.new();
    tokenMinter = await TokenMinter.new();
  });

  it('should mint token', async () => {
    let results = await tokenMinter.mintItem(owner, TOKEN_URL);
    let tokenId = results.logs[0].args.tokenId.toString();
    assert(tokenId === '1', `first minted token id is not 1, it is ${tokenId}`);
  })

  const createAuction = async (options) => {
    options = options || {};
    const minPrice = options.minPrice || web3.utils.toWei('10');
    const endTimestamp = options.endTimestamp || moment('2021-08-05T12:00:00');
    await tokenMinter.mintItem(owner, TOKEN_URL);
    const tokenId = 1;
    const creator = options.creator || owner;
    return auctionManager.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, tokenId, {from: creator});
  }

  it('should create auction', async () => {
    const minPrice = web3.utils.toWei('10');
    const endTimestamp = moment('2021-08-05T12:00:00');
    await tokenMinter.mintItem(owner, TOKEN_URL);
    const tokenId = 1;
    await auctionManager.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, tokenId, {from: owner});
    let firstAuction = await auctionManager.auctionList(0);
    assert(firstAuction.seller === owner, 'owner not correct');
    assert(firstAuction.minPrice.toString() === minPrice.toString(), `min price not correct ${firstAuction.minPrice} vs ${minPrice}`);
    assert(firstAuction.tokenId.toString() === tokenId.toString(), `token id incorrect ${firstAuction.tokenId}`);
    assert(firstAuction.endTimestamp.toString() === endTimestamp.unix().toString(), 'timestamp incorrect');
    assert(firstAuction.token === tokenMinter.address, 'token address incorrect');
  });

  it('should not create auction with expiration in the past', async () => {
    const minPrice = web3.utils.toWei('10');
    const endTimestamp = moment('2021-01-05T12:00:00');
    await expectRevert(
        auctionManager.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, 1),
        'auction end timestamp must be in future'
    )
  })

  const advanceBlockAtTime = (time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            params: [time],
            id: new Date().getTime(),
          },
          (err, _) => {
            if (err) {
              return reject(err);
            }
            const newBlockHash = web3.eth.getBlock("latest").hash;
            return resolve(newBlockHash);
          },
      );
    });
  };

  it('should not place bid if incorrect amount provided', async () => {
    await createAuction();
    let firstAuction = await auctionManager.auctionList(0);
    const amount = web3.utils.toWei('10');
    const amountValue = web3.utils.toWei('9');
    await expectRevert(
        auctionManager.placeBid(firstAuction.id, amount, buyer, {from: buyer, value: amountValue}),
        'you have not send equal amount of ether'
    )
  });

  it('should not place bid if amount smaller than min price', async () => {
    const endTimestamp = moment().add(50, 'minutes');
    const minPrice = web3.utils.toWei('10');
    await createAuction({endTimestamp: endTimestamp, minPrice: minPrice});
    let firstAuction = await auctionManager.auctionList(0);
    const amountBid = web3.utils.toWei('9');
    await expectRevert(
        auctionManager.placeBid(firstAuction.id, amountBid, buyer, {from: buyer, value: amountBid}),
        'your bid is smaller than minPrice set by seller'
    );
  });

});
