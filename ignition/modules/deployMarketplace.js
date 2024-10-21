const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MarketplaceModule = buildModule("TokenModule", (m) => {
  const ERC20TokenContract = m.contract("ERC20TokenContract");
  const ERC721AssetsContract = m.contract("ERC20TokenContract");
  const ERC1155AssetsContract = m.contract("ERC20TokenContract");
  const MarketplaceContract = m.contract("ERC20TokenContract");


  return {ERC20TokenContract, ERC721AssetsContract, ERC1155AssetsContract, MarketplaceContract};
});

module.exports = MarketplaceModule;