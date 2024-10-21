const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Market Place Use case Testing", function() {
  let _ERC20, erc20TokenContract, erc20Owner;
  let _ERC721, erc721AssetsContract, erc721Owner;
  let _ERC1155, erc1155AssetsContract, erc1155Owner;
  let _Marketplace, marketplaceContract, marketplaceOwner;
  let user1, user2, user3 ;
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    [   
      erc20Owner, 
      erc721Owner, 
      erc1155Owner,
      marketplaceOwner, 
      user1, 
      user2, 
      user3
    ] = await ethers.getSigners();

    _ERC20 = await ethers.getContractFactory("ERC20TokenContract");
    erc20TokenContract = await _ERC20.connect(erc20Owner).deploy();
    await erc20TokenContract.waitForDeployment();

    _ERC721 = await ethers.getContractFactory("ERC721AssetsContract");
    erc721AssetsContract = await _ERC721.connect(erc721Owner).deploy();
    await erc721AssetsContract.waitForDeployment();

    _ERC1155 = await ethers.getContractFactory("ERC1155AssetsContract");
    erc1155AssetsContract = await _ERC1155.connect(erc1155Owner).deploy();
    await erc1155AssetsContract.waitForDeployment();

    _Marketplace = await ethers.getContractFactory("MarketplaceContract");
    marketplaceContract = await _Marketplace.connect(marketplaceOwner).deploy();
    await marketplaceContract.waitForDeployment();

    await erc20TokenContract.connect(erc20Owner).mint(user2.address, 500n);
  });

  describe("Buy Asset", function () {
    it("Should allow buyer to purchase ERC721 with ERC20", async function () {
      const assetsId = 1;
      const price = 20n;

      // Mint ERC721 asset to user1 {seller}
      await erc721AssetsContract.connect(user1).mint();

      // console.log(erc721AssetsContract.target);
      // user1 {seller} creates the sale
      await marketplaceContract.connect(user1).createSaleERC721(
        erc721AssetsContract.target, 
        assetsId, 
        price, 
        erc20TokenContract // to recieve value in ERC20 token
      );
      // console.log("erc721AssetsContract.target  working");

      //approve marketplace to tranferFrom ERC721 assets user1 to user2
      await erc721AssetsContract.connect(user1).approve(marketplaceContract.target, assetsId);

      //approve marketplace to tranferFrom ERC20 token assets user1 to user2
      await erc20TokenContract.connect(user2).approve(marketplaceContract.target, price);
      
      await marketplaceContract.connect(user2).buy(user1.address,erc721AssetsContract.target, zeroAddress, assetsId, 1);

      // Verify the ownership transfer
      expect(await erc721AssetsContract.ownerOf(assetsId)).to.equal(user2.address);
    });

  });
});






























//   it("Should allow buyer to purchase ERC1155 with ETH", async function () {
  //     const tokenId = 1;
  //     const quantity = 10;
  //     const price = ethers.utils.parseEther("0.5");
  //     const totalPrice = price.mul(quantity);

  //     // Mint ERC1155 asset to seller
  //     await erc1155.mint(seller.address, tokenId, quantity, "0x");

  //     // Seller creates the sale
  //     await marketplaceContract.connect(seller).createSaleERC1155(
  //       erc1155.address, 
  //       tokenId, 
  //       quantity, 
  //       price, 
  //       ethers.constants.AddressZero
  //     );

  //     // Buyer purchases the asset with ETH
  //     await marketplace.connect(buyer).buy(erc1155.address, tokenId, quantity, { value: totalPrice });

  //     // Verify the transfer of assets (ERC1155 balances)
  //     expect(await erc1155.balanceOf(buyer.address, tokenId)).to.equal(quantity);
  //   });
  // });
















// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("Marketplace Contract", function () {
//   let Marketplace, marketplace;
//   let ERC721AssetsContract, erc721;
//   let ERC1155AssetsContract, erc1155;
//   let ERC20TokenContract, erc20;
//   let owner, seller, buyer, paymentToken;

//   beforeEach(async function () {
//     // Get signers
//     [owner, seller, buyer] = await ethers.getSigners();

//     // Deploy ERC721 contract
//     const ERC721 = await ethers.getContractFactory("ERC721AssetsContract");
//     erc721 = await ERC721.deploy();
//     await erc721.deployed();

//     // Deploy ERC1155 contract
//     const ERC1155 = await ethers.getContractFactory("ERC1155AssetsContract");
//     erc1155 = await ERC1155.deploy();
//     await erc1155.deployed();

//     // Deploy ERC20 contract for payment
//     const ERC20 = await ethers.getContractFactory("ERC20TokenContract");
//     erc20 = await ERC20.deploy();
//     await erc20.deployed();

//     // Deploy Marketplace contract
//     Marketplace = await ethers.getContractFactory("Marketplace");
//     marketplace = await Marketplace.deploy();
//     await marketplace.deployed();
//   });

