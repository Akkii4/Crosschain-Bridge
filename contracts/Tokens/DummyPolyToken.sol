// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MockToken.sol";

contract DummyPolyToken is MockToken {
    constructor() MockToken("Dummy Polygon Token", "DPT") {}
}
