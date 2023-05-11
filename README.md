# Cross-Chain Token Bridge

This is a smart contract that implements a cross-chain token bridge between Ethereum and Polygon (formerly Matic Network). The contract allows users to transfer tokens between the two chains in a trustless manner.

## How it works

The token bridge consists of two portal contracts, one on Ethereum and one on Polygon. To transfer tokens from one chain to the other, users initiate a cross-chain transfer by calling the `burn` function on the portal contract of the source chain, and providing the destination chain address, the amount of tokens to transfer, and a nonce (a unique identifier for the transfer). The portal contract on the source chain burns the tokens, emits a `CrossTransfer` event with the transfer details, and sends a message to the portal contract on the destination chain via a decentralized messaging protocol (e.g., Ethereum events). The destination portal contract receives the message, verifies the transfer details and the signature of the message sender, and mints the tokens to the destination address.

## Usage

To use the token bridge, you need to interact with the portal contracts directly using a wallet that supports the Ethereum and Polygon networks (e.g., MetaMask). Here are the steps to transfer tokens from Ethereum to Polygon:

1. Go to the Ethereum portal contract address and approve the contract to spend the amount of tokens you want to transfer.
2. Call the `burn` function on the Ethereum portal contract, passing the Polygon portal contract address, the amount of tokens to transfer (in wei), and a nonce (a unique identifier for the transfer).
3. Wait for the `CrossTransfer` event to be emitted on the Ethereum portal contract. This event contains the transfer details, including the destination address and the message signature.
4. Wait for the `CrossTransfer` event to be emitted on the Polygon portal contract. This event indicates that the tokens have been minted to the destination address on the Polygon network.

To transfer tokens from Polygon to Ethereum, follow the same steps, but call the `mint` function on the Polygon portal contract instead of the `burn` function.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## License

This project is licensed under the [MIT License](LICENSE).
