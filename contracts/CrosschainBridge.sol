// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ICrossToken {
    function mint(address to, uint amount) external;

    function burn(address owner, uint amount) external;
}

contract CrosschainBridge is Ownable {
    address public admin;
    ICrossToken public crossToken;
    uint256 public nonce;
    mapping(uint256 => bool) public processedNonces;

    enum Process {
        Burn,
        Mint
    }
    event CrossTransfer(
        address sender,
        address reciever,
        uint256 tokenAmount,
        uint256 timestamp,
        uint256 nonce,
        Process indexed status
    );

    constructor(address _crossChainSupportedToken) {
        admin = msg.sender;
        crossToken = ICrossToken(_crossChainSupportedToken);
    }

    function burn(address to, uint256 amount) external {
        crossToken.burn(msg.sender, amount);
        emit CrossTransfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            nonce,
            Process.Burn
        );
        nonce++;
    }

    function mint(
        address to,
        uint256 amount,
        uint256 crossChainNonce
    ) external onlyOwner {
        require(
            processedNonces[crossChainNonce] == false,
            "Already transferred"
        );
        processedNonces[crossChainNonce] = true;
        crossToken.mint(to, amount);
        emit CrossTransfer(
            msg.sender,
            to,
            amount,
            block.timestamp,
            crossChainNonce,
            Process.Mint
        );
    }
}
