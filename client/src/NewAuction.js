import React, {useState} from 'react';
import ERC721 from "./contracts/ERC721.json";


function NewAuction({auctionManager, web3, activeAccount}) {
  const [auction, setAuction] = useState(undefined);

  const createAuction = async (auction) => {
    await auctionManager.methods.createAuction(
        web3.utils.toWei(auction.minPrice),
        auction.endTimestamp,
        auction.token,
        auction.tokenId
    ).send({from: activeAccount, gas: 3000000});
  }

  const approveToken = async (tokenAddress, tokenId) => {
    const nftContract = new web3.eth.Contract(
        ERC721.abi,
        tokenAddress
    );
    debugger;
    await nftContract.methods.approve(auctionManager._address, tokenId).send({from: activeAccount});
  }

  const submit = async (e) => {
    e.preventDefault();
    //First approve the token to be auctioned
    await approveToken(auction.token, auction.tokenId);
    //Then create the auction itself
    await createAuction(auction);
    console.log('Auction created')
  }

  const updateAuction = (e, field) => {
    const value = e.target.value;
    setAuction({...auction, [field]: value});
  }

  return (
      <div className="row col-md-7">
        <div className="card">
          <h2 className="card-title">
            Create Auction
          </h2>
          <div className="card-body">
            <form onSubmit={(e) => submit(e)}>
              <div className="form-group row">
                <label htmlFor="minPrice">Min Bid</label>
                <input className="form-control"
                       id="minPrice"
                       type="number"
                       step="any"
                       onChange={e => updateAuction(e, 'minPrice')}
                />
              </div>
              <div className="form-group row">
                <label htmlFor="endTimestamp">End Timestamp</label>
                <input className="form-control"
                       id="endTimestamp"
                       type="number"
                       onChange={e => updateAuction(e, 'endTimestamp')}
                />
              </div>
              <div className="form-group row">
                <label htmlFor="tokenAddress">Nft Contract Address</label>
                <input className="form-control"
                       id="tokenAddress"
                       type="text"
                       onChange={e => updateAuction(e, 'token')}
                />
              </div>
              <div className="form-group row">
                <label htmlFor="tokenId">Nft Token ID</label>
                <input className="form-control"
                       id="tokenId"
                       type="number"
                       onChange={e => updateAuction(e, 'tokenId')}
                />
              </div>
              <div className="row">
                <button type="submit" className="btn btn-success mt-4">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )

}

export default NewAuction;
