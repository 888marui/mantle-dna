// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DNAToken - ERC-20 reward token for genomic data contributors
contract DNAToken is ERC20, Ownable {
    address public minter;

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    constructor() ERC20("DNA Token", "DNAT") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
