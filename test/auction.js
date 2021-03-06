const {expectRevert} = require('@openzeppelin/test-helpers');
const timeMachine = require('ganache-time-traveler');

const TokenMinter = artifacts.require('contracts/TokenMinter.sol');
const Auction = artifacts.require('contracts/AuctionManager.sol');
const moment = require('moment');

const TOKEN_URL = 'https://cryptodev.blog'

contract('AuctionTiming', (accounts) => {
  let auctionManager, tokenMinter, snapshotId, currentTime;
  const [owner, buyer] = [accounts[1], accounts[2]];
  beforeEach(async () => {
    auctionManager = await Auction.new();
    tokenMinter = await TokenMinter.new();
    currentTime = await auctionManager.getTime();
    // console.log(`Before time is ${currentTime}`)
    let snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot['result'];
  });

  afterEach(async () => {
    await timeMachine.revertToSnapshot(snapshotId);
  })

  const createAuction = async (options) => {
    options = options || {};
    const minPrice = options.minPrice || web3.utils.toWei('1');
    const endTimestamp = options.endTimestamp || moment('2021-06-01T00:00:00+00:00');
    await tokenMinter.mintItem(owner, TOKEN_URL);
    const tokenId = 1;
    const creator = options.creator || owner;
    return auctionManager.createAuction(minPrice, endTimestamp.unix(), tokenMinter.address, tokenId, {from: creator});
  }


  it('should not place bid if auction has expired', async () => {
    const endTimestamp = moment(Number.parseInt(currentTime) * 1000 + 5000);
    console.log(`Auction end ts is ${endTimestamp.toISOString()}`);
    await createAuction({endTimestamp: endTimestamp});
    const firstAuction = await auctionManager.auctionList(0);
    assert(firstAuction.endTimestamp.toString() === endTimestamp.unix().toString(), 'timestamps dont match');
    const amountBid = web3.utils.toWei('9');
    await timeMachine.advanceTimeAndBlock(60 * 11);
    await expectRevert(
        auctionManager.placeBid(firstAuction.id, amountBid, buyer, {from: buyer, value: amountBid}),
        'auction finished'
    );
  });
})

