pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ad is ERC721, Ownable {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct AdvertisingPeriod {
        uint256 startTime;
        uint256 endTime;
    }
    
    mapping (uint256 => AdvertisingPeriod) public advertisingPeriods;
    mapping (uint256 => string) public metadata;

    event AdSlotCreated(uint256 indexed tokenId, address indexed tokenOwner, uint256 indexed startTime, uint256 endTime);
    
    constructor() public ERC721("FuzzyAds", "FUZZY") {}
    
    function createAd(uint64 startTime, uint64 endTime, string memory tokenURI) public onlyOwner {
        require(startTime > now, "Token must have start time in the future.");
        require(startTime < endTime, "Start time must be lower than End time.");

        _tokenIds.increment();
        
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        advertisingPeriods[newTokenId] = AdvertisingPeriod(startTime, endTime);
        
        emit AdSlotCreated(newTokenId, msg.sender, startTime, endTime);
    }

    function getMetadata(uint tokenId) public view returns(string memory){
        return metadata[tokenId];
    }

    function setMetadata(uint256 tokenId, string memory ipfsHash) public {
        if(msg.sender == ownerOf(tokenId)){
            metadata[tokenId] = ipfsHash;
        }
    }
}