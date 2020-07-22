pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ad is ERC721, Ownable {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct AdMetadata {
        string ipfsHash;
        uint64 startingTime;
        uint64 expiryDate;
    }
    
    mapping (uint256 => AdMetadata) public adIdToMetadata;
    mapping (uint64 => uint256) public startingTimeToTokenId;
    
    constructor() public ERC721("FuzzyAds", "FUZZY") {}
    
    function createAd(uint64 startingTime, string memory tokenURI) public onlyOwner returns (uint256)
    {
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        
        startingTimeToTokenId[startingTime] = newItemId;
        adIdToMetadata[newItemId] = AdMetadata("{}", startingTime, startingTime + 1 days);
        
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        return newItemId;
    }
    function getAdMetadata(uint tokenId) public view returns(string memory){
        return adIdToMetadata[tokenId].ipfsHash;
    }
    
    function setAdMetadata(uint256 tokenId, string memory ipfsHash) public {
        if(msg.sender == ownerOf(tokenId)){
            adIdToMetadata[tokenId].ipfsHash = ipfsHash;
        }
    }
}