contract('Auction', (accounts) => {
  let auctionManager, tokenMinter, snapshotId, currentTime;
  const [owner, buyer, buyer2] = [accounts[1], accounts[2], accounts[3]];

  beforeEach(async () => {
    auctionManager = await Auction.new();
    tokenMinter = await TokenMinter.new();
    let blockTs = await auctionManager.getTime();
    currentTime = moment(blockTs * 1000);
    // console.log(`Before time is ${currentTime}`)
    let snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot['result'];
  });

  afterEach(async () => {
    await timeMachine.revertToSnapshot(snapshotId);
  })

  it('should mint token', async () => {
    let results = await tokenMinter.mintItem(owner, TOKEN_URL);
    let tokenId = results.logs[0].args.tokenId.toString();
    assert(tokenId === '1', `first minted token id is not 1, it is ${tokenId}`);
  })

  const createAuction = async (options) => {
    options = options || {};
    const minPrice = options.minPrice || web3.utils.toWei('1');
    const endTimestamp = options.endTimestamp || moment('2021-06-01T00:01:00+00:00');
    await tokenMinter.mintItem(owner, TOKEN_URL);
    const tokenId = 1;
    await tokenMinter.approve(auctionManager.address, tokenId, {from: owner});
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

  it('should not place bid if incorrect amount provided', async () => {
    const endTimestamp = moment('2021-08-05T12:00:00');
    await createAuction({endTimestamp: endTimestamp});
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

  it('should place bid', async () => {
    const endTimestamp = moment('2021-07-01T00:00:00+00:00').add(10, 'minutes');
    await createAuction({endTimestamp: endTimestamp});
    let firstAuction = await auctionManager.auctionList(0);
    const amountBid = web3.utils.toWei('5');
    await auctionManager.placeBid(firstAuction.id, amountBid, buyer, {
      from: buyer,
      value: amountBid
    })
  })

  it('should not place bid if bid lower than prev bid', async () => {
    const endTimestamp = moment('2021-07-01T00:00:00+00:00').add(10, 'minutes');
    await createAuction({endTimestamp: endTimestamp});
    let firstAuction = await auctionManager.auctionList(0);
    assert.equal(firstAuction.bestBid.buyer.toString(), '0x0000000000000000000000000000000000000000');
    const amountBid = web3.utils.toWei('5');
    await auctionManager.placeBid(firstAuction.id, amountBid, buyer, {
      from: buyer,
      value: amountBid
    });
    firstAuction = await auctionManager.auctionList(0);
    assert.equal(firstAuction.bestBid.amount, amountBid);
    assert.equal(firstAuction.bestBid.buyer, buyer);
    const amountBidLower = web3.utils.toWei('4');
    await expectRevert(
        auctionManager.placeBid(firstAuction.id, amountBidLower, buyer, {
          from: buyer,
          value: amountBidLower
        }),
        'your bid is not higher than previous best bid'
    )
  })

  it('should refund previous bid if there is better one', async () => {
    const endTimestamp = moment('2021-07-01T00:00:00+00:00').add(10, 'minutes');
    await createAuction({endTimestamp: endTimestamp});
    let firstAuction = await auctionManager.auctionList(0);
    assert.equal(firstAuction.bestBid.buyer.toString(), '0x0000000000000000000000000000000000000000');
    const firstBidAmount = web3.utils.toWei('8');
    await auctionManager.placeBid(firstAuction.id, firstBidAmount, buyer, {
      from: buyer,
      value: firstBidAmount
    });
    firstAuction = await auctionManager.auctionList(0);
    assert.equal(firstAuction.bestBid.amount, firstBidAmount);
    assert.equal(firstAuction.bestBid.buyer, buyer);
    const secondBidAmount = web3.utils.toWei('19');
    auctionManager.placeBid(firstAuction.id, secondBidAmount, buyer2, {
      from: buyer2,
      value: secondBidAmount
    })
    firstAuction = await auctionManager.auctionList(0);
    assert.equal(firstAuction.bestBid.buyer, buyer2);
    assert.equal(firstAuction.bestBid.amount, secondBidAmount);
  })

  it('auction can not be claimed if not expired', async () => {
    const endTimestamp = moment('2021-09-01T00:00:00+00:00');
    await createAuction({endTimestamp: endTimestamp});
    let firstAuction = await auctionManager.auctionList(0);
    const firstBidAmount = web3.utils.toWei('8');
    await auctionManager.placeBid(firstAuction.id, firstBidAmount, buyer, {
      from: buyer,
      value: firstBidAmount
    });
    await expectRevert(
        auctionManager.claimAuction(firstAuction.id, {from: owner}),
        'auction is not finished yet'
    )
  });

  it('auction can be claimed by seller', async () => {
    await createAuction({endTimestamp: currentTime.add(10, 'minutes')});
    let firstAuction = await auctionManager.auctionList(0);
    const firstBidAmount = web3.utils.toWei('8');
    await auctionManager.placeBid(firstAuction.id, firstBidAmount, buyer, {
      from: buyer,
      value: firstBidAmount
    });
    await timeMachine.advanceTimeAndBlock(60 * 15);
    const firstBalance = await web3.eth.getBalance(owner);
    await auctionManager.claimAuction(firstAuction.id, {from: owner});
    let newOwner = await tokenMinter.ownerOf(firstAuction.tokenId);
    assert.equal(newOwner, buyer, 'buyer is not owner after claiming auction');
    const secondBalance = await web3.eth.getBalance(owner);
    assert.equal(Number.parseInt(secondBalance), Number.parseInt(firstBalance) + Number.parseInt(firstAuction.bestBid.amount), 'seller did not receive correct funds');
  })

});
