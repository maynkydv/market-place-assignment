// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721AssetsContract is ERC721, Ownable {
    uint256 internal erc721AssetCounter;
    // Unwanted
    mapping(uint256 => uint256) public assetPrices;

    constructor() ERC721("Assets721", "AST721") Ownable(msg.sender) {
        erc721AssetCounter = 0 ;
    }

    function mint() external{
        erc721AssetCounter += 1;
        _mint(msg.sender, erc721AssetCounter); 
    }

    // Unwanted
    function setPrice(uint256 assetId, uint256 price) external {
        require(ownerOf(assetId) == msg.sender, "only asset owner can set price");
        assetPrices[assetId] = price;
    }
}
