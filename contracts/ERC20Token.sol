// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ERC20TokenContract is ERC20, Ownable {

    constructor() ERC20("Token", "TKN") Ownable(msg.sender) {
        uint256 initialSupply =10000;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount ) external onlyOwner{ 
        _mint(to,amount); 
    }
}