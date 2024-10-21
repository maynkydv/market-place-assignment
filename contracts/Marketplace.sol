// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;


// Uncomment this line to use console.log
import "hardhat/console.sol";

import {ERC20TokenContract} from "./ERC20Token.sol";
import {ERC721AssetsContract} from "./ERC721Assets.sol";
import {ERC1155AssetsContract} from "./ERC1155Assets.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MarketplaceContract is Ownable {

    struct Sale {
        address seller; //owner of the assets
        address erc721Contract; //ERC721  or even token
        address erc1155Contract; //ERC1155 or even token
        uint256 assetsId;
        uint256 quantity; // for ERC721, quatity should be equal to 1
        uint256 price;
        address paymentToken; //in case of zero price is in Eth
    }

    constructor () Ownable(msg.sender) {}

    mapping(bytes32 => Sale) public sales; // unique hash made out of sales creater, Assets contract, assetsId

    uint256 public constant marketplaceFee = 55; // 0.55%
    uint256 public constant feeDenominator = 10000; // Basis points 55*(10^(-4))
    
    function createSaleERC1155(
        address erc1155Contract, // ERC1155 contract Address
        uint256 assetsId,
        uint256 quantity,
        uint256 price,
        address paymentToken
    ) external {
        require(quantity > 0, "Quantity must be greater than zero");
        bytes32 saleId = keccak256(abi.encodePacked(msg.sender, erc1155Contract, assetsId));
        sales[saleId] = Sale(msg.sender,address(0), erc1155Contract, assetsId, quantity, price, paymentToken);
    }

    function createSaleERC721(
        address erc721Contract, // ERC721 contract Address
        uint256 assetsId,
        uint256 price,
        address paymentToken
    ) external {
        bytes32 saleId = keccak256(abi.encodePacked(msg.sender, erc721Contract, assetsId));
        console.logBytes32(saleId); // Correct method for logging bytes32
        sales[saleId] = Sale(msg.sender, erc721Contract , address(0), assetsId, 1, price, paymentToken);
        console.log("sale ==> %s %s %s", 
            sales[saleId].seller
        );
    }

    function buy(address seller,address erc721Contract,address erc1155Contract ,uint256 assetsId, uint256 quantity ) external payable {
        bytes32 saleId;
        if(erc1155Contract == address(0)){
            saleId = keccak256(abi.encodePacked(seller, erc721Contract, assetsId));
            console.logBytes32(saleId); 
        }
        else if(erc721Contract == address(0)){
            saleId = keccak256(abi.encodePacked(seller, erc1155Contract, assetsId));
            console.logBytes32(saleId);
        }
        else{
            revert("invalid erc contract address");
        }
        
        Sale storage sale = sales[saleId];

        console.log("sale ==> %s %s %s", 
        sales[saleId].seller
        );
        // console.log(saleId);
        
        require(sale.seller != address(0), "Sale does not exist");
        require(sale.quantity >= quantity, "Not enough assets on sale");
        uint256 totalPrice = sale.price * quantity;

        if (sale.paymentToken == address(0)) {
            require(msg.value >= totalPrice, "Incorrect ETH amount");
            _handleFeeTransfer(sale.seller, totalPrice);
        } else {
            //in ERC20TokenContract buyer need to approve the MarketPlace Contract 
            ERC20TokenContract(sale.paymentToken).transferFrom(msg.sender, address(this), totalPrice);
            uint256 fee = (totalPrice * marketplaceFee) / feeDenominator;
            ERC20TokenContract(sale.paymentToken).transfer(sale.seller, totalPrice - fee);
        }

        if (sale.quantity == quantity) {
            delete sales[saleId];
        } else {
            sale.quantity -= quantity;
        }

        if(erc1155Contract == address(0)){
            ERC721AssetsContract(sale.erc721Contract).safeTransferFrom(sale.seller, msg.sender, sale.assetsId);
        }
        else if(erc721Contract == address(0)){
            ERC1155AssetsContract(sale.erc1155Contract).safeTransferFrom(sale.seller, msg.sender, sale.assetsId, quantity, "");
        }
        else{
            revert("invalid erc contract addresses");
        }
    }

    function _handleFeeTransfer(address seller, uint256 totalPrice) internal {
        uint256 fee = (totalPrice * marketplaceFee) / feeDenominator;
        payable(seller).transfer(totalPrice - fee);
    }

    function withdrawFees(uint256 amount, address token) external onlyOwner { //token = address(0) for ETH
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            ERC20TokenContract(token).transfer(owner(), amount);
        }
    }
}

