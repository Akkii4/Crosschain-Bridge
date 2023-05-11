// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MockToken.sol";

contract DummyEthToken is MockToken {
    constructor() MockToken("Dummy Ethereum Token", "DET") {}
}
