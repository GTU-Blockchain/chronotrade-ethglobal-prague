// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TIME is ERC20, Ownable {
    // Address of the ChronoTrade contract that can mint tokens for new users
    address public chronoTradeContract;

    constructor() ERC20("TIME", "TIME") Ownable(msg.sender) {}

    // Set the ChronoTrade contract address
    function setChronoTradeContract(
        address _chronoTradeContract
    ) external onlyOwner {
        chronoTradeContract = _chronoTradeContract;
    }

    // Mint 24 TIME tokens to a new user (only callable by ChronoTrade contract)
    function mintForNewUser(address _user) external {
        require(
            msg.sender == chronoTradeContract,
            "Only ChronoTrade contract can mint for new users"
        );
        _mint(_user, 24 * 10 ** decimals()); // 24 TIME tokens with 18 decimals
    }

    // Mint additional tokens (only owner)
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
