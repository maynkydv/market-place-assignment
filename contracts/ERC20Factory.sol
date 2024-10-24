// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20Factory is Ownable {
    using SafeERC20 for IERC20;

    enum Mode { None, FeeManager, ReferralManager }

    Mode public currentMode;

    uint256 public constant FEE_MANAGER_PERCENTAGE = 3; // 0.0003% * total supply
    uint256 public constant REFERRAL_MANAGER_PERCENTAGE = 2; // 0.0002% * total supply
    uint256 public constant PERCENTAGE_DENOMINATOR = 1000000; // 10^4 * 100 for %

    constructor() Ownable(msg.sender){
        currentMode = Mode.None;
    }

    function setMode(Mode mode) external onlyOwner {
        currentMode = mode;
    }

    function deployERC20(
        string memory name, 
        string memory symbol, 
        uint256 totalSupply
    ) external onlyOwner {
        // Calculate the fee based on the current mode
        uint256 fee = 0;
        if (currentMode == Mode.FeeManager) {
            fee = (totalSupply * FEE_MANAGER_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        } else if (currentMode == Mode.ReferralManager) {
            fee = (totalSupply * REFERRAL_MANAGER_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        }
                                                                        // owner or deployer
        ERC20Token newToken = new ERC20Token(name, symbol, totalSupply, msg.sender);

        // If a fee exists, transfer it to the factory contract as a fee recipient
        if (fee > 0) {
            newToken.safeTransfer(address(this), fee);
        }
    }
}

contract ERC20Token is ERC20 {

    constructor(
        string memory name, 
        string memory symbol, 
        uint256 totalSupply, 
        address deployer
    ) ERC20(name, symbol) {

        _mint(deployer, totalSupply);
    }

    function safeTransfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient address");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, to, amount);
    }
}





