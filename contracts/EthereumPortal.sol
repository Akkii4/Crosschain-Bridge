// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./CrosschainBridge.sol";

contract EthereumPortal is CrosschainBridge {
    constructor(address nativeChainToken) CrosschainBridge(nativeChainToken) {}
}
