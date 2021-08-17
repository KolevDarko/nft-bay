pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./Counters.sol";


contract TokenMinter is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(uint startTokenId) ERC721("NftMinter", "NFT") {
        _tokenIds.start(startTokenId);
    }

    function mintItem(address receiver, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

}
