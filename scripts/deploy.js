const { ethers } = require("hardhat");

async function main() {
  // Deploy DummyEthToken contract
  const DummyEthToken = await ethers.getContractFactory("DummyEthToken");
  const dummyEthToken = await DummyEthToken.deploy();
  await dummyEthToken.deployed();
  console.log("DummyEthToken deployed to:", dummyEthToken.address);

  // Deploy DummyPolyToken contract
  const DummyPolyToken = await ethers.getContractFactory("DummyPolyToken");
  const dummyPolyToken = await DummyPolyToken.deploy();
  await dummyPolyToken.deployed();
  console.log("DummyPolyToken deployed to:", dummyPolyToken.address);

  // Deploy EthereumPortal contract
  const EthereumPortal = await ethers.getContractFactory("EthereumPortal");
  const ethereumPortal = await EthereumPortal.deploy(dummyEthToken.address);
  await ethereumPortal.deployed();
  console.log("EthereumPortal deployed to:", ethereumPortal.address);

  // Deploy PolygonPortal contract
  const PolygonPortal = await ethers.getContractFactory("PolygonPortal");
  const polygonPortal = await PolygonPortal.deploy(dummyPolyToken.address);
  await polygonPortal.deployed();
  console.log("PolygonPortal deployed to:", polygonPortal.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
