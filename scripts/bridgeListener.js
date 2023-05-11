const { ethers } = require("hardhat");

const ethereumPortalAddress = "0x123..."; // Address of Ethereum portal contract
const polygonPortalAddress = "0x456..."; // Address of Polygon portal contract

async function main() {
  // Get the contract instances
  const ethereumPortal = await ethers.getContractAt(
    "EthereumPortal",
    ethereumPortalAddress
  );
  const polygonPortal = await ethers.getContractAt(
    "PolygonPortal",
    polygonPortalAddress
  );

  // Listen for the CrossTransfer event on the Ethereum portal contract
  ethereumPortal.on(
    "CrossTransfer",
    async (sender, receiver, amount, timestamp, nonce, signature, status) => {
      if (status == 0) {
        // Burn event, so initiate a mint on the Polygon portal contract
        const tx = await polygonPortal.mint(
          sender,
          receiver,
          amount,
          nonce,
          signature
        );
        console.log(`Mint transaction submitted: ${tx.hash}`);
      } else if (status == 1) {
        // Mint event, so initiate a burn on the Polygon portal contract
        const tx = await polygonPortal.burn(amount, nonce, signature);
        console.log(`Burn transaction submitted: ${tx.hash}`);
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
