import Web3 from 'web3';
import AuctionManager from './contracts/AuctionManager.json';

const getWeb3 = () => {
  return new Web3('http://localhost:9545');
};

const getAuction = async web3 => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = AuctionManager.networs[networkId];
  return new web3.eth.Contract(
      AuctionManager.abi,
      deployedNetwork && deployedNetwork.address
  );
};

export { getWeb3, getAuction }
