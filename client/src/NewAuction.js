import React, {useState} from 'react';


function NewAuction({createAuction}) {
  const [auction, setAuction] = useState(undefined);

  const submit = e => {
    e.preventDefault();
    createAuction(auction);
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
              <div className="form-group">
                <label htmlFor="tokenAddress">Nft Contract Address</label>
                <input className="form-control"
                       id="tokenAddress"
                       type="text"
                       onChange={e => updateAuction(e, 'tokenAddress')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tokenId">Nft Token ID</label>
                <input className="form-control"
                       id="tokenId"
                       type="number"
                       onChange={e => updateAuction(e, 'tokenId')}
                />
              </div>
              <div>
                <button type="submit" className="btn btn-success">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )

}

export default NewAuction;