//   describe("Create ERC721 Sale", function () {
//     it("Should allow seller to create a sale for ERC721", async function () {
//       const tokenId = 1;
//       const price = ethers.utils.parseEther("1");

//       // Mint ERC721 asset to seller
//       await erc721.mint(seller.address, tokenId);

//       // Seller creates the sale
//       await erc721.connect(seller).approve(marketplace.address, tokenId);
//       await marketplace.connect(seller).createSaleERC721(
//         erc721.address, 
//         tokenId, 
//         1, 
//         price, 
//         ethers.constants.AddressZero
//       );

//       const saleId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
//         ["address", "address", "uint256"],
//         [seller.address, erc721.address, tokenId]
//       ));

//       const sale = await marketplace.sales(saleId);
//       expect(sale.seller).to.equal(seller.address);
//       expect(sale.assetsContractAddress).to.equal(erc721.address);
//       expect(sale.assetsId).to.equal(tokenId);
//       expect(sale.price).to.equal(price);
//     });
//   });

//   describe("Create ERC1155 Sale", function () {
//     it("Should allow seller to create a sale for ERC1155", async function () {
//       const tokenId = 1;
//       const quantity = 10;
//       const price = ethers.utils.parseEther("0.5");

//       // Mint ERC1155 asset to seller
//       await erc1155.mint(seller.address, tokenId, quantity, "0x");

//       // Seller creates the sale
//       await marketplace.connect(seller).createSaleERC1155(
//         erc1155.address, 
//         tokenId, 
//         quantity, 
//         price, 
//         ethers.constants.AddressZero
//       );

//       const saleId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(
//         ["address", "address", "uint256"],
//         [seller.address, erc1155.address, tokenId]
//       ));

//       const sale = await marketplace.sales(saleId);
//       expect(sale.seller).to.equal(seller.address);
//       expect(sale.assetsContractAddress).to.equal(erc1155.address);
//       expect(sale.assetsId).to.equal(tokenId);
//       expect(sale.quantity).to.equal(quantity);
//       expect(sale.price).to.equal(price);
//     });
//   });

//   describe("Buy Asset", function () {
//     it("Should allow buyer to purchase ERC721 with ETH", async function () {
//       const tokenId = 1;
//       const price = ethers.utils.parseEther("1");

//       // Mint ERC721 asset to seller
//       await erc721.mint(seller.address, tokenId);

//       // Seller creates the sale
//       await erc721.connect(seller).approve(marketplace.address, tokenId);
//       await marketplace.connect(seller).createSaleERC721(
//         erc721.address, 
//         tokenId, 
//         1, 
//         price, 
//         ethers.constants.AddressZero
//       );

//       // Buyer purchases the asset with ETH
//       await marketplace.connect(buyer).buy(erc721.address, tokenId, 1, { value: price });

//       // Verify the ownership transfer
//       expect(await erc721.ownerOf(tokenId)).to.equal(buyer.address);
//     });

//     it("Should allow buyer to purchase ERC1155 with ETH", async function () {
//       const tokenId = 1;
//       const quantity = 10;
//       const price = ethers.utils.parseEther("0.5");
//       const totalPrice = price.mul(quantity);

//       // Mint ERC1155 asset to seller
//       await erc1155.mint(seller.address, tokenId, quantity, "0x");

//       // Seller creates the sale
//       await marketplace.connect(seller).createSaleERC1155(
//         erc1155.address, 
//         tokenId, 
//         quantity, 
//         price, 
//         ethers.constants.AddressZero
//       );

//       // Buyer purchases the asset with ETH
//       await marketplace.connect(buyer).buy(erc1155.address, tokenId, quantity, { value: totalPrice });

//       // Verify the transfer of assets (ERC1155 balances)
//       expect(await erc1155.balanceOf(buyer.address, tokenId)).to.equal(quantity);
//     });
//   });

//   describe("Withdraw Fees", function () {
//     it("Should allow owner to withdraw marketplace fees", async function () {
//       const tokenId = 1;
//       const price = ethers.utils.parseEther("1");

//       // Mint ERC721 asset to seller
//       await erc721.mint(seller.address, tokenId);

//       // Seller creates the sale
//       await erc721.connect(seller).approve(marketplace.address, tokenId);
//       await marketplace.connect(seller).createSaleERC721(
//         erc721.address, 
//         tokenId, 
//         1, 
//         price, 
//         ethers.constants.AddressZero
//       );

//       // Buyer purchases the asset with ETH
//       await marketplace.connect(buyer).buy(erc721.address, tokenId, 1, { value: price });

//       // Owner withdraws fees
//       const marketplaceBalanceBefore = await ethers.provider.getBalance(owner.address);
//       await marketplace.connect(owner).withdrawFees(ethers.utils.parseEther("0.0055"), ethers.constants.AddressZero);
//       const marketplaceBalanceAfter = await ethers.provider.getBalance(owner.address);

//       expect(marketplaceBalanceAfter).to.be.gt(marketplaceBalanceBefore);
//     });
//   });
// });



